# Nginx Setup for Xpacia Group Frontend + Backend

## 1. Install Nginx on Pi

```bash
sudo apt-get update
sudo apt-get install -y nginx
```

## 2. Create Nginx Config

```bash
sudo tee /etc/nginx/sites-available/xpaciagroup-site > /dev/null << 'EOF'
server {
    listen 80;
    server_name xpaciagroup.com www.xpaciagroup.com xpacia.org www.xpacia.org;  # Your domains

    # Root directory for frontend files
    root /home/bernardfatoye/xpaciagroup;
    index index.html;

    # Serve static files (HTML, CSS, JS, images)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to backend
    location /api/ {
        proxy_pass http://localhost:3002/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Origin $scheme://$host;
    }
}
EOF
```

## 3. Enable Site

```bash
# Remove default site (optional)
sudo rm /etc/nginx/sites-enabled/default

# Enable site
sudo ln -s /etc/nginx/sites-available/xpaciagroup-site /etc/nginx/sites-enabled/xpaciagroup-site

# Test config
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

## 4. Update Backend CORS

Update `/home/bernardfatoye/xpaciagroup/hta-backend/.env`:

```
CORS_ORIGIN=http://YOUR_PI_IP
```

Or if accessing via domain:
```
CORS_ORIGIN=https://xpaciagroup.com,https://www.xpaciagroup.com,https://xpacia.org,https://www.xpacia.org
```

**Note**: Use `https://` if you've set up SSL (recommended). See `DOMAIN_SETUP.md` for SSL setup instructions.

Then restart backend:
```bash
sudo systemctl restart hta-backend
```

## 5. Set Permissions

```bash
# Make sure Nginx can read the frontend files
sudo chmod -R 755 /home/bernardfatoye/xpaciagroup
```

## 6. Test

- Frontend: `http://YOUR_PI_IP`
- API: `http://YOUR_PI_IP/api/contact` (should return 404/405 for GET, which is expected)

## Troubleshooting

Check Nginx logs:
```bash
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

Check backend logs:
```bash
sudo journalctl -u hta-backend -f
```
