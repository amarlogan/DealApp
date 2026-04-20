# VPS One-Time Setup Guide

This guide covers the **one-time configuration** required on the VPS before you can use `deploy.sh`.
After completing this setup, all future deploys are a single command.

---

## 1. Store secrets as persistent environment variables

SSH into your VPS and add the following to `/etc/environment` (applies system-wide, survives reboots):

```bash
sudo nano /etc/environment
```

Add these lines (replace placeholder values with your real keys):

```bash
HUNTMYDEAL_SUPABASE_URL="https://srv1603188.hstgr.cloud"
HUNTMYDEAL_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsI..."
HUNTMYDEAL_SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsI..."
HUNTMYDEAL_BASE_URL="https://huntmydeal.com"
```

Save and apply:

```bash
source /etc/environment
```

> **Note:** Variables in `/etc/environment` use the `KEY="VALUE"` format (no `export`).
> They are automatically loaded at login for all users.

---

## 2. Clone the repo onto the VPS (first time only)

```bash
cd /opt   # or wherever you want to host the app
git clone https://github.com/YOUR_USERNAME/DealDash.git
cd DealDash
```

---

## 3. Make deploy.sh executable

```bash
chmod +x deploy.sh
```

---

## 4. Run your first deploy

```bash
./deploy.sh
```

The script will:
- Read secrets from VPS env vars
- Write `.env.production` (this file is local to the VPS, never committed to git)
- Pull latest code
- Build and restart the Docker container

---

## Subsequent deploys

Every time you push new code from your desktop, SSH into the VPS and run:

```bash
cd /opt/DealDash
./deploy.sh
```

That's it. No manual file copying needed.

---

## Troubleshooting

**"Missing required VPS environment variables"**
Your shell session doesn't have the vars loaded. Run:
```bash
source /etc/environment
./deploy.sh
```

**"docker compose: command not found"**
Install Docker Compose plugin:
```bash
sudo apt install docker-compose-plugin -y
```

**Container isn't coming up**
Check logs:
```bash
docker logs huntmydeal-web --tail 50
```
