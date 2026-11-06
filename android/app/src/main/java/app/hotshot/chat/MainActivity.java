package app.hotshot.chat;

import android.Manifest;
import android.app.Activity;
import android.content.ClipData;
import android.content.ContentResolver;
import android.content.Intent;
import android.database.Cursor;
import android.net.Uri;
import android.net.http.SslCertificate;
import android.net.http.SslError;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.os.Parcelable;
import android.provider.DocumentsContract;
import android.provider.OpenableColumns;
import android.view.View;
import android.view.Window;
import android.webkit.CookieManager;
import android.webkit.JavascriptInterface;
import android.webkit.SslErrorHandler;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import javax.net.ssl.HttpsURLConnection;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

/**
 * The page comes from the laptop, so the app always matches it; this class adds what a page cannot do itself:
 * a pinned connection, Android's file and folder pickers, and fast transfers that survive a locked screen.
 */
public class MainActivity extends Activity {
    private static final int PICK_FILES = 1;
    private static final int PICK_FOLDER = 2;
    private static final String SETUP = "file:///android_asset/setup.html";

    private final Handler ui = new Handler(Looper.getMainLooper());
    private WebView web;
    private Prefs prefs;
    private Transfers transfers;
    private Discovery discovery;
    private boolean onApp;
    private volatile boolean probing;
    private String folderKey;
    private JSONArray sharedItems;

    private final Runnable retry = new Runnable() {
        @Override
        public void run() {
            if (!onApp && prefs.paired() && prefs.host() != null) {
                probe(prefs.host(), prefs.port());
            }
            ui.postDelayed(this, 3000);
        }
    };

    @Override
    protected void onCreate(Bundle state) {
        super.onCreate(state);
        prefs = new Prefs(this);
        transfers = new Transfers(this, prefs, this::emit);
        discovery = new Discovery(this, this::onLaptop);

        web = new WebView(this);
        setContentView(web);
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setAllowContentAccess(false);
        s.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        web.setNetworkAvailable(true);      // with mobile data off Android reports "offline", yet the hotspot works
        web.setWebChromeClient(new WebChromeClient());
        web.setWebViewClient(new Client());
        web.addJavascriptInterface(new Bridge(), "Native");

        if (Build.VERSION.SDK_INT >= 33) {
            requestPermissions(new String[]{Manifest.permission.POST_NOTIFICATIONS}, 0);
        }
        readShare(getIntent());
        web.loadUrl(SETUP);
    }

    @Override
    protected void onStart() {
        super.onStart();
        discovery.start();
        ui.post(retry);
    }

    @Override
    protected void onStop() {
        ui.removeCallbacks(retry);
        discovery.stop();
        super.onStop();
    }

    @Override
    protected void onDestroy() {
        web.destroy();
        super.onDestroy();
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        readShare(intent);
        flushShare();
    }

    @Override
    public void onBackPressed() {
        web.evaluateJavascript("window.goBack?window.goBack():false", v -> {
            if (!"true".equals(v)) {
                moveTaskToBack(true);
            }
        });
    }

    // ── talking to the page
    private void emit(JSONObject event) {
        final String js = "window.onNative&&window.onNative(" + event + ")";
        ui.post(() -> web.evaluateJavascript(js, null));
    }

    private void emit(String type, Object... more) {
        try {
            JSONObject e = new JSONObject();
            e.put("t", type);
            for (int i = 0; i + 1 < more.length; i += 2) {
                e.put((String) more[i], more[i + 1]);
            }
            emit(e);
        } catch (JSONException ignored) {
            // only ever built from strings and arrays
        }
    }

    /** The chosen theme can differ from the system's, so the system bars follow the page. */
    private void paintBars(boolean dark) {
        int color = dark ? 0xff212121 : 0xffffffff;
        Window w = getWindow();
        w.setStatusBarColor(color);
        w.setNavigationBarColor(color);
        View root = w.getDecorView();
        int flags = root.getSystemUiVisibility();
        int light = View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR | View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR;
        root.setSystemUiVisibility(dark ? flags & ~light : flags | light);
    }

    // ── finding the laptop
    private void onLaptop(String host, int port, String name) {
        if (prefs.paired()) {
            if (!onApp) {
                probe(host, port);
            }
        } else {
            emit("found", "host", host, "port", port, "name", name);
        }
    }

    private void probe(final String host, final int port) {
        if (probing) {
            return;
        }
        probing = true;
        new Thread(() -> {
            int status = 0;
            try {
                HttpsURLConnection c = Net.open(host, port, "/api/state", prefs.pin(), null, prefs.token());
                c.setConnectTimeout(2500);
                status = c.getResponseCode();
                c.disconnect();
            } catch (IOException ignored) {
                // not reachable right now, or not our laptop: the pin refused it
            }
            probing = false;
            final int code = status;
            ui.post(() -> {
                if (code == 200) {
                    loadApp(host, port);
                } else if (code == 401) {
                    forget();
                }
            });
        }, "probe").start();
    }

