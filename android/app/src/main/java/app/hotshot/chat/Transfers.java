package app.hotshot.chat;

import android.content.ContentResolver;
import android.content.Context;
import android.content.Intent;
import android.database.Cursor;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.media.MediaMetadataRetriever;
import android.net.Uri;
import android.os.Build;
import android.provider.DocumentsContract;
import android.util.Size;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;

import javax.net.ssl.HttpsURLConnection;

import org.json.JSONException;
import org.json.JSONObject;

/**
 * Moves file bytes between the laptop and Android's storage. Files go as they are, with no compression, and three at
 * a time, so many small files keep the link busy. A dropped connection resumes from where it stopped.
 */
final class Transfers {
    /** A file the user chose, not sent yet. */
    static final class Picked {
        final Uri uri;
        final String name;
        final long size;
        final String mime;
        final boolean durable;      // still readable after a restart, so it can wait here until the laptop asks

        Picked(Uri uri, String name, long size, String mime, boolean durable) {
            this.uri = uri;
            this.name = name;
            this.size = size;
            this.mime = mime;
            this.durable = durable;
        }
    }

    interface Sink {
        void emit(JSONObject event);
    }

    private static final int BUFFER = 1 << 20;
    private static final int TRIES = 6;
    private static final long TICK_MS = 150;
    private static final String CHAT_FILE = "HotShot-chat.json";

    private final Context ctx;
    private final ContentResolver cr;
    private final Prefs prefs;
    private final Sink sink;
    private final ExecutorService pool = Executors.newFixedThreadPool(3);
    private final ExecutorService saver = Executors.newSingleThreadExecutor();
    private final AtomicInteger running = new AtomicInteger();
    private final Set<String> active = ConcurrentHashMap.newKeySet();
    private final Set<String> cancelled = ConcurrentHashMap.newKeySet();
    final Map<String, Picked> picked = new ConcurrentHashMap<>();

    private static final class Cancelled extends IOException {
    }

    Transfers(Context ctx, Prefs prefs, Sink sink) {
        this.ctx = ctx.getApplicationContext();
        this.cr = ctx.getContentResolver();
        this.prefs = prefs;
        this.sink = sink;
    }

    private void began() {
        if (running.getAndIncrement() == 0) {
            try {
                ctx.startForegroundService(new Intent(ctx, TransferService.class));
            } catch (RuntimeException ignored) {
                // Android refuses this from the background; the transfer still runs while the process lives
            }
        }
    }

    private void ended() {
        if (running.decrementAndGet() == 0) {
            ctx.stopService(new Intent(ctx, TransferService.class));
        }
    }

    private void send(String type, String idKey, String id, Object... more) {
        try {
            JSONObject e = new JSONObject();
            e.put("t", type);
            e.put(idKey, id);
            for (int i = 0; i + 1 < more.length; i += 2) {
                e.put((String) more[i], more[i + 1]);
            }
            sink.emit(e);
        } catch (JSONException ignored) {
            // only ever built from strings and numbers
        }
    }

    private HttpsURLConnection open(String path) throws IOException {
        return Net.open(prefs.host(), prefs.port(), path, prefs.pin(), null, prefs.token());
    }

