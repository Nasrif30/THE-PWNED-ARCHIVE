# THE PWNED ARCHIVE — MASTER PROJECT PROMPT

You are a senior software architect, UI/UX designer, cybersecurity portfolio designer, and frontend engineer.

Build a complete production-ready personal cybersecurity portfolio called:

# THE PWNED ARCHIVE

The website will be hosted on GitHub Pages.

The owner is a cybersecurity enthusiast who documents:

* TryHackMe rooms
* Hack The Box machines
* PicoCTF challenges
* VulnHub machines
* Custom CTFs
* Security labs
* Writeups
* Learning notes
* Certifications

The project must be fully static.

No backend.

No frameworks.

No database.

No React.

No Vue.

No Angular.

Use only:

* HTML
* CSS
* JavaScript
* JSON
* Markdown

---

# MOST IMPORTANT REQUIREMENT

The owner updates content through GitHub.

The owner should NEVER need to edit JavaScript code to add a new machine.

Adding a new machine must be as simple as:

1. Add screenshots
2. Create markdown writeup
3. Create JSON metadata
4. git add .
5. git commit
6. git push

The website automatically updates.

---

# UPDATE WORKFLOW

Example:

assets/screenshots/operation-coldstart/

01-enum.png
02-foothold.png
03-privesc.png
04-root.png

content/

operation-coldstart.md

entries/

operation-coldstart.json

Then:

git add .
git commit -m "Added Operation Coldstart"
git push

GitHub Pages rebuilds automatically.

The website must immediately show the new room.

No code changes required.

---

# PROJECT STRUCTURE

the-pwned-archive/

index.html

assets/
profile.jpg
favicon.png

icons/
archive.svg
profile.svg
analytics.svg
terminal.svg
settings.svg
github.svg
htb.svg
thm.svg
linkedin.svg

screenshots/

content/

entries/

data/
profile.json

css/
variables.css
reset.css
layout.css
components.css
pages.css
animations.css
responsive.css

js/
app.js
router.js
theme.js
archive.js
profile.js
analytics.js
markdown.js
charts.js
terminal.js
search.js
filters.js
gallery.js

manifest.json
service-worker.js

README.md

---

# DESIGN STYLE

Create a premium Apple-inspired interface.

Design inspiration:

* Apple Fitness
* Apple Settings
* Arc Browser
* Linear
* Raycast
* GitHub

Requirements:

* Glassmorphism
* Frosted panels
* Smooth shadows
* Large rounded corners
* Premium spacing
* Professional typography
* Modern dashboard
* Responsive
* Mobile-first
* No emojis

---

# THEME SYSTEM

Dark Theme

Background:
#0d1117

Cards:
#161b22

Border:
#30363d

Text:
#f0f6fc

Accent:
#00ff9d

Light Theme

Background:
#f6f8fa

Cards:
#ffffff

Border:
#d0d7de

Text:
#24292f

Accent:
#1D9E75

Features:

* Theme toggle
* Animated toggle
* System preference detection
* localStorage persistence
* Smooth transitions

---

# SIDEBAR

Display:

Profile Picture

Name:
Alnasrif Haliddin

Handle:
@Nasrif30

Bio:
Cybersecurity Enthusiast • CTF Player • Future Penetration Tester

Navigation:

Archive
Analytics
Profile
Terminal
Settings

External Links:

GitHub
Hack The Box
TryHackMe
CTFtime
LinkedIn

Theme Toggle

Footer:

The Pwned Archive © 2026

Documenting challenges, machines, and lessons learned.

---

# PROFILE DATA

Store profile information in:

data/profile.json

Example:

{
"name": "Alnasrif Haliddin",
"handle": "@Nasrif30",
"bio": "Cybersecurity Enthusiast • CTF Player • Future Penetration Tester",
"certifications": [
"TryHackMe Junior Penetration Tester"
],
"learningFocus": "Web Application Security",
"github": "https://github.com/Nasrif30",
"linkedin": "",
"htb": "",
"thm": ""
}

