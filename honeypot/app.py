from flask import Flask, render_template, request, redirect, url_for, session, flash
import json, os, hashlib
from datetime import datetime

app = Flask(__name__)
app.secret_key = "honeypot_secret_key_2024"

USERS_FILE = "users.json"

# Default built-in accounts (honeypot targets)
DEFAULT_USERS = {
    "user": {"password": hashlib.sha256("user123".encode()).hexdigest(), "role": "user"},
    "admin": {"password": hashlib.sha256("admin123".encode()).hexdigest(), "role": "admin"},
}

def load_users():
    if os.path.exists(USERS_FILE):
        with open(USERS_FILE, "r") as f:
            data = json.load(f)
        # Merge with defaults (defaults take priority for honeypot accounts)
        merged = dict(data)
        merged.update(DEFAULT_USERS)
        return merged
    return dict(DEFAULT_USERS)

def save_users(users):
    # Only save non-default users
    saveable = {k: v for k, v in users.items() if k not in DEFAULT_USERS}
    with open(USERS_FILE, "w") as f:
        json.dump(saveable, f)

def hash_pw(pw):
    return hashlib.sha256(pw.encode()).hexdigest()

# ── LOGGING CONFIGURATION ─────────────────────────
LOG_DIR = "logs"
LOGIN_LOG = os.path.join(LOG_DIR, "attacker_login_log.txt")
COMMAND_LOG = os.path.join(LOG_DIR, "command_log.txt")

def write_log(file_path, message):

    if not os.path.exists(LOG_DIR):
        os.makedirs(LOG_DIR)

    with open(file_path, "a") as f:
        f.write(message)


def log_login_attempt(username, password, success):

    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    ip_address = request.remote_addr

    log_entry = (
        f"[{timestamp}] "
        f"IP: {ip_address} | "
        f"Username: {username} | "
        f"Password: {password} | "
        f"Status: {success}\n"
    )

    write_log(LOGIN_LOG, log_entry)


def log_command(command):

    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    ip_address = request.remote_addr

    log_entry = (
        f"[{timestamp}] "
        f"IP: {ip_address} | "
        f"Command: {command}\n"
    )

    write_log(COMMAND_LOG, log_entry)


# ── Routes ─────────────────────────────────────────────────────────────────

@app.route("/")
def home():
    return render_template("login.html")

@app.route("/login", methods=["POST"])
def login():
    username = request.form.get("username", "").strip()
    password = request.form.get("password", "").strip()
    users = load_users()
    user = users.get(username)
    if user and user["password"] == hash_pw(password):
        log_login_attempt(username, password, "SUCCESS")
        session["user"] = username
        session["role"] = user["role"]
        if user["role"] == "admin":
            return redirect(url_for("terminal"))
        return redirect(url_for("dashboard"))
    log_login_attempt(username, password, "FAILED")
    return render_template("login.html", error="Invalid username or password.")

@app.route("/signup", methods=["GET", "POST"])
def signup():
    if request.method == "POST":
        username = request.form.get("username", "").strip()
        password = request.form.get("password", "").strip()
        confirm  = request.form.get("confirm", "").strip()
        users = load_users()
        if not username or not password:
            return render_template("signup.html", error="All fields are required.")
        if username in users:
            return render_template("signup.html", error="Username already exists.")
        if password != confirm:
            return render_template("signup.html", error="Passwords do not match.")
        if len(password) < 6:
            return render_template("signup.html", error="Password must be at least 6 characters.")
        users[username] = {"password": hash_pw(password), "role": "user"}
        save_users(users)
        return render_template("login.html", success="Account created! You can now log in.")
    return render_template("signup.html")

@app.route("/dashboard")
def dashboard():
    if session.get("role") != "user":
        return redirect(url_for("home"))
    return render_template("dashboard.html", username=session.get("user"))

@app.route("/passwords")
def passwords():
    if "user" not in session:
        return redirect(url_for("home"))
    return render_template("passwords.html")

@app.route("/terminal")
def terminal():
    if session.get("role") != "admin":
        return redirect(url_for("home"))
    return render_template("terminal.html", username=session.get("user"))


@app.route("/log_command", methods=["POST"])
def log_command_route():
    data = request.get_json()
    command = data.get("command","")
    log_command(command)
    return {"status":"logged"}

@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("home"))

if __name__ == "__main__":
    app.run(debug=True)
