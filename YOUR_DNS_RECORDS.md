# DNS Records for xpaciagroup.com (primary) and xpacia.org (redirect)

## Your IP Addresses

- **IPv4**: `YOUR_PUBLIC_IPV4` ← **Use this for your A record**
- **IPv6**: `YOUR_PUBLIC_IPV6` (optional)

## DNS Records to Add

Go to your domain registrar(s) and add these records for both domains:

### Required: IPv4 Records (A Records)

```
Type: A
Name: @ (or leave blank)
Value: YOUR_PUBLIC_IPV4
TTL: 3600 (or default)

Type: A
Name: www
Value: YOUR_PUBLIC_IPV4
TTL: 3600 (or default)
```

### Optional: IPv6 Records (AAAA Records)

If your registrar supports IPv6 and you want maximum compatibility:

```
Type: AAAA
Name: @ (or leave blank)
Value: YOUR_PUBLIC_IPV6
TTL: 3600 (or default)

Type: AAAA
Name: www
Value: YOUR_PUBLIC_IPV6
TTL: 3600 (or default)
```

## After Adding DNS Records

1. **Wait 15-30 minutes** for DNS to propagate
2. **Test DNS** (on your Mac or Pi):
   ```bash
   nslookup xpaciagroup.com
   ```
   Should show: `YOUR_PUBLIC_IPV4`

3. **Continue with Step 3** in `DOMAIN_SETUP.md` (Update Nginx)

## Important: Port Forwarding

Since you're on a home network, you MUST set up port forwarding on your router:

1. Find your Pi's local IP:
   ```bash
   hostname -I
   ```
   (Should show something like `192.168.1.100`)

2. On your router admin page, forward:
   - Port 80 → Your Pi's local IP → Port 80
   - Port 443 → Your Pi's local IP → Port 443

See `DOMAIN_SETUP.md` for detailed port forwarding instructions.