    private void loadApp(String host, int port) {
        if (onApp) {
            return;
        }
        onApp = true;
        prefs.setHost(host, port);
        String base = "https://" + host + ":" + port;
        CookieManager cm = CookieManager.getInstance();
        cm.setCookie(base, "sid=" + prefs.token() + "; Path=/; Secure; HttpOnly");
        cm.flush();
        web.loadUrl(base + "/");
    }

    private void showSetup() {
        if (onApp) {
            onApp = false;
            web.loadUrl(SETUP);
        }
    }

    private void forget() {
        prefs.unpair();
        CookieManager.getInstance().removeAllCookies(null);
        onApp = true;       // forces the reload even if we are on the setup page already
        showSetup();
    }

    private final class Client extends WebViewClient {
        @Override
        public void onReceivedSslError(WebView view, SslErrorHandler handler, SslError error) {
            // WebView cannot be told about a self-signed certificate, so the same pin is checked by hand here
            byte[] der = SslCertificate.saveState(error.getCertificate()).getByteArray("x509-certificate");
            if (der != null && Net.sha256(der).equals(prefs.pin())) {
                handler.proceed();
            } else {
                handler.cancel();
            }
        }

        @Override
        public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
            Uri u = request.getUrl();
            if ("https".equals(u.getScheme()) && u.getHost() != null && u.getHost().equals(prefs.host())) {
                return false;
            }
            if ("file".equals(u.getScheme())) {
                return false;
            }
            try {
                startActivity(new Intent(Intent.ACTION_VIEW, u));
            } catch (RuntimeException ignored) {
                // nothing on the phone can open this link
            }
            return true;
        }

