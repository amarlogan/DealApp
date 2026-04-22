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

# --- Google OAuth ---
HUNTMYDEAL_GOOGLE_CLIENT_ID="your-google-client-id"
HUNTMYDEAL_GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

source /etc/environment
```

---

## 2. Open Firewall Ports (Crucial for SSL)

Caddy needs ports 80 and 443 open to verify your domain and serve HTTPS. Run these on your VPS:

```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw reload
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
That's it. No manual file copying needed.

---

## 5. Caddy Setup (One-time)

If you haven't set up your reverse proxy yet, ensure Caddy is running and pointed to the `Caddyfile` in this repo.

**If using Docker Caddy:**
Ensure your Caddy container is on the `webproxy` network and mounts the `Caddyfile` from this repository.

**If using Host Caddy:**
Symlink the config:
```bash
sudo ln -sf /opt/DealDash/Caddyfile /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

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
---

## 6. Enabling Google OAuth on VPS

If you are self-hosting Supabase on the VPC, you must enable the Google provider in your Supabase configuration:

1.  **Update Supabase `.env`**:
    Locate your Supabase `docker-compose` directory on the VPS and add/update the following in your `.env` file:
    ```bash
    GOTRUE_EXTERNAL_GOOGLE_ENABLED=true
    GOTRUE_EXTERNAL_GOOGLE_CLIENT_ID="your-google-client-id"
    GOTRUE_EXTERNAL_GOOGLE_SECRET="your-google-client-secret"
    GOTRUE_EXTERNAL_GOOGLE_REDIRECT_URI="https://srv1603188.hstgr.cloud/auth/v1/callback"
    GOTRUE_EXTERNAL_GOOGLE_SKIP_NONCE_CHECK=true
    ```

2.  **Restart Supabase**:
    ```bash
    docker compose up -d
    ```

3.  **Google Cloud Console Setup**:
    - **Authorized JavaScript Origins**: `https://huntmydeal.com`
    - **Authorized Redirect URIs**: `https://srv1603188.hstgr.cloud/auth/v1/callback`
