#!/usr/bin/env python3
"""
HotShot: chat and file transfer between an Android phone and a Windows computer, with no internet.

The computer joins the phone's hotspot and this program hosts the chats:
  127.0.0.1:47799  the program's own window on this computer (HTTP, local only)
  0.0.0.0:47800    the phone app (TLS with a pinned certificate and a pairing token)
  UDP 47801        announcements, so the phone finds the computer by itself

Files go uncompressed, straight into each chat's folder, next to a copy of the chat's history (HotShot-chat.json).
"""
import argparse, hashlib, hmac, json, mimetypes, os, queue, re, secrets, shutil, socket, sqlite3, ssl
import subprocess, sys, threading, time, uuid, webbrowser
from http.cookies import SimpleCookie
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, quote, urlparse

APP_SLUG = "HotShot"
LOCAL_PORT, LAN_PORT, BEACON_PORT = 47799, 47800, 47801
FROZEN = getattr(sys, "frozen", False)
HERE = os.path.dirname(sys.executable if FROZEN else os.path.abspath(__file__))
WEB = os.path.join(getattr(sys, "_MEIPASS", HERE), "web")
NO_WINDOW = 0x08000000 if sys.platform == "win32" else 0
PAIR_ROUNDS = 150000
CHUNK = 1 << 20
CHAT_FILE = "HotShot-chat.json"

if sys.stdout is None:          # windowed exe: there is no console to print to
    sys.stdout = sys.stderr = open(os.devnull, "w", encoding="utf-8")

LOCK = threading.RLock()
CLIENTS = []                    # one dict per open event stream
PENDING = {}                    # file id -> upload in progress
PAIR = {"code": None, "until": 0.0, "tries": 0}
LOCAL_SECRET = secrets.token_urlsafe(32)
DATA = DB = FP = None           # filled in by main()
DIRTY = set()                   # chats whose history file is out of date
DIRTY_WAKE = threading.Event()


# ───────────────────────── storage ─────────────────────────
SCHEMA = """
CREATE TABLE IF NOT EXISTS chats(id TEXT PRIMARY KEY, name TEXT NOT NULL, folder TEXT NOT NULL,
  folder_set INTEGER NOT NULL DEFAULT 1, auto INTEGER NOT NULL DEFAULT 1, pinned INTEGER NOT NULL DEFAULT 0,
  created REAL NOT NULL, updated REAL NOT NULL, seq INTEGER NOT NULL DEFAULT 0, auto_pc INTEGER NOT NULL DEFAULT 1);
CREATE TABLE IF NOT EXISTS messages(id TEXT PRIMARY KEY, chat TEXT NOT NULL, n INTEGER NOT NULL, ts REAL NOT NULL,
  sender_id TEXT NOT NULL, sender_name TEXT NOT NULL, text TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS messages_chat ON messages(chat, n);
CREATE TABLE IF NOT EXISTS files(id TEXT PRIMARY KEY, msg TEXT NOT NULL, chat TEXT NOT NULL, name TEXT NOT NULL,
  size INTEGER NOT NULL, mime TEXT NOT NULL, kind TEXT NOT NULL, w INTEGER NOT NULL, h INTEGER NOT NULL,
  thumb INTEGER NOT NULL, path TEXT NOT NULL, got INTEGER NOT NULL DEFAULT 0, held INTEGER NOT NULL DEFAULT 0,
  owner TEXT NOT NULL DEFAULT '');
CREATE INDEX IF NOT EXISTS files_msg ON files(msg);
CREATE TABLE IF NOT EXISTS devices(id TEXT PRIMARY KEY, name TEXT NOT NULL, token TEXT NOT NULL,
  created REAL NOT NULL, seen REAL NOT NULL);
"""


def open_db(path):
    db = sqlite3.connect(path, check_same_thread=False, isolation_level=None)
    db.row_factory = sqlite3.Row
    db.execute("PRAGMA journal_mode=WAL")
    db.execute("PRAGMA synchronous=NORMAL")
    db.executescript(SCHEMA)
    # a database from an older version: the one "receive automatically" switch used to mean both devices
    if "auto_pc" not in [r["name"] for r in db.execute("PRAGMA table_info(chats)")]:
        db.execute("ALTER TABLE chats ADD COLUMN auto_pc INTEGER NOT NULL DEFAULT 1")
        db.execute("UPDATE chats SET auto_pc=auto")
    if "held" not in [r["name"] for r in db.execute("PRAGMA table_info(files)")]:
        db.execute("ALTER TABLE files ADD COLUMN held INTEGER NOT NULL DEFAULT 0")
        db.execute("ALTER TABLE files ADD COLUMN owner TEXT NOT NULL DEFAULT ''")
    return db


def default_folder(name, cid):
    return os.path.join(os.path.expanduser("~"), "Downloads", APP_SLUG, f"{clean_name(name)}-{cid[:4]}")


def clean_name(raw):
    name = os.path.basename(str(raw or "").replace("\\", "/"))
    name = re.sub(r'[<>:"/\\|?*\x00-\x1f]', "_", name).strip(" .")
    stem, ext = os.path.splitext(name)
    name = stem[:180] + ext[:20]
    if stem.split(".")[0].upper() in {"CON", "PRN", "AUX", "NUL"} or re.fullmatch(r"(?i)(COM|LPT)\d", stem):
        name = "_" + name
    return name or "file"


def unique_path(folder, name):
    stem, ext = os.path.splitext(name)
    path, i = os.path.join(folder, name), 1
    while os.path.exists(path):
        path = os.path.join(folder, f"{stem} ({i}){ext}")
        i += 1
    return path


def safe_mime(mime, name):
    mime = (mime or "").lower().strip() or (mimetypes.guess_type(name)[0] or "")
    if re.fullmatch(r"(image|video|audio)/[a-z0-9.+-]+", mime) and "svg" not in mime:
        return mime
    return "application/octet-stream"


def kind_of(mime):
    kind = mime.split("/")[0]
    return kind if kind in ("image", "video", "audio") else "file"


def thumb_path(fid):
    return os.path.join(DATA, "thumbs", fid + ".jpg")