The website loads profile data automatically.

---

# ENTRY DATA FORMAT

Every challenge uses a JSON file.

Example:

entries/operation-coldstart.json

{
"slug": "operation-coldstart",
"title": "Operation Coldstart",
"platform": "TryHackMe",
"difficulty": "Medium",
"os": "Linux",
"date": "2026-06-07",
"flags": 2,
"favorite": true,
"tags": [
"LFI",
"Privilege Escalation",
"Linux"
],
"writeup": "content/operation-coldstart.md",
"screenshots": [
"assets/screenshots/operation-coldstart/01-enum.png",
"assets/screenshots/operation-coldstart/02-foothold.png",
"assets/screenshots/operation-coldstart/03-privesc.png",
"assets/screenshots/operation-coldstart/04-root.png"
]
}

---

# ARCHIVE PAGE

Homepage.

Show:

Hero Widgets:

* Total Pwned
* Total Flags
* Current Streak
* Favorite Platform
* Latest Machine

Search:

* Name
* Platform
* Difficulty
* Tags

Filters:

* All
* Favorites
* HackTheBox
* TryHackMe
* PicoCTF
* VulnHub
* Custom

Sorting:

* Date
* Name
* Difficulty
* Platform

Views:

* Grid
* Timeline

Cards show:

Title
Platform
Difficulty
Date
OS
Flags
Tags

---

# ENTRY PAGE

When a card is clicked:

Show:

Title
Platform
Difficulty
Date
OS
Flags
Tags

Writeup:

Render Markdown.

Support:

* Headers
* Lists
* Tables
* Images
* Code blocks
* Syntax highlighting

---

# SCREENSHOT GALLERY

Render screenshots from JSON.

Features:

* Masonry gallery
* Lightbox
* Fullscreen
* Keyboard navigation
* Swipe support
* Lazy loading
* Zoom support

Owner uploads screenshots through GitHub.

No upload system required.

---

# ANALYTICS PAGE

Generate analytics automatically from repository content.

Charts:

* Platform Distribution
* Difficulty Distribution
* OS Distribution
* Monthly Activity

Use Canvas API.

Do not use chart libraries.

---

# PROFILE PAGE

Display:

Profile
Statistics
Certifications
Learning Focus

Platform Progress

Achievements

External Links

---

# ACHIEVEMENTS

Calculate automatically.

Examples:

First Blood
10 Machines
25 Machines
50 Machines
100 Machines

Linux Master
Windows Hunter

HTB Veteran
THM Explorer

CTF Addict

No manual tracking.

---

# TERMINAL

Collapsible terminal.

Prompt:

user@pwned-archive:~$

Commands:

help
whoami
stats
latest
achievements
archive
clear

Terminal uses real repository data.

---

# RECENT ACTIVITY

Automatically generated from entry dates.

Show latest rooms added.

---

# PWA

Generate:

manifest.json

service-worker.js

Offline support

Install prompt

Caching

---

# SEO

Meta title

Meta description

Open Graph

Twitter Cards

Favicon

Structured metadata

---

# ACCESSIBILITY

ARIA labels

Keyboard navigation

Focus states

Reduced motion support

Semantic HTML

---

# README

Generate complete documentation.

Include:

Installation

GitHub Pages deployment

How to add a room

How to add screenshots

How to create writeups

How to customize profile

How to change theme

Folder structure explanation

---

# SAMPLE CONTENT

Generate:

10 realistic sample entries:

* TryHackMe
* Hack The Box
* PicoCTF
* VulnHub
* Custom CTF

Generate sample markdown writeups.

Generate sample screenshots folder structure.

Generate all SVG icons.

Generate every file completely.

Do not skip files.

Do not output summaries.

Create production-ready source code only.

Write files one by one until the entire project is complete.