    private static void pause() {
        try {
            Thread.sleep(1000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }

    void cancel(String id) {
        if (active.contains(id)) {
            cancelled.add(id);
        }
    }

    // ── phone → laptop
    void upload(final String key, final String chat) {
        final Picked f = picked.get(key);
        if (f == null || !active.add(key)) {
            send("upfail", "key", key);
            return;
        }
        pool.execute(() -> {
            began();
            try {
                String fid = sendFile(key, chat, f);
                picked.remove(key);
                prefs.setLocal(fid, "s:" + f.uri);
                send("upok", "key", key, "id", fid);
            } catch (IOException | JSONException | RuntimeException e) {
                send("upfail", "key", key);
            } finally {
                active.remove(key);
                cancelled.remove(key);
                ended();
            }
        });
    }

    private String sendFile(String key, String chat, Picked f) throws IOException, JSONException {
        Thumb th = makeThumb(f);
        JSONObject req = new JSONObject();
        req.put("chat", chat);
        req.put("name", f.name);
        req.put("size", f.size);
        req.put("mime", f.mime);
        req.put("w", th == null ? 0 : th.w);
        req.put("h", th == null ? 0 : th.h);
        req.put("canHold", f.durable);
        JSONObject res = Net.call(open("/api/files"), "POST", req);
        if (res.getInt("_status") != 200) {
            throw new IOException("create failed");
        }
        String fid = res.getString("id");
        if (!res.optBoolean("hold")) {      // held: only the thumbnail goes now, the bytes when the laptop asks
            sendBytes(key, fid, f, 0);
        }
        if (th != null) {
            HttpsURLConnection c = open("/api/files/" + fid + "/thumb");
            c.setRequestMethod("PUT");
            c.setDoOutput(true);
            c.setFixedLengthStreamingMode(th.jpeg.length);
            try (OutputStream o = c.getOutputStream()) {
                o.write(th.jpeg);
            }
            c.getResponseCode();
        }
        if (Net.call(open("/api/files/" + fid + "/done"), "POST", null).getInt("_status") != 200) {
            throw new IOException("finish failed");
        }
        return fid;
    }

    private void sendBytes(String key, String fid, Picked f, long off) throws IOException {
        for (int attempt = 1; ; attempt++) {
            try {
                putBytes(key, fid, f, off);
                return;
            } catch (Cancelled e) {
                Net.call(open("/api/files/" + fid), "DELETE", null);
                throw e;
            } catch (IOException e) {
                if (attempt >= TRIES) {
                    throw e;
                }
                pause();
                off = Net.call(open("/api/files/" + fid + "/status"), "GET", null).optLong("received", off);
            }
        }
    }

    /** The laptop asked for a file this phone has been holding. */
    void push(final String fid, final String name, final String mime, final long size) {
        final String local = prefs.local(fid);
        if (!active.add(fid)) {
            return;
        }
        pool.execute(() -> {
            began();
            try {
                if (local == null) {
                    throw new IOException("not on this phone");
                }
                Picked f = new Picked(Uri.parse(local.substring(2)), name, size, mime, true);
                long off = Net.call(open("/api/files/" + fid + "/status"), "GET", null).optLong("received", 0);
                sendBytes(fid, fid, f, off);
                if (Net.call(open("/api/files/" + fid + "/done"), "POST", null).optInt("_status") != 200) {
                    throw new IOException("finish failed");
                }
            } catch (Cancelled e) {
                // the laptop stopped it and already knows
            } catch (IOException | RuntimeException e) {
                try {
                    Net.call(open("/api/files/" + fid + "/failed"), "POST", null);
                } catch (IOException | RuntimeException ignored) {
                    // the laptop notices the phone is gone by itself
                }
            } finally {
                active.remove(fid);
                cancelled.remove(fid);
                ended();
            }
        });
    }

    private void putBytes(String key, String fid, Picked f, long off) throws IOException {
        HttpsURLConnection c = open("/api/files/" + fid + "/data?offset=" + off);
        c.setRequestMethod("PUT");
        c.setDoOutput(true);
        c.setFixedLengthStreamingMode(f.size - off);
        try (InputStream in = cr.openInputStream(f.uri)) {
            if (in == null) {
                throw new IOException("cannot read file");
            }
            long skip = off;
            while (skip > 0) {
                long k = in.skip(skip);
                if (k <= 0) {
                    throw new IOException("cannot seek");
                }
                skip -= k;
            }
            byte[] buf = new byte[BUFFER];
            long sent = off;
            long last = 0;
            try (OutputStream out = c.getOutputStream()) {
                while (sent < f.size) {
                    if (cancelled.contains(key)) {
                        throw new Cancelled();
                    }
                    int n = in.read(buf, 0, (int) Math.min(BUFFER, f.size - sent));
                    if (n < 0) {
                        throw new IOException("file shrank");
                    }
                    out.write(buf, 0, n);
                    sent += n;
                    long now = System.currentTimeMillis();
                    if (now - last > TICK_MS) {
                        last = now;
                        send("up", "key", key, "bytes", sent);
                    }
                }
            }
        }
        if (c.getResponseCode() != 200) {
            throw new IOException("server refused data");
        }
        c.getInputStream().close();
    }

    // ── laptop → phone
    void download(final String fid, final String chat, final String name, final String mime, final long size) {
        if (!active.add(fid)) {
            return;
        }
        pool.execute(() -> {
            began();
            try {
                Uri doc = fetchFile(fid, chat, name, mime, size);
                prefs.setLocal(fid, "d:" + doc);
                send("downok", "id", fid);
                try {
                    Net.call(open("/api/files/" + fid + "/got"), "POST", null);
                } catch (IOException ignored) {
                    // only the sender's delivery tick is lost
                }
            } catch (Cancelled e) {
                send("downfail", "id", fid, "cancelled", true);
            } catch (IOException | RuntimeException e) {
                send("downfail", "id", fid, "cancelled", false);
            } finally {
                active.remove(fid);
                cancelled.remove(fid);
                ended();
            }
        });
    }

    private Uri fetchFile(String fid, String chat, String name, String mime, long size) throws IOException {
        String folder = prefs.folder(chat);
        if (folder == null) {
            throw new IOException("no folder");
        }
        Uri tree = Uri.parse(folder);
        Uri parent = DocumentsContract.buildDocumentUriUsingTree(tree, DocumentsContract.getTreeDocumentId(tree));
        Uri doc = DocumentsContract.createDocument(cr, parent, mime, name);
        if (doc == null) {
            throw new IOException("cannot create file");
        }
        boolean ok = false;
        try (OutputStream out = cr.openOutputStream(doc, "w")) {
            if (out == null) {
                throw new IOException("cannot write file");
            }
            long[] got = new long[1];   // survives a failed attempt, so the next one resumes from there
            for (int attempt = 1; ; attempt++) {
                try {
                    pull(fid, got, size, out);
                    break;
                } catch (Cancelled e) {
                    throw e;
                } catch (IOException e) {
                    if (attempt >= TRIES) {
                        throw e;
                    }
                    pause();
                }
            }
            ok = true;
        } finally {
            if (!ok) {
                try {
                    DocumentsContract.deleteDocument(cr, doc);
                } catch (Exception ignored) {
                    // a half-written file is the most that can be left behind
                }
            }
        }
        return doc;
    }

    private void pull(String fid, long[] got, long size, OutputStream out) throws IOException {
        HttpsURLConnection c = open("/api/files/" + fid);
        boolean resuming = got[0] > 0;
        if (resuming) {
            c.setRequestProperty("Range", "bytes=" + got[0] + "-");
        }
        int status = c.getResponseCode();
        if (status != 200 && status != 206) {
            throw new IOException("server said " + status);
        }
        if (resuming && status != 206) {
            throw new IOException("no resume");
        }
        long last = 0;
        byte[] buf = new byte[BUFFER];
        try (InputStream in = c.getInputStream()) {
            int n;
            while ((n = in.read(buf)) > 0) {
                if (cancelled.contains(fid)) {
                    throw new Cancelled();
                }
                out.write(buf, 0, n);
                got[0] += n;
                long now = System.currentTimeMillis();
                if (now - last > TICK_MS) {
                    last = now;
                    send("down", "id", fid, "bytes", got[0], "size", size);
                }
            }
        }
        if (got[0] != size) {
            throw new IOException("short download");
        }
    }

    // ── each chat's folder also holds the chat's history
    private Uri findChatFile(Uri tree) {
        String parent = DocumentsContract.getTreeDocumentId(tree);
        Uri children = DocumentsContract.buildChildDocumentsUriUsingTree(tree, parent);
        String[] columns = {DocumentsContract.Document.COLUMN_DOCUMENT_ID, DocumentsContract.Document.COLUMN_DISPLAY_NAME};
        try (Cursor c = cr.query(children, columns, null, null, null)) {
            while (c != null && c.moveToNext()) {
                if (CHAT_FILE.equals(c.getString(1))) {
                    return DocumentsContract.buildDocumentUriUsingTree(tree, c.getString(0));
                }
            }
        }
        return null;
    }

    void saveChat(final String chat) {
        saver.execute(() -> {
            String folder = prefs.folder(chat);
            if (folder == null) {
                return;
            }
            try {
                HttpsURLConnection c = open("/api/chats/" + chat + "/export");
                if (c.getResponseCode() != 200) {
                    return;
                }
                Uri tree = Uri.parse(folder);
                Uri doc = findChatFile(tree);
                if (doc == null) {
                    Uri parent = DocumentsContract.buildDocumentUriUsingTree(tree, DocumentsContract.getTreeDocumentId(tree));
                    doc = DocumentsContract.createDocument(cr, parent, "application/json", CHAT_FILE);
                }
                if (doc == null) {
                    return;
                }
                try (InputStream in = c.getInputStream(); OutputStream out = cr.openOutputStream(doc, "wt")) {
                    if (out == null) {
                        return;
                    }
                    byte[] buf = new byte[64 << 10];
                    int n;
                    while ((n = in.read(buf)) > 0) {
                        out.write(buf, 0, n);
                    }
                }
            } catch (IOException | RuntimeException ignored) {
                // the next change writes it again
            }
        });
    }

    void dropChat(String chat) {
        final String folder = prefs.folder(chat);
        if (folder == null) {
            return;
        }
        saver.execute(() -> {
            try {
                Uri doc = findChatFile(Uri.parse(folder));
                if (doc != null) {
                    DocumentsContract.deleteDocument(cr, doc);
                }
            } catch (IOException | RuntimeException ignored) {
                // the folder itself is gone
            }
        });
    }

    // ── thumbnails: made here so the laptop never has to decode anything
    private static final class Thumb {
        byte[] jpeg;
        int w;
        int h;
    }

    private Thumb makeThumb(Picked f) {
        boolean image = f.mime != null && f.mime.startsWith("image/");
        boolean video = f.mime != null && f.mime.startsWith("video/");
        if (!image && !video) {
            return null;
        }
        Bitmap b = null;
        try {
            if (Build.VERSION.SDK_INT >= 29) {
                try {
                    b = cr.loadThumbnail(f.uri, new Size(512, 512), null);
                } catch (IOException ignored) {
                    // falls through to the older way below
                }
            }
            if (b == null) {
                b = image ? decodeSmall(f.uri) : videoFrame(f.uri);
            }
            if (b == null) {
                return null;
            }
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            b.compress(Bitmap.CompressFormat.JPEG, 72, out);
            Thumb t = new Thumb();
            t.jpeg = out.toByteArray();
            t.w = b.getWidth();
            t.h = b.getHeight();
            return t;
        } catch (IOException | RuntimeException e) {
            return null;
        }
    }

    private Bitmap decodeSmall(Uri uri) throws IOException {
        BitmapFactory.Options o = new BitmapFactory.Options();
        o.inJustDecodeBounds = true;
        try (InputStream in = cr.openInputStream(uri)) {
            BitmapFactory.decodeStream(in, null, o);
        }
        int sample = 1;
        while (Math.max(o.outWidth, o.outHeight) / sample > 1024) {
            sample *= 2;
        }
        BitmapFactory.Options d = new BitmapFactory.Options();
        d.inSampleSize = sample;
        try (InputStream in = cr.openInputStream(uri)) {
            return BitmapFactory.decodeStream(in, null, d);
        }
    }

    private Bitmap videoFrame(Uri uri) throws IOException {
        MediaMetadataRetriever r = new MediaMetadataRetriever();
        try {
            r.setDataSource(ctx, uri);
            return r.getFrameAtTime(1000000);
        } finally {
            r.release();
        }
    }
}