def file_json(r):
    held = bool(r["held"])      # still only on the phone that sent it, until the laptop asks for it
    return {"id": r["id"], "name": r["name"], "size": r["size"], "mime": r["mime"], "kind": r["kind"], "w": r["w"],
            "h": r["h"], "thumb": bool(r["thumb"]), "got": bool(r["got"]), "held": held,
            "fetching": held and r["id"] in PENDING, "gone": not held and not os.path.exists(r["path"])}


def messages_json(rows):
    rows = list(rows)
    files = {}
    if rows:
        marks = ",".join("?" * len(rows))
        for f in DB.execute(f"SELECT * FROM files WHERE msg IN ({marks}) ORDER BY rowid", [r["id"] for r in rows]):
            files.setdefault(f["msg"], []).append(file_json(f))
    return [{"id": r["id"], "chat": r["chat"], "n": r["n"], "ts": r["ts"], "text": r["text"],
             "sender": {"id": r["sender_id"], "name": r["sender_name"]}, "files": files.get(r["id"], [])} for r in rows]


def summary(c):
    last = DB.execute("SELECT * FROM messages WHERE chat=? ORDER BY n DESC LIMIT 1", (c["id"],)).fetchone()
    count = DB.execute("SELECT COUNT(*) FROM messages WHERE chat=?", (c["id"],)).fetchone()[0]
    out = {"id": c["id"], "name": c["name"], "folder": c["folder"], "folderSet": bool(c["folder_set"]),
           "auto": bool(c["auto"]), "autoPc": bool(c["auto_pc"]), "pinned": bool(c["pinned"]),
           "created": c["created"], "updated": c["updated"],
           "count": count, "last": None}
    if last:
        fs = DB.execute("SELECT name FROM files WHERE msg=? ORDER BY rowid", (last["id"],)).fetchall()
        out["last"] = {"text": last["text"][:90], "files": len(fs), "fname": fs[0]["name"] if fs else "",
                       "ts": last["ts"], "sender": last["sender_id"]}
    return out


def get_chat(cid):
    return DB.execute("SELECT * FROM chats WHERE id=?", (cid,)).fetchone()


def remove_paths(paths):
    for p in paths:
        try:
            os.remove(p)
        except OSError:
            pass


def drop_files(where, args, purge):
    """Forget file rows; the file itself leaves the disk only when the user asked for it."""
    rows = DB.execute(f"SELECT id, path FROM files WHERE {where}", args).fetchall()
    remove_paths(thumb_path(r["id"]) for r in rows)
    if purge:
        remove_paths(r["path"] for r in rows)
    DB.execute(f"DELETE FROM files WHERE {where}", args)
    return [r["id"] for r in rows]


def broadcast(ev):
    data = json.dumps(ev, ensure_ascii=False)
    for c in list(CLIENTS):
        c["q"].put(data)
    if ev["t"] in ("msg", "msgdel", "cleared", "file"):
        mark_dirty(ev["chat"])
    elif ev["t"] == "chat":
        mark_dirty(ev["chat"]["id"])


# ── each chat's folder also holds its history, so the folder alone is a complete record of the chat
def mark_dirty(cid):
    DIRTY.add(cid)
    DIRTY_WAKE.set()


def chat_export(c):
    files = {}
    for f in DB.execute("SELECT * FROM files WHERE chat=? ORDER BY rowid", (c["id"],)):
        files.setdefault(f["msg"], []).append({k: f[k] for k in ("name", "size", "mime", "kind", "w", "h")})
    messages = [{"ts": m["ts"], "sender": {"id": m["sender_id"], "name": m["sender_name"]}, "text": m["text"],
                 "files": files.get(m["id"], [])}
                for m in DB.execute("SELECT * FROM messages WHERE chat=? ORDER BY n", (c["id"],))]
    return {"app": APP_SLUG, "version": 1, "name": c["name"], "created": c["created"], "messages": messages}


def save_chat_file(cid):
    with LOCK:
        c = get_chat(cid)
        if not c or not c["folder_set"]:
            return
        body = json.dumps(chat_export(c), ensure_ascii=False, indent=1)
    path = os.path.join(c["folder"], CHAT_FILE)
    try:
        os.makedirs(c["folder"], exist_ok=True)
        with open(path + ".tmp", "w", encoding="utf-8") as f:
            f.write(body)
        os.replace(path + ".tmp", path)     # a crash halfway never leaves a broken history behind
    except OSError:
        pass        # e.g. a removable drive that is not plugged in right now


def chat_saver():
    while True:
        DIRTY_WAKE.wait()
        time.sleep(1.5)     # a burst of changes costs one write
        DIRTY_WAKE.clear()
        while DIRTY:
            save_chat_file(DIRTY.pop())


def restore_chat(cid, folder):
    """A folder that already holds a history brings that history back, e.g. after a reinstall."""
    try:
        with open(os.path.join(folder, CHAT_FILE), encoding="utf-8") as f:
            saved = json.load(f)
        if saved.get("app") != APP_SLUG:
            return
        n = 0
        for m in saved["messages"]:
            n += 1
            mid, sender = uuid.uuid4().hex[:12], m["sender"]
            DB.execute("INSERT INTO messages VALUES(?,?,?,?,?,?,?)", (mid, cid, n, float(m["ts"]), str(sender["id"]),
                                                                      str(sender["name"]), str(m["text"])))
            for x in m["files"]:
                name = clean_name(x["name"])    # the file only ever points inside this folder
                mime = safe_mime(x.get("mime"), name)
                DB.execute("INSERT INTO files(id,msg,chat,name,size,mime,kind,w,h,thumb,path,got) "
                           "VALUES(?,?,?,?,?,?,?,?,?,0,?,1)",
                           (uuid.uuid4().hex[:16], mid, cid, name, int(x["size"]), mime, kind_of(mime),
                            int(x.get("w") or 0), int(x.get("h") or 0), os.path.join(folder, name)))
        DB.execute("UPDATE chats SET seq=? WHERE id=?", (n, cid))
    except (OSError, ValueError, KeyError, TypeError, AttributeError):
        pass        # no history here, or not one of ours


def presence():
    return sorted({c["dev"]["name"] for c in CLIENTS if not c["dev"]["local"]})


def janitor():
    while True:
        time.sleep(600)
        with LOCK:
            old = [k for k, p in PENDING.items() if time.time() - p["touched"] > 6 * 3600]
            for fid in old:
                p = PENDING.pop(fid)
                if not p["done"]:
                    remove_paths([p["part"]])
                if not p.get("fetch"):      # a fetch that stalled still has its message and thumbnail
                    remove_paths([thumb_path(fid)])


