"""End-to-end test of the server as the phone sees it: real TLS, pairing, resume, range, live events, speed.

Run:  python tests/test_server.py
"""
import hashlib, hmac, http.client, json, os, re, secrets, shutil, socket, ssl, subprocess, sys, tempfile, threading, time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "desktop"))
import hotshot

LOCAL, LAN = 47899, 47900
tmp = tempfile.mkdtemp(prefix="hotshot-test-")
ok_count = 0


def check(cond, what):
    global ok_count
    if not cond:
        raise SystemExit(f"FAILED: {what}")
    ok_count += 1
    print("  ok ", what)


class Local:
    def __init__(self, url):
        self.cookie = None
        c = http.client.HTTPConnection("127.0.0.1", LOCAL)
        c.request("GET", url[url.index("/?"):])
        r = c.getresponse()
        r.read()
        check(r.status == 303, "launch link sets the local session")
        self.cookie = r.getheader("Set-Cookie").split(";")[0]

    def call(self, method, path, body=None, headers=None):
        c = http.client.HTTPConnection("127.0.0.1", LOCAL)
        h = {"Cookie": self.cookie, **(headers or {})}
        c.request(method, path, json.dumps(body) if isinstance(body, dict) else body, h)
        r = c.getresponse()
        data = r.read()
        return r.status, (json.loads(data) if data[:1] in (b"{", b"[") else data)


class Phone:
    def __init__(self, token=None):
        self.token = token
        self.ctx = ssl.SSLContext(ssl.PROTOCOL_TLS_CLIENT)
        self.ctx.check_hostname = False
        self.ctx.verify_mode = ssl.CERT_NONE

    def conn(self):
        return http.client.HTTPSConnection("127.0.0.1", LAN, context=self.ctx, timeout=30)

    def fingerprint(self):
        with socket.create_connection(("127.0.0.1", LAN)) as s, self.ctx.wrap_socket(s) as t:
            return hashlib.sha256(t.getpeercert(True)).hexdigest()

    def call(self, method, path, body=None, headers=None):
        c = self.conn()
        h = dict(headers or {})
        if self.token:
            h["Authorization"] = "Bearer " + self.token
        c.request(method, path, json.dumps(body) if isinstance(body, dict) else body, h)
        r = c.getresponse()
        data = r.read()
        c.close()
        return r.status, (json.loads(data) if data[:1] in (b"{", b"[") else data)


def check_translations():
    """Every string the page shows must exist in English, or that screen would fall back to Persian."""
    print("translations")
    web = os.path.join(ROOT, "desktop", "web")
    with open(os.path.join(web, "app.js"), encoding="utf-8") as f:
        js = f.read()
    with open(os.path.join(web, "index.html"), encoding="utf-8") as f:
        page = f.read()
    block = re.search(r"const EN=(\{.*?\n\});", js, re.S)
    en = json.loads(block.group(1))
    keys = set(re.findall(r"tr\('([^'\n]*)'", js))
    keys |= set(re.findall(r'(?:aria-label|title|placeholder)="([^"]*[؀-ۿ][^"]*)"', page))
    keys |= set(re.findall(r"data-t>([^<]+)<", page))
    missing = keys - set(en)
    check(not missing, f"all {len(keys)} strings have English {sorted(missing)[:5]}")
    persian = [v for v in en.values() if re.search(r"[؀-ۿ]", v)]
    check(not persian, f"no Persian left in the English text {persian[:3]}")
    glued = re.findall(r"\b\w+tr\('", js)
    check(not glued, f"tr() is a call of its own, not glued to a keyword {glued[:3]}")
    rest = js.replace(block.group(0), "")
    bare = [b for b in re.findall(r"(?<!tr\()'[^'\n]*[؀-ۿ][^'\n]*'", rest) if "فارسی" not in b]
    check(not bare, f"no untranslated literals {bare[:3]}")


def main():
    check_translations()
    env = dict(os.environ, PYTHONUTF8="1")
    proc = subprocess.Popen([sys.executable, os.path.join(ROOT, "desktop", "hotshot.py"), "--no-window",
                             "--data", os.path.join(tmp, "data"), "--local-port", str(LOCAL), "--lan-port", str(LAN)],
                            stdout=subprocess.PIPE, text=True, env=env)
    try:
        url = proc.stdout.readline().strip()
        run(url)
        print(f"\nall {ok_count} checks passed")
    finally:
        proc.kill()
        time.sleep(.3)
        shutil.rmtree(tmp, ignore_errors=True)


