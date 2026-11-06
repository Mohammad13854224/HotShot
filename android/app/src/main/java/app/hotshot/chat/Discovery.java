package app.hotshot.chat;

import android.content.Context;
import android.net.wifi.WifiManager;

import java.io.IOException;
import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.net.InetSocketAddress;
import java.net.SocketAddress;
import java.nio.charset.StandardCharsets;

import org.json.JSONException;
import org.json.JSONObject;

/** Listens for the laptop's announcements, so the user never types an IP and a changed IP heals by itself. */
final class Discovery {
    interface Found {
        void onLaptop(String host, int port, String name);
    }

    private static final int PORT = 47801;
    private final Found found;
    private final WifiManager.MulticastLock lock;
    private volatile DatagramSocket socket;

    Discovery(Context ctx, Found found) {
        this.found = found;
        WifiManager wm = (WifiManager) ctx.getApplicationContext().getSystemService(Context.WIFI_SERVICE);
        lock = wm.createMulticastLock("hotshot:discovery");
        lock.setReferenceCounted(false);
    }

    void start() {
        if (socket != null) {
            return;
        }
        lock.acquire();
        new Thread(this::listen, "discovery").start();
    }

    void stop() {
        DatagramSocket s = socket;
        socket = null;
        if (s != null) {
            s.close();
        }
        if (lock.isHeld()) {
            lock.release();
        }
    }

    private void listen() {
        try {
            DatagramSocket s = new DatagramSocket((SocketAddress) null);
            s.setReuseAddress(true);
            s.setBroadcast(true);
            s.bind(new InetSocketAddress(PORT));
            socket = s;
            byte[] buf = new byte[1024];
            while (socket == s) {
                DatagramPacket p = new DatagramPacket(buf, buf.length);
                s.receive(p);
                try {
                    JSONObject o = new JSONObject(new String(p.getData(), 0, p.getLength(), StandardCharsets.UTF_8));
                    if ("HotShot".equals(o.optString("app"))) {
                        found.onLaptop(p.getAddress().getHostAddress(), o.optInt("port", 47800), o.optString("name"));
                    }
                } catch (JSONException ignored) {
                    // not one of ours
                }
            }
        } catch (IOException ignored) {
            // the socket was closed by stop(), or the port is taken; typing the address still works
        }
    }
}