def clean_leftovers():
    for c in DB.execute("SELECT folder FROM chats").fetchall():
        try:
            names = os.listdir(c["folder"])
        except OSError:
            continue
        remove_paths(os.path.join(c["folder"], n) for n in names if re.fullmatch(r"\.[0-9a-f]{16}\.part", n))


# ───────────────────────── http layer ─────────────────────────
ROUTES = []


def route(method, pattern, public=False, local=False):
    def deco(fn):
        ROUTES.append((method, re.compile("^" + pattern + "$"), fn, public, local))
        return fn
    return deco


class Server(ThreadingHTTPServer):
    daemon_threads = True
    request_queue_size = 128
    tls = None

    def get_request(self):
        sock, addr = super().get_request()
        if self.tls:    # the handshake runs on the connection's own thread, not on the accept loop
            sock = self.tls.wrap_socket(sock, server_side=True, do_handshake_on_connect=False)
        return sock, addr

    def handle_error(self, request, client_address):
        pass


class Handler(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"
    disable_nagle_algorithm = True
    timeout = 25                # a stalled transfer frees its thread; the client resumes from /status

    def setup(self):
        for opt in (socket.SO_SNDBUF, socket.SO_RCVBUF):
            try:
                self.request.setsockopt(socket.SOL_SOCKET, opt, 4 << 20)
            except OSError:
                pass
        super().setup()
        if self.server.tls:
            self.connection.settimeout(self.timeout)
            self.connection.do_handshake()

    def log_message(self, *a):
        pass

    def send_bytes(self, body, ctype, code=200, extra=()):
        self.send_response(code)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        for k, v in extra:
            self.send_header(k, v)
        self.end_headers()
        if self.command != "HEAD":
            self.wfile.write(body)

    def send_json(self, obj, code=200):
        if code >= 400:
            self.close_connection = True    # the request body may be unread
        self.send_bytes(json.dumps(obj, ensure_ascii=False).encode(), "application/json", code)

    def body(self):
        return json.loads(self.raw or b"{}")

    def identity(self):
        cookies = SimpleCookie(self.headers.get("Cookie") or "")
        if not self.server.tls:
            sid = cookies["lsid"].value if "lsid" in cookies else ""
            if hmac.compare_digest(sid, LOCAL_SECRET):
                return {"id": "desktop", "name": "Computer", "local": True}
            return None
        auth = self.headers.get("Authorization") or ""
        token = auth[7:] if auth.startswith("Bearer ") else (cookies["sid"].value if "sid" in cookies else "")
        if not token:
            return None
        with LOCK:
            d = DB.execute("SELECT * FROM devices WHERE token=?", (hash_token(token),)).fetchone()
            if not d:
                return None
            if time.time() - d["seen"] > 60:
                DB.execute("UPDATE devices SET seen=? WHERE id=?", (time.time(), d["id"]))
        return {"id": d["id"], "name": d["name"], "local": False}

    def same_origin(self):
        host = self.headers.get("Host") or ""
        if not self.server.tls and host.split(":")[0] not in ("127.0.0.1", "localhost"):
            return False            # stops DNS rebinding against the local port
        origin = self.headers.get("Origin")
        return not origin or origin == "null" or urlparse(origin).netloc == host

    def dispatch(self, method):
        u = urlparse(self.path)
        self.q = parse_qs(u.query)
        self.raw = b""
        if method != "PUT":     # read it all, or leftovers would corrupt the next request on this connection
            n = int(self.headers.get("Content-Length") or 0)
            if n > (1 << 20):
                return self.send_json({"error": "body too large"}, 413)
            self.raw = self.rfile.read(n)
        for m, rx, fn, public, local in ROUTES:
            mt = rx.match(u.path) if m == method else None
            if not mt:
                continue
            try:
                if not self.same_origin():
                    return self.send_json({"error": "forbidden"}, 403)
                self.who = None if public else self.identity()
                if not public and not self.who:
                    return self.send_json({"error": "unauthorized"}, 401)
                if local and not self.who["local"]:
                    return self.send_json({"error": "forbidden"}, 403)
                return fn(self, **mt.groupdict())
            except (OSError, TimeoutError):
                self.close_connection = True
            except Exception as e:
                try:
                    self.send_json({"error": str(e)}, 500)
                except OSError:
                    self.close_connection = True
            return
        self.send_json({"error": "not found"}, 404)

    def do_GET(self): self.dispatch("GET")
    def do_HEAD(self): self.dispatch("GET")
    def do_POST(self): self.dispatch("POST")
    def do_PUT(self): self.dispatch("PUT")
    def do_PATCH(self): self.dispatch("PATCH")
    def do_DELETE(self): self.dispatch("DELETE")


def serve_file(h, path, mime, name=None):
    """Streams a file with Range support, so media can seek and interrupted downloads can resume."""
    size = os.path.getsize(path)
    start, end, code = 0, size - 1, 200
    rg = re.match(r"bytes=(\d*)-(\d*)$", (h.headers.get("Range") or "").strip())
    if rg and (rg.group(1) or rg.group(2)):
        a, b = rg.groups()
        if a:
            start, end = int(a), min(int(b), size - 1) if b else size - 1
        else:
            start = max(0, size - int(b))
        if start > end or start >= size:
            h.send_response(416)
            h.send_header("Content-Range", f"bytes */{size}")
            h.send_header("Content-Length", "0")
            h.end_headers()
            return
        code = 206
    left = max(0, end - start + 1)
    h.send_response(code)
    h.send_header("Content-Type", mime)
    h.send_header("Content-Length", str(left))
    h.send_header("Accept-Ranges", "bytes")
    h.send_header("X-Content-Type-Options", "nosniff")
    h.send_header("Content-Security-Policy", "sandbox; default-src 'none'; media-src 'self'; img-src 'self'")
    h.send_header("Cache-Control", "private, no-cache")
    if code == 206:
        h.send_header("Content-Range", f"bytes {start}-{end}/{size}")
    if name:
        h.send_header("Content-Disposition", "attachment; filename*=UTF-8''" + quote(name))
    h.end_headers()
    if h.command == "HEAD":
        return
    buf = bytearray(CHUNK)
    view = memoryview(buf)
    with open(path, "rb", buffering=0) as f:
        f.seek(start)
        while left:
            k = f.readinto(view[:min(left, CHUNK)])
            if not k:
                raise ConnectionError("file shrank")
            h.wfile.write(view[:k])
            left -= k


# ── web page
STATIC = {".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8",
          ".css": "text/css; charset=utf-8", ".woff2": "font/woff2", ".svg": "image/svg+xml"}
PAGE_CSP = ("default-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data:; "
            "media-src 'self' blob:; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'")


def send_static(h, rel):
    path = os.path.join(WEB, *rel.split("/"))
    if not os.path.isfile(path):
        return h.send_json({"error": "not found"}, 404)
    with open(path, "rb") as f:
        h.send_bytes(f.read(), STATIC.get(os.path.splitext(path)[1], "application/octet-stream"), 200,
                     [("Content-Security-Policy", PAGE_CSP), ("Referrer-Policy", "no-referrer")])


@route("GET", "/", public=True)
def r_index(h):
    if not h.server.tls and hmac.compare_digest(h.q.get("k", [""])[0], LOCAL_SECRET):
        h.send_response(303)
        h.send_header("Set-Cookie", f"lsid={LOCAL_SECRET}; Path=/; HttpOnly; SameSite=Strict; Max-Age=31536000")
        h.send_header("Location", "/")
        h.send_header("Content-Length", "0")
        h.end_headers()
        return
    if not h.identity():
        return h.send_bytes("Open HotShot from the app. / این نشانی فقط از داخل برنامه باز می‌شود.".encode(), "text/plain; charset=utf-8", 401)
    send_static(h, "index.html")


@route("GET", r"/static/(?P<rel>(?:fonts/)?[\w.-]+)")
def r_static(h, rel):
    send_static(h, rel)


# ── pairing: both sides prove they know the code *and* saw the same certificate, so a
#    man in the middle would have to break the code inside its short lifetime
def hash_token(token):
    return hashlib.sha256(token.encode()).hexdigest()


def pair_key(code, fp):
    return hashlib.pbkdf2_hmac("sha256", code.encode(), bytes.fromhex(fp), PAIR_ROUNDS, 32)


def pair_mac(key, role, nonce, fp):
    return hmac.new(key, f"{role}|{nonce}|{fp}".encode(), hashlib.sha256).hexdigest()


def new_code():
    PAIR.update(code=f"{secrets.randbelow(10 ** 8):08d}", until=time.time() + 300, tries=0)


@route("GET", "/api/hello", public=True)
def r_hello(h):
    h.send_json({"app": APP_SLUG, "name": socket.gethostname()})


@route("POST", "/api/pair", public=True)
def r_pair(h):
    b = h.body()
    nonce, proof = str(b.get("nonce") or ""), str(b.get("proof") or "")
    name = str(b.get("device") or "Phone").strip()[:40] or "Phone"
    with LOCK:
        if not h.server.tls or not PAIR["code"] or time.time() > PAIR["until"]:
            return h.send_json({"error": "no code"}, 403)
        code = PAIR["code"]
        PAIR["tries"] += 1
        if PAIR["tries"] >= 5:
            PAIR["code"] = None     # no more guesses; the laptop has to open a fresh code
    key = pair_key(code, FP)
    if len(nonce) < 16 or not hmac.compare_digest(pair_mac(key, "client", nonce, FP), proof):
        return h.send_json({"error": "bad code"}, 403)
    token, did = secrets.token_urlsafe(32), uuid.uuid4().hex[:12]
    now = time.time()
    with LOCK:
        PAIR["code"] = None
        DB.execute("INSERT INTO devices VALUES(?,?,?,?,?)", (did, name, hash_token(token), now, now))
    broadcast({"t": "paired", "name": name})
    h.send_json({"token": token, "id": did, "proof": pair_mac(key, "server", nonce, FP)})


@route("GET", "/api/local/pair", local=True)
def r_paircode(h):
    with LOCK:
        if not PAIR["code"] or time.time() > PAIR["until"] - 30:
            new_code()
        devices = [dict(d) for d in DB.execute("SELECT id, name, created, seen FROM devices ORDER BY created")]
        h.send_json({"code": PAIR["code"], "until": PAIR["until"], "ips": local_ips(), "port": LAN_PORT,
                     "devices": devices, "online": presence()})


@route("DELETE", r"/api/local/devices/(?P<did>\w+)", local=True)
def r_forget(h, did):
    with LOCK:
        DB.execute("DELETE FROM devices WHERE id=?", (did,))
    h.send_json({"ok": True})


@route("POST", "/api/local/firewall", local=True)
def r_firewall(h):
    prog = sys.executable
    rule = (f'advfirewall firewall add rule name="{APP_SLUG}" dir=in action=allow '
            f'program="{prog}" enable=yes profile=any')
    arg = rule.replace('"', '\\"').replace("'", "''")
    cmd = f"Start-Process netsh -Verb RunAs -WindowStyle Hidden -ArgumentList '{arg}'"
    r = subprocess.run(["powershell", "-NoProfile", "-Command", cmd], creationflags=NO_WINDOW, capture_output=True)
    h.send_json({"ok": r.returncode == 0})


# ── state & live updates
@route("GET", "/api/state")
def r_state(h):
    with LOCK:
        chats = [summary(c) for c in DB.execute("SELECT * FROM chats")]
    h.send_json({"chats": chats, "me": h.who, "online": presence(), "host": socket.gethostname()})


@route("GET", "/api/events")
def r_events(h):
    h.send_response(200)
    h.send_header("Content-Type", "text/event-stream")
    h.send_header("Cache-Control", "no-store")
    h.end_headers()
    h.close_connection = True
    client = {"q": queue.Queue(), "dev": h.who}
    ping = 2 if h.who["local"] else 10      # the local window closing is what ends the program
    CLIENTS.append(client)
    broadcast({"t": "presence", "online": presence()})
    try:
        h.wfile.write(b"retry: 1500\n\n")
        while True:
            try:
                h.wfile.write(b"data: " + client["q"].get(timeout=ping).encode() + b"\n\n")
            except queue.Empty:
                h.wfile.write(b": ping\n\n")    # also how a dropped phone is noticed
    finally:
        CLIENTS.remove(client)
        broadcast({"t": "presence", "online": presence()})


def valid_folder(path):
    path = os.path.abspath(os.path.expanduser(str(path)))
    os.makedirs(path, exist_ok=True)
    probe = os.path.join(path, f".{uuid.uuid4().hex}.probe")
    with open(probe, "wb"):
        pass
    os.remove(probe)
    return path


@route("POST", "/api/chats")
def r_newchat(h):
    b = h.body()
    name = str(b.get("name") or "").strip()[:60]
    if not name:
        return h.send_json({"error": "name"}, 400)
    cid, now = uuid.uuid4().hex[:10], time.time()
    wanted = str(b.get("folder") or "").strip() if h.who["local"] else ""
    try:
        folder = valid_folder(wanted) if wanted else ""     # a chat from the phone waits for the laptop's choice
    except OSError:
        return h.send_json({"error": "folder"}, 400)
    with LOCK:
        DB.execute("INSERT INTO chats(id,name,folder,folder_set,created,updated) VALUES(?,?,?,?,?,?)",
                   (cid, name, folder, int(bool(wanted)), now, now))
        if wanted:
            restore_chat(cid, folder)
        s = summary(get_chat(cid))
    broadcast({"t": "chat", "chat": s})
    h.send_json(s)


@route("PATCH", r"/api/chats/(?P<cid>\w+)")
def r_editchat(h, cid):
    b = h.body()
    with LOCK:
        c = get_chat(cid)
        if not c:
            return h.send_json({"error": "no chat"}, 404)
        if str(b.get("name") or "").strip():
            DB.execute("UPDATE chats SET name=? WHERE id=?", (str(b["name"]).strip()[:60], cid))
        if "pinned" in b:
            DB.execute("UPDATE chats SET pinned=? WHERE id=?", (int(bool(b["pinned"])), cid))
        if "auto" in b:
            DB.execute("UPDATE chats SET auto=? WHERE id=?", (int(bool(b["auto"])), cid))
        if "autoPc" in b:
            DB.execute("UPDATE chats SET auto_pc=? WHERE id=?", (int(bool(b["autoPc"])), cid))
        if b.get("folder"):
            if not h.who["local"]:
                return h.send_json({"error": "forbidden"}, 403)
            try:
                folder = valid_folder(b["folder"])
            except OSError:
                return h.send_json({"error": "folder"}, 400)
            if c["folder_set"] and folder != c["folder"]:   # the history moves with the chat
                remove_paths([os.path.join(c["folder"], CHAT_FILE)])
            DB.execute("UPDATE chats SET folder=?, folder_set=1 WHERE id=?", (folder, cid))
            if not c["seq"]:
                restore_chat(cid, folder)
        s = summary(get_chat(cid))
    broadcast({"t": "chat", "chat": s})
    h.send_json(s)


def wants_purge(h):
    return h.q.get("files", ["0"])[0] == "1"


@route("DELETE", r"/api/chats/(?P<cid>\w+)")
def r_delchat(h, cid):
    purge = wants_purge(h)
    with LOCK:
        c = get_chat(cid)
        if c and c["folder_set"]:
            remove_paths([os.path.join(c["folder"], CHAT_FILE)])
        fids = drop_files("chat=?", (cid,), purge)
        DB.execute("DELETE FROM messages WHERE chat=?", (cid,))
        DB.execute("DELETE FROM chats WHERE id=?", (cid,))
    broadcast({"t": "chatdel", "id": cid, "purged": fids if purge else []})
    h.send_json({"ok": True})


@route("POST", r"/api/chats/(?P<cid>\w+)/clear")
def r_clear(h, cid):
    purge = wants_purge(h)
    with LOCK:
        fids = drop_files("chat=?", (cid,), purge)
        DB.execute("DELETE FROM messages WHERE chat=?", (cid,))
        c = get_chat(cid)
        s = summary(c) if c else None
    broadcast({"t": "cleared", "chat": cid, "sum": s, "purged": fids if purge else []})
    h.send_json({"ok": True})


@route("GET", r"/api/chats/(?P<cid>\w+)/export")
def r_export(h, cid):
    with LOCK:
        c = get_chat(cid)
        if not c:
            return h.send_json({"error": "no chat"}, 404)
        out = chat_export(c)
    h.send_json(out)


@route("GET", r"/api/chats/(?P<cid>\w+)/messages")
def r_msgs(h, cid):
    before = int(h.q.get("before", ["0"])[0] or 0) or (1 << 60)
    limit = max(1, min(200, int(h.q.get("limit", ["60"])[0])))
    with LOCK:
        rows = DB.execute("SELECT * FROM messages WHERE chat=? AND n<? ORDER BY n DESC LIMIT ?",
                          (cid, before, limit + 1)).fetchall()
        more = len(rows) > limit
        out = messages_json(reversed(rows[:limit]))
    h.send_json({"messages": out, "more": more})


@route("POST", r"/api/chats/(?P<cid>\w+)/messages")
def r_post(h, cid):
    b = h.body()
    text = str(b.get("text") or "").strip()[:100000]
    ids = [str(i) for i in (b.get("files") or [])]
    with LOCK:
        c = get_chat(cid)
        if not c:
            return h.send_json({"error": "no chat"}, 404)
        ready = all(i in PENDING and PENDING[i]["done"] and PENDING[i]["chat"] == cid for i in ids)
        if not ready or not (text or ids):
            return h.send_json({"error": "bad message"}, 400)
        mid, now, n = uuid.uuid4().hex[:12], time.time(), c["seq"] + 1
        DB.execute("INSERT INTO messages VALUES(?,?,?,?,?,?,?)", (mid, cid, n, now, h.who["id"], h.who["name"], text))
        for i in ids:
            p = PENDING.pop(i)
            # a file the phone uploaded has arrived; one from the laptop or still held on the phone has a trip to make
            DB.execute("INSERT INTO files(id,msg,chat,name,size,mime,kind,w,h,thumb,path,got,held,owner) "
                       "VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
                       (i, mid, cid, p["name"], p["size"], p["mime"], kind_of(p["mime"]), p["w"], p["h"],
                        int(os.path.exists(thumb_path(i))), p["final"], 0 if h.who["local"] or p["hold"] else 1,
                        int(p["hold"]), h.who["id"]))
        DB.execute("UPDATE chats SET seq=?, updated=? WHERE id=?", (n, now, cid))
        row = DB.execute("SELECT * FROM messages WHERE id=?", (mid,)).fetchone()
        ev = {"t": "msg", "chat": cid, "msg": messages_json([row])[0], "sum": summary(get_chat(cid))}
    broadcast(ev)
    h.send_json(ev)


@route("DELETE", r"/api/chats/(?P<cid>\w+)/messages/(?P<mid>\w+)")
def r_delmsg(h, cid, mid):
    purge = wants_purge(h)
    with LOCK:
        fids = drop_files("msg=?", (mid,), purge)
        DB.execute("DELETE FROM messages WHERE id=? AND chat=?", (mid, cid))
        c = get_chat(cid)
        s = summary(c) if c else None
    broadcast({"t": "msgdel", "chat": cid, "id": mid, "sum": s, "purged": fids if purge else []})
    h.send_json({"ok": True})


@route("GET", "/api/search")
def r_search(h):
    q = h.q.get("q", [""])[0].strip()
    if not q:
        return h.send_json({"results": []})
    like = "%" + q.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_") + "%"
    with LOCK:
        rows = DB.execute(
            "SELECT DISTINCT m.* FROM messages m LEFT JOIN files f ON f.msg=m.id "
            "WHERE m.text LIKE ? ESCAPE '\\' OR f.name LIKE ? ESCAPE '\\' ORDER BY m.ts DESC LIMIT 40",
            (like, like)).fetchall()
        h.send_json({"results": messages_json(rows)})


# ── uploads: create → stream (resumable from /status) → optional thumb → done → post the message
@route("POST", "/api/files")
def r_fnew(h):
    b = h.body()
    size = int(b.get("size") or 0)
    with LOCK:
        c = get_chat(str(b.get("chat") or ""))
        if not c:
            return h.send_json({"error": "no chat"}, 404)
        # the phone keeps the file when the laptop should not take it by itself, or has no folder for it yet
        hold = not h.who["local"] and bool(b.get("canHold")) and not (c["auto_pc"] and c["folder_set"])
        folder = c["folder"]
        if not hold and not folder:     # the phone cannot keep this one, so it needs somewhere to land for now
            folder = default_folder(c["name"], c["id"])
            DB.execute("UPDATE chats SET folder=? WHERE id=?", (folder, c["id"]))
    if size < 0:
        return h.send_json({"error": "size"}, 400)
    fid = uuid.uuid4().hex[:16]
    name = clean_name(b.get("name"))
    part = ""
    if not hold:
        part = reserve(folder, fid, size)
        if not part:
            return h.send_json({"error": "no space"}, 507)
    PENDING[fid] = {"chat": c["id"], "folder": folder, "name": name, "size": size, "part": part, "final": "",
                    "mime": safe_mime(b.get("mime"), name), "w": int(b.get("w") or 0), "h": int(b.get("h") or 0),
                    "received": 0, "done": False, "busy": threading.Lock(), "touched": time.time(), "hold": hold}
    h.send_json({"id": fid, "hold": hold})


def reserve(folder, fid, size):
    """Creates the file a transfer writes into; returns "" when the disk cannot take it."""
    os.makedirs(folder, exist_ok=True)
    if shutil.disk_usage(folder).free < size + (64 << 20):
        return ""
    part = os.path.join(folder, f".{fid}.part")
    open(part, "wb").close()
    return part


@route("GET", r"/api/files/(?P<fid>\w+)/status")
def r_fstatus(h, fid):
    p = PENDING.get(fid)
    if not p:
        return h.send_json({"error": "no upload"}, 404)
    h.send_json({"received": p["received"], "size": p["size"]})


@route("PUT", r"/api/files/(?P<fid>\w+)/data")
def r_fdata(h, fid):
    p = PENDING.get(fid)
    off = int(h.q.get("offset", ["0"])[0])
    left = int(h.headers.get("Content-Length") or 0)
    if not p or p["done"] or p.get("hold") or off + left > p["size"]:
        return h.send_json({"error": "bad range"}, 400)
    if not p["busy"].acquire(blocking=False):
        return h.send_json({"error": "busy", "received": p["received"]}, 409)
    try:
        if off != p["received"]:
            return h.send_json({"error": "offset", "received": p["received"]}, 409)
        buf = bytearray(CHUNK)
        view = memoryview(buf)
        with open(p["part"], "r+b", buffering=0) as f:
            f.seek(off)
            while left:
                k = h.rfile.readinto(view[:min(left, CHUNK)])
                if not k:
                    raise ConnectionError("short body")
                f.write(view[:k])
                left -= k
                p["received"] += k
                p["touched"] = time.time()
                if p.get("fetch") and p["touched"] - p["tick"] > .2:    # the laptop's window shows this one's progress
                    p["tick"] = p["touched"]
                    broadcast({"t": "prog", "id": fid, "bytes": p["received"], "size": p["size"]})
    finally:
        p["busy"].release()
    h.send_json({"received": p["received"]})


@route("PUT", r"/api/files/(?P<fid>\w+)/thumb")
def r_fthumb(h, fid):
    n = int(h.headers.get("Content-Length") or 0)
    if fid not in PENDING or n > (4 << 20):
        return h.send_json({"error": "bad thumb"}, 400)
    data = h.rfile.read(n)
    with open(thumb_path(fid), "wb") as f:
        f.write(data)
    h.send_json({"ok": True})


@route("POST", r"/api/files/(?P<fid>\w+)/done")
def r_fdone(h, fid):
    ev = None
    with LOCK:
        p = PENDING.get(fid)
        if not p or (p["received"] != p["size"] and not p["hold"]):
            return h.send_json({"error": "incomplete"}, 400)
        if not p["done"] and not p["hold"]:
            p["final"] = unique_path(p["folder"], p["name"])
            os.replace(p["part"], p["final"])
            p["name"] = os.path.basename(p["final"])
        p["done"] = True
        if p.get("fetch"):      # a held file has reached the laptop: its message already exists
            del PENDING[fid]
            DB.execute("UPDATE files SET path=?, name=?, held=0, got=1 WHERE id=?", (p["final"], p["name"], fid))
            f = file_row(fid)
            if f:
                ev = {"t": "file", "chat": f["chat"], "msg": f["msg"], "file": file_json(f)}
    if ev:
        broadcast(ev)
    h.send_json({"ok": True, "name": p["name"]})


@route("DELETE", r"/api/files/(?P<fid>\w+)")
def r_fcancel(h, fid):
    end_transfer(fid, False)
    h.send_json({"ok": True})


def end_transfer(fid, failed):
    with LOCK:
        p = PENDING.pop(fid, None)
    if not p:
        return
    if p.get("fetch"):      # the message stays and the file stays on the phone, so this can be tried again
        remove_paths([p["part"]])
        broadcast({"t": "fetchend", "id": fid, "failed": failed})
    else:
        remove_paths([p["final"] or p["part"], thumb_path(fid)])


@route("POST", r"/api/files/(?P<fid>\w+)/failed")
def r_ffailed(h, fid):
    end_transfer(fid, True)
    h.send_json({"ok": True})


def file_row(fid):
    with LOCK:
        return DB.execute("SELECT * FROM files WHERE id=?", (fid,)).fetchone()


@route("GET", r"/api/files/(?P<fid>\w+)")
def r_file(h, fid):
    f = file_row(fid)
    if not f or not os.path.exists(f["path"]):
        return h.send_json({"error": "gone"}, 404)
    serve_file(h, f["path"], f["mime"], f["name"] if h.q.get("dl") else None)


@route("GET", r"/api/files/(?P<fid>\w+)/thumb")
def r_fthumbget(h, fid):
    if not file_row(fid) or not os.path.exists(thumb_path(fid)):
        return h.send_json({"error": "gone"}, 404)
    serve_file(h, thumb_path(fid), "image/jpeg")


@route("POST", r"/api/files/(?P<fid>\w+)/got")
def r_fgot(h, fid):
    with LOCK:
        f = file_row(fid)
        if not f:
            return h.send_json({"error": "gone"}, 404)
        DB.execute("UPDATE files SET got=1 WHERE id=?", (fid,))
    broadcast({"t": "got", "chat": f["chat"], "msg": f["msg"], "id": fid})
    h.send_json({"ok": True})


# ── a held file: the laptop's window asks, the phone that holds it uploads it
@route("POST", r"/api/local/fetch/(?P<fid>\w+)", local=True)
def r_fetch(h, fid):
    with LOCK:
        f = file_row(fid)
        if not f or not f["held"]:
            return h.send_json({"error": "gone"}, 404)
        c = get_chat(f["chat"])
        if not c["folder_set"]:
            return h.send_json({"error": "folder"}, 409)
        if not any(x["dev"]["id"] == f["owner"] for x in CLIENTS):
            return h.send_json({"error": "offline"}, 409)
        if fid not in PENDING:
            part = reserve(c["folder"], fid, f["size"])
            if not part:
                return h.send_json({"error": "no space"}, 507)
            PENDING[fid] = {"chat": c["id"], "folder": c["folder"], "name": f["name"], "size": f["size"], "part": part,
                            "final": "", "received": 0, "done": False, "busy": threading.Lock(), "hold": False,
                            "touched": time.time(), "tick": 0.0, "fetch": True}
    broadcast({"t": "fetch", "id": fid, "to": f["owner"], "name": f["name"], "mime": f["mime"], "size": f["size"]})
    h.send_json({"ok": True})


@route("POST", r"/api/local/fetch/(?P<fid>\w+)/stop", local=True)
def r_fetchstop(h, fid):
    f = file_row(fid)
    if f:
        broadcast({"t": "fetchstop", "id": fid, "to": f["owner"]})
    end_transfer(fid, False)
    h.send_json({"ok": True})


# ── things only the laptop's own window may ask for
PICKER = threading.Lock()


def pick_folder(start, title):
    import tkinter
    from tkinter import filedialog
    with PICKER:
        root = tkinter.Tk()
        root.withdraw()
        root.attributes("-topmost", True)
        path = filedialog.askdirectory(parent=root, initialdir=start or os.path.expanduser("~"),
                                       title=title)
        root.destroy()
    return os.path.normpath(path) if path else ""


@route("POST", "/api/local/pick-folder", local=True)
def r_pick(h):
    b = h.body()
    h.send_json({"path": pick_folder(str(b.get("start") or ""), str(b.get("title") or APP_SLUG))})


@route("POST", r"/api/local/reveal/(?P<fid>\w+)", local=True)
def r_reveal(h, fid):
    f = file_row(fid)
    if not f or not os.path.exists(f["path"]):
        return h.send_json({"error": "gone"}, 404)
    subprocess.Popen(["explorer", "/select,", f["path"]])
    h.send_json({"ok": True})


@route("POST", r"/api/local/open-folder/(?P<cid>\w+)", local=True)
def r_openfolder(h, cid):
    with LOCK:
        c = get_chat(cid)
    if not c:
        return h.send_json({"error": "no chat"}, 404)
    if not c["folder"]:
        return h.send_json({"error": "no folder"}, 409)
    os.makedirs(c["folder"], exist_ok=True)
    os.startfile(c["folder"])
    h.send_json({"ok": True})


RISKY = re.compile(r"\.(exe|com|bat|cmd|msi|scr|ps1|vbs|vbe|js|jse|wsf|wsh|hta|lnk|reg|cpl|jar|pif)$", re.I)


@route("POST", r"/api/local/open/(?P<fid>\w+)", local=True)
def r_open(h, fid):
    f = file_row(fid)
    if not f or not os.path.exists(f["path"]):
        return h.send_json({"error": "gone"}, 404)
    if RISKY.search(f["path"]):     # programs are shown in Explorer, never launched from a chat
        subprocess.Popen(["explorer", "/select,", f["path"]])
    else:
        os.startfile(f["path"])
    h.send_json({"ok": True})


# ───────────────────────── network ─────────────────────────
def local_ips():
    ips = set()
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("10.255.255.255", 1))
        ips.add(s.getsockname()[0])
        s.close()
    except OSError:
        pass
    try:
        for info in socket.getaddrinfo(socket.gethostname(), None, socket.AF_INET):
            ips.add(info[4][0])
    except OSError:
        pass
    return sorted(i for i in ips if not i.startswith(("127.", "169.254.")))


