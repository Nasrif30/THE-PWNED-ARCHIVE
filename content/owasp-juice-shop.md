![Congrats](assets/screenshots/owasp-juice-shop/congrats.png)

# TryHackMe: OWASP Juice Shop - Complete Walkthrough

This is a comprehensive walkthrough for the TryHackMe OWASP Juice Shop room, covering all 8 tasks. The room focuses on the OWASP Top 10 vulnerabilities using a deliberately vulnerable web application.

## Table of Contents
- [Task 1: Open for Business!](#task-1-open-for-business)
- [Task 2: Let's Go on an Adventure!](#task-2-lets-go-on-an-adventure)
- [Task 3: Inject the Juice (SQL Injection)](#task-3-inject-the-juice-sql-injection)
- [Task 4: Who Broke My Lock? (Broken Authentication)](#task-4-who-broke-my-lock-broken-authentication)
- [Task 5: AH! Don't Look! (Sensitive Data Exposure)](#task-5-ah-dont-look-sensitive-data-exposure)
- [Task 6: Who's Flying This Thing? (Broken Access Control)](#task-6-whos-flying-this-thing-broken-access-control)
- [Task 7: Where Did That Come From? (XSS)](#task-7-where-did-that-come-from-xss)
- [Task 8: Exploration! (Score Board)](#task-8-exploration-score-board)

## Task 1: Open for Business!
**Overview**
Deploy the TryHackMe VM attached to this task to get started. Access the machine by copying its IP address into your browser.

**Answer:** No answer needed

## Task 2: Let's Go on an Adventure!
Before hacking, browse around the site with Burp intercept off to build a site map.

**Question #1: What's the Administrator's email address?**
Navigate to the Apple Juice product page and view the reviews section. The admin's email is visible there.
**Answer:** `admin@juice-sh.op`

**Question #2: What parameter is used for searching?**
Click the magnifying glass in the top right, enter any text, and observe the URL.
**Answer:** `q`

**Question #3: What show does Jim reference in his review?**
Jim reviewed the Green Smoothie product and mentioned a "replicator". Searching this reveals the TV show Star Trek.
**Answer:** `Star Trek`

## Task 3: Inject the Juice (SQL Injection)
SQL injection occurs when an attacker enters a malicious query to manipulate the database.

**Question #1: Log into the administrator account!**
**Method:** SQL injection via the login form
**Steps:**
1. Turn on Burp Intercept
2. Navigate to login page
3. Enter any email and password
4. Capture the request and change the email to: `' or 1=1--`
5. Forward the request

Why it works: The `'` closes the SQL query brackets, `OR 1=1` is always true, and `--` comments out the rest of the query.
**Answer:** `32a5e0f21372bcc1000a6088b93b458e41f0e02a`

**Question #2: Log into the Bender account!**
**Method:** Same SQL injection technique
Capture the login request and change the email to: `bender@juice-sh.op'--`
Why no 1=1? The email address itself is valid, so we don't need to force it to be true.
**Answer:** `fb364762a3c102b2db932069c0e6b78e738d4066`

## Task 4: Who Broke My Lock? (Broken Authentication)

**Question #1: Bruteforce the Administrator account's password!**
**Method:** Burp Suite Intruder
**Steps:**
1. Capture a login request in Burp
2. Right-click → Send to Intruder
3. Go to Positions → Clear §
4. Place § symbols around the password value
5. Payloads → Load → `/usr/share/wordlists/SecLists/Passwords/Common-Credentials/best1050.txt`
6. Start attack - look for status 200 (success)

The password is: `admin123`
**Answer:** `c2110d06dc6f81c67cd8099ff0ba601241f1ac0e`

**Question #2: Reset Jim's password!**
**Method:** Password reset exploitation
**Steps:**
1. Go to Forgot Password page
2. Enter Jim's email: `jim@juice-sh.op`
3. Security question: "Your eldest siblings middle name?"
4. From Star Trek lore, Jim Kirk's brother's middle name is Samuel
5. Enter Samuel and set a new password

**Answer:** `094fbc9b48e525150ba97d05b942bbf114987257`

## Task 5: AH! Don't Look! (Sensitive Data Exposure)

**Question #1: Access the Confidential Document!**
**Method:** Browse the exposed FTP directory
**Steps:**
1. Navigate to `http://MACHINE_IP/ftp/`
2. Download `acquisitions.md`
3. Return to the homepage to receive the flag

**Answer:** `edf9281222395a1c5fee9b89e32175f1ccf50c5b`

**Question #2: Log into MC SafeSearch's account!**
From his song, the password is "Mr. Noodles" with vowels replaced by zeros.
**Credentials:**
- **Email:** `mc.safesearch@juice-sh.op`
- **Password:** `Mr. N00dles`

**Answer:** `66bdcffad9e698fd534003fbb3cc7e2b7b55d7f0`

**Question #3: Download the Backup file!**
**Method:** Poison Null Byte bypass
The `/ftp/package.json.bak` file returns a 403 error (only .md and .pdf allowed).

Poison Null Byte technique:
- Null byte: `%00`
- URL encoded: `%2500`
- Bypass URL: `http://MACHINE_IP/ftp/package.json.bak%2500.md`

Why it works: The null byte terminates the string, so the server ignores the `.md` extension.
**Answer:** `bfc1e6b4a16579e85e06fee4c36ff8c02fb13795`

## Task 6: Who's Flying This Thing? (Broken Access Control)
Broken Access Control includes:
- **Horizontal Privilege Escalation:** Accessing another user's data at the same permission level
- **Vertical Privilege Escalation:** Accessing data of a higher permission level

**Question #1: Access the administration page!**
**Method:** JavaScript file enumeration
**Steps:**
1. Open Firefox Debugger (F12)
2. Refresh the page and look for `main-es2015.js`
3. Navigate to `http://MACHINE_IP/main-es2015.js`
4. Click the `{}` button to format
5. Search for "admin" - find path: "administration"
6. Access `http://MACHINE_IP/#/administration` while logged in as admin

**Answer:** `946a799363226a24822008503f5d1324536629a0`

**Question #2: View another user's shopping basket!**
**Method:** Parameter tampering
**Steps:**
1. Log in as admin
2. Click "Your Basket" and capture with Burp
3. Find `GET /rest/basket/1` request
4. Change to `/rest/basket/2` and forward

**Answer:** `41b997a36cc33fbe4f0ba018474e19ae5ce52121`

**Question #3: Remove all 5-star reviews!**
**Method:** Admin page action
Navigate to `http://MACHINE_IP/#/administration` (logged in as admin) and click the trash/bin icon next to any 5-star review.

**Answer:** `50c97bcce0b895e446d61c83a21df371ac2266ef`

## Task 7: Where Did That Come From? (XSS)
XSS (Cross-Site Scripting) has three types:
- **DOM XSS:** Uses HTML environment to execute JavaScript
- **Persistent (Server-side):** JavaScript stored on the server
- **Reflected (Client-side):** JavaScript reflected off the server

**Question #1: Perform a DOM XSS!**
**Payload:** `<iframe src="javascript:alert(xss)">`
Enter this into the search bar (magnifying glass) and press Enter.
**Answer:** `9aaf4bbea5c30d00a1f5bbcfce4db6d4b0efe0bf`

**Question #2: Perform a persistent XSS!**
**Method:** True-Client-IP header injection
**Steps:**
1. Log in as admin
2. Navigate to Last Login IP page
3. Turn on Burp Intercept
4. Logout and capture the request
5. Add header: `True-Client-IP: <iframe src="javascript:alert(xss)>"`
6. Forward, log back in, revisit Last Login IP page

**Answer:** `149aa8ce13d7a4a8a931472308e269c94dc5f156`

**Question #3: Perform a reflected XSS!**
**Method:** URL parameter injection
**Steps:**
1. Log in as admin
2. Go to Order History
3. Click the "Truck" icon for any order
4. Replace the id parameter value with: `<iframe src="javascript:alert(xss)>"`
5. Refresh the page

**Answer:** `23cefee1527bde039295b2616eeb29e1edc660a0`

## Task 8: Exploration! (Score Board)
**Access the Score Board page!**
The Score Board shows all completed challenges and their flags.
**URL:** `http://MACHINE_IP/#/score-board`
Simply navigating to this page marks the challenge as complete.
Note: The flag is displayed at the top of the Score Board page. Your instance may generate a unique hash.
