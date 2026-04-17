# Multi-Stage Honeypot — Setup & Run Guide

## Requirements
- Python 3.8+
- pip

## Installation

```bash
pip install -r requirements.txt
```

## Run

```bash
python app.py
```

Then open: http://127.0.0.1:5000

---

## Credentials (built-in honeypot accounts)

| Username | Password | Role |
|----------|----------|------|
| user     | user123  | Normal user — sees file directory |
| admin    | admin123 | Admin — redirected to terminal |

New accounts created via the Sign Up page are stored in `users.json`
and are granted normal user (file directory) access.

---

## Workflow

1. **Login as `user` / `user123`** → File directory (dashboard)
2. Click **Passwords.txt** → credentials file revealed
3. **Login as `admin` / `admin123`** → Ubuntu terminal
4. Type **`ls`** → shows `ConfidentialApp.exe`
5. Type **`ConfidentialApp.exe`** → ransomware popup triggered