def gateways():
    """With the laptop on the phone's hotspot, the default gateway *is* the phone."""
    try:
        out = subprocess.run(["route", "print", "-4", "0.0.0.0"], capture_output=True, text=True, timeout=5,
                             creationflags=NO_WINDOW, errors="replace").stdout
    except (OSError, subprocess.SubprocessError):
        return []
    return re.findall(r"^\s*0\.0\.0\.0\s+0\.0\.0\.0\s+(\d+\.\d+\.\d+\.\d+)", out, re.M)


def beacon():
    payload = json.dumps({"app": APP_SLUG, "port": LAN_PORT, "name": socket.gethostname()}).encode()
    gws, tick = [], 0
    while True:
        if tick % 5 == 0:
            gws = gateways()
        tick += 1
        for ip in local_ips():
            try:
                with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:
                    s.setsockopt(socket.SOL_SOCKET, socket.SO_BROADCAST, 1)
                    s.bind((ip, 0))
                    for target in gws + [ip.rsplit(".", 1)[0] + ".255", "255.255.255.255"]:
                        try:
                            s.sendto(payload, (target, BEACON_PORT))
                        except OSError:
                            pass
            except OSError:
                pass
        time.sleep(2)


def make_cert(cert_path, key_path):
    import datetime
    from cryptography import x509
    from cryptography.hazmat.primitives import hashes, serialization
    from cryptography.hazmat.primitives.asymmetric import ec
    from cryptography.x509.oid import NameOID
    key = ec.generate_private_key(ec.SECP256R1())
    name = x509.Name([x509.NameAttribute(NameOID.COMMON_NAME, APP_SLUG)])
    now = datetime.datetime.now(datetime.timezone.utc)
    cert = (x509.CertificateBuilder().subject_name(name).issuer_name(name).public_key(key.public_key())
            .serial_number(x509.random_serial_number()).not_valid_before(now - datetime.timedelta(days=1))
            .not_valid_after(now + datetime.timedelta(days=7300)).sign(key, hashes.SHA256()))
    with open(key_path, "wb") as f:
        f.write(key.private_bytes(serialization.Encoding.PEM, serialization.PrivateFormat.PKCS8,
                                  serialization.NoEncryption()))
    with open(cert_path, "wb") as f:
        f.write(cert.public_bytes(serialization.Encoding.PEM))


