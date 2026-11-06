package app.hotshot.chat;

import android.content.Context;
import android.content.SharedPreferences;

/** What the phone remembers: the paired laptop, each chat's folder and where each received file ended up. */
final class Prefs {
    private final SharedPreferences p;

    Prefs(Context c) {
        p = c.getSharedPreferences("hotshot", Context.MODE_PRIVATE);
    }

    boolean paired() {
        return token() != null;
    }

    String host() {
        return p.getString("host", null);
    }

    int port() {
        return p.getInt("port", 47800);
    }

    String pin() {
        return p.getString("pin", null);
    }

    String token() {
        return p.getString("token", null);
    }

    void setHost(String host, int port) {
        p.edit().putString("host", host).putInt("port", port).apply();
    }

    void pair(String host, int port, String pin, String token) {
        p.edit().putString("host", host).putInt("port", port).putString("pin", pin).putString("token", token).apply();
    }

    void unpair() {
        p.edit().remove("pin").remove("token").apply();
    }

    /** Settings of the page. They live here because the page's own storage is tied to the laptop's IP. */
    String value(String key) {
        return p.getString("v:" + key, null);
    }

    void setValue(String key, String value) {
        p.edit().putString("v:" + key, value).apply();
    }

    String folder(String chat) {
        return p.getString("f:" + chat, null);
    }

    void setFolder(String chat, String uri) {
        p.edit().putString("f:" + chat, uri).apply();
    }

    void clearFolder(String chat) {
        p.edit().remove("f:" + chat).apply();
    }

    /** Value is "d:uri" for a file we saved ourselves, "s:uri" for the original a file was sent from. */
    String local(String fid) {
        return p.getString("l:" + fid, null);
    }

    void setLocal(String fid, String value) {
        p.edit().putString("l:" + fid, value).apply();
    }

    void clearLocal(String fid) {
        p.edit().remove("l:" + fid).apply();
    }
}