        @Override
        public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
            if (request.isForMainFrame()) {
                showSetup();
            }
        }

        @Override
        public void onReceivedHttpError(WebView view, WebResourceRequest request, WebResourceResponse response) {
            if (request.isForMainFrame() && response.getStatusCode() == 401) {
                forget();
            }
        }
    }

    // ── pickers
    @Override
    protected void onActivityResult(int request, int result, Intent data) {
        super.onActivityResult(request, result, data);
        if (result != RESULT_OK || data == null) {
            return;
        }
        if (request == PICK_FILES) {
            List<Uri> uris = new ArrayList<>();
            ClipData clip = data.getClipData();
            if (clip != null) {
                for (int i = 0; i < clip.getItemCount(); i++) {
                    uris.add(clip.getItemAt(i).getUri());
                }
            } else if (data.getData() != null) {
                uris.add(data.getData());
            }
            for (Uri u : uris) {
                try {
                    getContentResolver().takePersistableUriPermission(u, Intent.FLAG_GRANT_READ_URI_PERMISSION);
                } catch (RuntimeException ignored) {
                    // still readable for now; it only cannot be reopened after a restart
                }
            }
            emit("picked", "items", describe(uris));
        } else if (request == PICK_FOLDER && data.getData() != null && folderKey != null) {
            Uri tree = data.getData();
            getContentResolver().takePersistableUriPermission(tree,
                    Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_WRITE_URI_PERMISSION);
            prefs.setFolder(folderKey, tree.toString());
            emit("folder", "key", folderKey, "label", label(tree.toString()));
        }
    }

    private JSONArray describe(List<Uri> uris) {
        JSONArray out = new JSONArray();
        ContentResolver cr = getContentResolver();
        for (Uri u : uris) {
            String name = "file";
            long size = -1;
            try (Cursor c = cr.query(u, null, null, null, null)) {
                if (c != null && c.moveToFirst()) {
                    int n = c.getColumnIndex(OpenableColumns.DISPLAY_NAME);
                    int z = c.getColumnIndex(OpenableColumns.SIZE);
                    if (n >= 0 && !c.isNull(n)) {
                        name = c.getString(n);
                    }
                    if (z >= 0 && !c.isNull(z)) {
                        size = c.getLong(z);
                    }
                }
            } catch (RuntimeException ignored) {
                // a provider without metadata; handled by the size check below
            }
            if (size < 0) {
                continue;       // the server must know the size up front
            }
            String mime = cr.getType(u);
            if (mime == null) {
                mime = "application/octet-stream";
            }
            String key = UUID.randomUUID().toString();
            transfers.picked.put(key, new Transfers.Picked(u, name, size, mime));
            try {
                JSONObject o = new JSONObject();
                o.put("key", key);
                o.put("name", name);
                o.put("size", size);
                o.put("mime", mime);
                out.put(o);
            } catch (JSONException ignored) {
                // only ever built from strings and numbers
            }
        }
        return out;
    }

    private static String label(String uri) {
        if (uri == null) {
            return "";
        }
        String id = DocumentsContract.getTreeDocumentId(Uri.parse(uri));
        int colon = id.indexOf(':');
        String path = colon >= 0 ? id.substring(colon + 1) : id;
        return path.isEmpty() ? "حافظه‌ی گوشی" : path;
    }

    // ── "share to" from other apps
    private void readShare(Intent intent) {
        if (intent == null) {
            return;
        }
        List<Uri> uris = new ArrayList<>();
        if (Intent.ACTION_SEND.equals(intent.getAction())) {
            Parcelable p = intent.getParcelableExtra(Intent.EXTRA_STREAM);
            if (p instanceof Uri) {
                uris.add((Uri) p);
            }
        } else if (Intent.ACTION_SEND_MULTIPLE.equals(intent.getAction())) {
            ArrayList<Parcelable> list = intent.getParcelableArrayListExtra(Intent.EXTRA_STREAM);
            if (list != null) {
                for (Parcelable p : list) {
                    if (p instanceof Uri) {
                        uris.add((Uri) p);
                    }
                }
            }
        }
        if (!uris.isEmpty()) {
            sharedItems = describe(uris);
        }
    }

    private void flushShare() {
        if (sharedItems != null && onApp) {
            emit("shared", "items", sharedItems);
            sharedItems = null;
        }
    }

    // ── what the page may call
    public final class Bridge {
        @JavascriptInterface
        public String getValue(String key) {
            return prefs.value(key);
        }

        @JavascriptInterface
        public void setValue(String key, String value) {
            prefs.setValue(key, value);
        }

        @JavascriptInterface
        public void theme(final boolean dark) {
            ui.post(() -> paintBars(dark));
        }

        @JavascriptInterface
        public void ready() {
            ui.post(MainActivity.this::flushShare);
        }

        @JavascriptInterface
        public void lost() {
            ui.post(MainActivity.this::showSetup);
        }

        @JavascriptInterface
        public boolean paired() {
            return prefs.paired();
        }

        @JavascriptInterface
        public void pair(final String host, final String port, final String code) {
            new Thread(() -> {
                try {
                    int p = Integer.parseInt(port);
                    String[] r = Net.pair(host, p, code, Build.MANUFACTURER + " " + Build.MODEL);
                    if (r == null) {
                        emit("pairfail", "why", "code");
                        return;
                    }
                    prefs.pair(host, p, r[0], r[1]);
                    ui.post(() -> loadApp(host, p));
                } catch (IOException | RuntimeException e) {
                    emit("pairfail", "why", "net");
                }
            }, "pair").start();
        }

        @JavascriptInterface
        public void unpair() {
            ui.post(MainActivity.this::forget);
        }

        @JavascriptInterface
        public void pickFiles() {
            Intent i = new Intent(Intent.ACTION_OPEN_DOCUMENT);
            i.addCategory(Intent.CATEGORY_OPENABLE);
            i.setType("*/*");
            i.putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true);
            i.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_PERSISTABLE_URI_PERMISSION);
            startActivityForResult(i, PICK_FILES);
        }

        @JavascriptInterface
        public void pickFolder(String key) {
            folderKey = key;
            Intent i = new Intent(Intent.ACTION_OPEN_DOCUMENT_TREE);
            i.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_WRITE_URI_PERMISSION
                    | Intent.FLAG_GRANT_PERSISTABLE_URI_PERMISSION);
            startActivityForResult(i, PICK_FOLDER);
        }

        @JavascriptInterface
        public String folderLabel(String key) {
            return label(prefs.folder(key));
        }

        @JavascriptInterface
        public void clearFolder(String key) {
            prefs.clearFolder(key);
        }

        @JavascriptInterface
        public void moveFolder(String from, String to) {
            String uri = prefs.folder(from);
            if (uri != null) {
                prefs.setFolder(to, uri);
                prefs.clearFolder(from);
            }
        }

        @JavascriptInterface
        public void upload(String key, String chat) {
            transfers.upload(key, chat);
        }

        @JavascriptInterface
        public void download(String fid, String chat, String name, String mime, String size) {
            transfers.download(fid, chat, name, mime, Long.parseLong(size));
        }

        @JavascriptInterface
        public void cancel(String id) {
            transfers.cancel(id);
        }

        @JavascriptInterface
        public boolean has(String fid) {
            return prefs.local(fid) != null;
        }

        @JavascriptInterface
        public void open(String fid) {
            String v = prefs.local(fid);
            if (v == null) {
                return;
            }
            Uri u = Uri.parse(v.substring(2));
            Intent i = new Intent(Intent.ACTION_VIEW);
            i.setDataAndType(u, getContentResolver().getType(u));
            i.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            try {
                startActivity(Intent.createChooser(i, null));
            } catch (RuntimeException ignored) {
                // nothing on the phone opens this type of file
            }
        }

        @JavascriptInterface
        public void removeLocal(String fid) {
            String v = prefs.local(fid);
            prefs.clearLocal(fid);
            if (v != null && v.startsWith("d:")) {      // never the original a file was sent from
                try {
                    DocumentsContract.deleteDocument(getContentResolver(), Uri.parse(v.substring(2)));
                } catch (Exception ignored) {
                    // the user already removed it
                }
            }
        }
    }
}