def tls_context():
    """Returns the server context and the SHA-256 of the certificate the phone pins."""
    cert, key = os.path.join(DATA, "cert.pem"), os.path.join(DATA, "key.pem")
    if not (os.path.exists(cert) and os.path.exists(key)):
        make_cert(cert, key)
    ctx = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
    ctx.minimum_version = ssl.TLSVersion.TLSv1_2
    ctx.load_cert_chain(cert, key)
    with open(cert, encoding="ascii") as f:
        der = ssl.PEM_cert_to_DER_cert(f.read())
    return ctx, hashlib.sha256(der).hexdigest()


# ───────────────────────── window ─────────────────────────
def browser_path():
    roots = [os.environ.get(k, "") for k in ("ProgramFiles(x86)", "ProgramFiles", "LOCALAPPDATA")]
    for rel in (r"Microsoft\Edge\Application\msedge.exe", r"Google\Chrome\Application\chrome.exe"):
        for root in roots:
            path = os.path.join(root, rel)
            if root and os.path.exists(path):
                return path
    return None


def open_window(url):
    exe = browser_path()
    if exe:
        subprocess.Popen([exe, f"--app={url}", "--user-data-dir=" + os.path.join(DATA, "window"), "--no-first-run",
                          "--no-default-browser-check", "--window-size=1120,740"], creationflags=NO_WINDOW)
    else:
        webbrowser.open(url)