def run(url):
    desk = Local(url)
    phone = Phone()
    print("security")
    check(phone.call("GET", "/api/state")[0] == 401, "phone without a token is refused")
    check(phone.call("GET", "/")[0] == 401, "the page itself needs a token")
    check(Phone("x" * 40).call("GET", "/api/state")[0] == 401, "a made-up token is refused")
    c = http.client.HTTPConnection("127.0.0.1", LOCAL)
    c.request("GET", "/api/state")
    check(c.getresponse().status == 401, "local port without the launch cookie is refused")
    st, _ = desk.call("GET", "/api/state", headers={"Host": "evil.example"})
    check(st == 403, "DNS rebinding Host is refused")
    st, _ = desk.call("POST", "/api/chats", {"name": "x"}, {"Origin": "http://evil.example"})
    check(st == 403, "cross-site POST is refused")

    print("pairing")
    code = desk.call("GET", "/api/local/pair")[1]["code"]
    fp = phone.fingerprint()
    key = hotshot.pair_key(code, fp)
    nonce = secrets.token_hex(16)
    wrong = hotshot.pair_key("00000000" if code != "00000000" else "11111111", fp)
    st, _ = phone.call("POST", "/api/pair", {"nonce": nonce, "proof": hotshot.pair_mac(wrong, "client", nonce, fp)})
    check(st == 403, "wrong code is refused")
    forged = hotshot.pair_key(code, "ab" * 32)  # right code, but the proof is bound to another certificate
    st, _ = phone.call("POST", "/api/pair", {"nonce": nonce, "proof": hotshot.pair_mac(forged, "client", nonce, "ab" * 32)})
    check(st == 403, "a certificate swapped in the middle is detected")
    st, r = phone.call("POST", "/api/pair", {"nonce": nonce, "device": "گوشی تست",
                                             "proof": hotshot.pair_mac(key, "client", nonce, fp)})
    check(st == 200 and r["proof"] == hotshot.pair_mac(key, "server", nonce, fp), "right code pairs, server proves itself")
    phone.token = r["token"]
    check(phone.call("GET", "/api/state")[0] == 200, "token works")
    st, _ = Phone().call("POST", "/api/pair", {"nonce": nonce, "proof": hotshot.pair_mac(key, "client", nonce, fp)})
    check(st == 403, "a code works only once")

    print("chats")
    folder = os.path.join(tmp, "chat files")
    st, chat = desk.call("POST", "/api/chats", {"name": "کار", "folder": folder})
    check(st == 200 and chat["folder"] == folder and chat["folderSet"], "chat keeps its name and folder")
    st, c2 = phone.call("POST", "/api/chats", {"name": "از گوشی", "folder": "C:\\Windows"})
    check(st == 200 and not c2["folderSet"] and "Windows" not in c2["folder"], "phone cannot pick a laptop path")
    st, _ = phone.call("PATCH", f"/api/chats/{chat['id']}", {"folder": "C:\\Windows"})
    check(st == 403, "phone cannot move a chat's folder")
    check(phone.call("GET", "/api/local/pair")[0] == 403, "phone cannot read the pairing code")

    print("live events")
    got = []
    ready = threading.Event()

    def listen():
        c = phone.conn()
        c.request("GET", "/api/events", headers={"Authorization": "Bearer " + phone.token})
        r = c.getresponse()
        ready.set()
        while True:
            line = r.readline()
            if not line:
                return
            if line.startswith(b"data: "):
                got.append((time.perf_counter(), json.loads(line[6:])))

    threading.Thread(target=listen, daemon=True).start()
    ready.wait(5)
    time.sleep(.3)
    t0 = time.perf_counter()
    desk.call("POST", f"/api/chats/{chat['id']}/messages", {"text": "سلام"})
    for _ in range(100):
        if any(e["t"] == "msg" for _, e in got):
            break
        time.sleep(.01)
    hit = [(t, e) for t, e in got if e["t"] == "msg"]
    check(bool(hit), "phone gets a new message without asking")
    print(f"       delivered in {(hit[0][0] - t0) * 1000:.0f} ms")
    check(hit[0][1]["msg"]["sender"]["id"] == "desktop", "sender comes from the session, not the client")

    print("files")
    data = os.urandom(5 << 20)
    st, f = phone.call("POST", "/api/files", {"chat": chat["id"], "name": "../..\\CON:ev<il>.jpg", "size": len(data), "mime": "image/jpeg"})
    fid = f["id"]
    st, r = phone.call("PUT", f"/api/files/{fid}/data?offset=0", data[:1 << 20])
    check(st == 200 and r["received"] == 1 << 20, "first part stored")
    st, r = phone.call("PUT", f"/api/files/{fid}/data?offset=999", b"xx")
    check(st == 409 and r["received"] == 1 << 20, "wrong offset tells the client where to resume")
    check(phone.call("POST", f"/api/files/{fid}/done")[0] == 400, "incomplete file cannot be finished")
    st, r = phone.call("GET", f"/api/files/{fid}/status")
    check(r["received"] == 1 << 20, "status reports resume point")
    phone.call("PUT", f"/api/files/{fid}/data?offset={1 << 20}", data[1 << 20:])
    check(phone.call("POST", f"/api/files/{fid}/done")[0] == 200, "resumed upload finishes")
    st, ev = phone.call("POST", f"/api/chats/{chat['id']}/messages", {"text": "عکس", "files": [fid]})
    sent = ev["msg"]["files"][0]
    names = os.listdir(folder)
    check(len(names) == 1 and ".." not in names[0] and ":" not in names[0], f"name made safe, inside the folder: {names}")
    with open(os.path.join(folder, names[0]), "rb") as fh:
        check(hashlib.sha256(fh.read()).digest() == hashlib.sha256(data).digest(), "bytes on disk are identical")
    st, body = phone.call("GET", f"/api/files/{fid}", headers={"Range": "bytes=100-199"})
    check(st == 206 and body == data[100:200], "range request (seek/resume) works")
    check(sent["got"], "phone → laptop counts as delivered at once")

    st, f2 = desk.call("POST", "/api/files", {"chat": chat["id"], "name": names[0], "size": 3})
    desk.call("PUT", f"/api/files/{f2['id']}/data?offset=0", b"abc")
    desk.call("POST", f"/api/files/{f2['id']}/done")
    st, ev = desk.call("POST", f"/api/chats/{chat['id']}/messages", {"files": [f2["id"]]})
    check(len(os.listdir(folder)) == 2, "same name does not overwrite")
    check(not ev["msg"]["files"][0]["got"], "laptop → phone waits for delivery")
    phone.call("POST", f"/api/files/{f2['id']}/got")
    time.sleep(.1)
    check(any(e["t"] == "got" for _, e in got), "delivery tick reaches both sides")
    st, r = desk.call("GET", "/api/search?q=" + "%D8%B9%DA%A9%D8%B3")
    check(len(r["results"]) == 1, "search finds the message")

    print("keep-alive")
    c = phone.conn()
    auth = {"Authorization": "Bearer " + phone.token, "Content-Type": "application/json"}
    c.request("POST", f"/api/files/{'0' * 16}/done", "{}", auth)
    c.getresponse().read()
    c = phone.conn()
    for _ in range(2):      # a body the route ignores must not leak into the next request
        c.request("POST", f"/api/files/{f2['id']}/got", "{}", auth)
        r = c.getresponse()
        r.read()
        check(r.status == 200, "ignored request body does not break the connection")

    print("delete")
    mid = ev["msg"]["id"]
    desk.call("DELETE", f"/api/chats/{chat['id']}/messages/{mid}")
    check(len(os.listdir(folder)) == 2, "deleting a message keeps the file unless asked")
    mid0 = [m for m in desk.call("GET", f"/api/chats/{chat['id']}/messages")[1]["messages"] if m["files"]][0]["id"]
    desk.call("DELETE", f"/api/chats/{chat['id']}/messages/{mid0}?files=1")
    check(len(os.listdir(folder)) == 1, "asked to, it deletes the file too")

    print("speed (loopback: shows the program's own ceiling, not Wi-Fi)")
    size = 512 << 20
    block = os.urandom(1 << 20)
    st, f = phone.call("POST", "/api/files", {"chat": chat["id"], "name": "big.bin", "size": size})
    c = phone.conn()
    t0 = time.perf_counter()
    c.putrequest("PUT", f"/api/files/{f['id']}/data?offset=0")
    c.putheader("Authorization", "Bearer " + phone.token)
    c.putheader("Content-Length", str(size))
    c.endheaders()
    for _ in range(size >> 20):
        c.send(block)
    r = c.getresponse()
    r.read()
    up = size / (1 << 20) / (time.perf_counter() - t0)
    check(r.status == 200, f"upload over TLS: {up:.0f} MB/s")
    phone.call("POST", f"/api/files/{f['id']}/done")
    phone.call("POST", f"/api/chats/{chat['id']}/messages", {"files": [f["id"]]})
    c = phone.conn()
    t0 = time.perf_counter()
    c.request("GET", f"/api/files/{f['id']}", headers={"Authorization": "Bearer " + phone.token})
    r = c.getresponse()
    n = 0
    while True:
        b = r.read(1 << 20)
        if not b:
            break
        n += len(b)
    down = n / (1 << 20) / (time.perf_counter() - t0)
    check(n == size, f"download over TLS: {down:.0f} MB/s")


if __name__ == "__main__":
    main()
