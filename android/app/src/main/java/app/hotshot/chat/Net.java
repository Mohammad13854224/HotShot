package app.hotshot.chat;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.security.cert.CertificateException;
import java.security.cert.X509Certificate;

import javax.crypto.Mac;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;
import javax.crypto.spec.SecretKeySpec;
import javax.net.ssl.HttpsURLConnection;
import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;

import org.json.JSONException;
import org.json.JSONObject;

/** HTTPS to the laptop. Its self-signed certificate is trusted only if it matches the pin taken at pairing. */
final class Net {
    private static final int PAIR_ROUNDS = 150000;

    private Net() {
    }

    static String hex(byte[] b) {
        StringBuilder s = new StringBuilder(b.length * 2);
        for (byte x : b) {
            s.append(String.format("%02x", x & 0xff));
        }
        return s.toString();
    }

    static byte[] unhex(String h) {
        byte[] out = new byte[h.length() / 2];
        for (int i = 0; i < out.length; i++) {
            out[i] = (byte) Integer.parseInt(h.substring(i * 2, i * 2 + 2), 16);
        }
        return out;
    }

    static String sha256(byte[] data) {
        try {
            return hex(MessageDigest.getInstance("SHA-256").digest(data));
        } catch (GeneralSecurityException e) {
            throw new IllegalStateException(e);
        }
    }

    /** pin == null is used only while pairing: the certificate seen is recorded in seen[0] and proven by the code. */
    private static final class Pinned implements X509TrustManager {
        final String pin;
        final String[] seen;

        Pinned(String pin, String[] seen) {
            this.pin = pin;
            this.seen = seen;
        }

        @Override
        public void checkClientTrusted(X509Certificate[] chain, String authType) throws CertificateException {
            throw new CertificateException("no client certificates");
        }

        @Override
        public void checkServerTrusted(X509Certificate[] chain, String authType) throws CertificateException {
            if (chain == null || chain.length == 0) {
                throw new CertificateException("empty chain");
            }
            String fp = sha256(chain[0].getEncoded());
            if (seen != null) {
                seen[0] = fp;
            }
            if (pin != null && !pin.equals(fp)) {
                throw new CertificateException("certificate does not match the pin");
            }
        }

        @Override
        public X509Certificate[] getAcceptedIssuers() {
            return new X509Certificate[0];
        }
    }

    static HttpsURLConnection open(String host, int port, String path, String pin, String[] seen, String token)
            throws IOException {
        HttpsURLConnection c = (HttpsURLConnection) new URL("https://" + host + ":" + port + path).openConnection();
        try {
            SSLContext ctx = SSLContext.getInstance("TLS");
            ctx.init(null, new TrustManager[]{new Pinned(pin, seen)}, new SecureRandom());
            c.setSSLSocketFactory(ctx.getSocketFactory());
        } catch (GeneralSecurityException e) {
            throw new IOException(e);
        }
        c.setHostnameVerifier((name, session) -> true);     // the pin identifies the laptop; its IP changes
        c.setConnectTimeout(6000);
        c.setReadTimeout(30000);
        if (token != null) {
            c.setRequestProperty("Authorization", "Bearer " + token);
        }
        return c;
    }

    static byte[] readAll(InputStream in) throws IOException {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        byte[] buf = new byte[8192];
        int n;
        while ((n = in.read(buf)) > 0) {
            out.write(buf, 0, n);
        }
        return out.toByteArray();
    }

    /** Sends a small JSON request; returns the parsed answer, with the HTTP status under "_status". */
    static JSONObject call(HttpsURLConnection c, String method, JSONObject body) throws IOException {
        try {
            c.setRequestMethod(method);
            if (body != null) {
                byte[] data = body.toString().getBytes(StandardCharsets.UTF_8);
                c.setDoOutput(true);
                c.setRequestProperty("Content-Type", "application/json");
                c.setFixedLengthStreamingMode(data.length);
                try (OutputStream o = c.getOutputStream()) {
                    o.write(data);
                }
            }
            int status = c.getResponseCode();
            InputStream in = status >= 400 ? c.getErrorStream() : c.getInputStream();
            String text = in == null ? "" : new String(readAll(in), StandardCharsets.UTF_8);
            JSONObject out = text.startsWith("{") ? new JSONObject(text) : new JSONObject();
            out.put("_status", status);
            return out;
        } catch (JSONException e) {
            throw new IOException(e);
        }
    }

    private static byte[] pairKey(String code, String fp) throws GeneralSecurityException {
        PBEKeySpec spec = new PBEKeySpec(code.toCharArray(), unhex(fp), PAIR_ROUNDS, 256);
        return SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256").generateSecret(spec).getEncoded();
    }

    private static String pairMac(byte[] key, String role, String nonce, String fp) throws GeneralSecurityException {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(key, "HmacSHA256"));
        return hex(mac.doFinal((role + "|" + nonce + "|" + fp).getBytes(StandardCharsets.UTF_8)));
    }

    /** Both sides prove they hold the code and saw the same certificate. Returns null on a wrong code. */
    static String[] pair(String host, int port, String code, String device) throws IOException {
        try {
            String[] seen = new String[1];
            JSONObject hello = call(open(host, port, "/api/hello", null, seen, null), "GET", null);
            String fp = seen[0];
            if (fp == null || !"HotShot".equals(hello.optString("app"))) {
                throw new IOException("not our server");
            }
            byte[] rnd = new byte[16];
            new SecureRandom().nextBytes(rnd);
            String nonce = hex(rnd);
            byte[] key = pairKey(code, fp);
            JSONObject req = new JSONObject();
            req.put("nonce", nonce);
            req.put("device", device);
            req.put("proof", pairMac(key, "client", nonce, fp));
            JSONObject res = call(open(host, port, "/api/pair", fp, null, null), "POST", req);
            if (res.getInt("_status") != 200) {
                return null;
            }
            if (!pairMac(key, "server", nonce, fp).equals(res.optString("proof"))) {
                throw new IOException("server failed to prove itself");
            }
            return new String[]{fp, res.getString("token")};
        } catch (GeneralSecurityException | JSONException e) {
            throw new IOException(e);
        }
    }
}