def quit_with_window():
    """Closing the window ends the program, unless a transfer is still running."""
    seen, empty_since = False, 0.0
    while True:
        time.sleep(2)
        if any(c["dev"]["local"] for c in CLIENTS):
            seen, empty_since = True, 0.0
        elif seen and not any(time.time() - p["touched"] < 30 for p in PENDING.values()):
            empty_since = empty_since or time.time()
            if time.time() - empty_since > 6:
                os._exit(0)


def data_dir():
    """The installed program lives in Program Files, which is read-only for it; each user's data stays in their profile."""
    if FROZEN:
        return os.path.join(os.environ.get("LOCALAPPDATA", os.path.expanduser("~")), APP_SLUG)
    return os.path.join(HERE, "data")


def main():
    global DATA, DB, FP, LOCAL_PORT, LAN_PORT
    ap = argparse.ArgumentParser()
    ap.add_argument("--data")
    ap.add_argument("--no-window", action="store_true")
    ap.add_argument("--local-port", type=int, default=LOCAL_PORT)
    ap.add_argument("--lan-port", type=int, default=LAN_PORT)
    args = ap.parse_args()
    LOCAL_PORT, LAN_PORT = args.local_port, args.lan_port
    DATA = args.data or data_dir()
    os.makedirs(os.path.join(DATA, "thumbs"), exist_ok=True)
    run_file = os.path.join(DATA, "run.json")

    try:
        local = Server(("127.0.0.1", LOCAL_PORT), Handler)
    except OSError:     # already running: just bring up another window
        try:
            with open(run_file, encoding="utf-8") as f:
                open_window(json.load(f)["url"])
        except (OSError, ValueError, KeyError):
            pass
        return

    DB = open_db(os.path.join(DATA, "hotshot.db"))
    clean_leftovers()
    ctx, FP = tls_context()
    lan = Server(("0.0.0.0", LAN_PORT), Handler)
    lan.tls = ctx

    url = f"http://127.0.0.1:{LOCAL_PORT}/?k={LOCAL_SECRET}"
    with open(run_file, "w", encoding="utf-8") as f:
        json.dump({"url": url}, f)
    for c in DB.execute("SELECT id FROM chats WHERE folder_set=1").fetchall():
        DIRTY.add(c["id"])      # chats from before history files existed get theirs now
    DIRTY_WAKE.set()
    for target in (lan.serve_forever, janitor, beacon, chat_saver):
        threading.Thread(target=target, daemon=True).start()
    print(url, flush=True)
    if not args.no_window:
        threading.Thread(target=quit_with_window, daemon=True).start()
        open_window(url)
    try:
        local.serve_forever()
    except KeyboardInterrupt:
        pass


if __name__ == "__main__":
    main()
