![Congrats](assets/screenshots/bsit-student/congrats.png)

# BSIT Student at Zamboanga City — Challenge Overview
**Room Link:** [BSIT Student at Zamboanga City](https://tryhackme.com/room/bsitstudentatzamboangacity)  
**Play Room:** [Join on TryHackMe](https://tryhackme.com/jr/bsitstudentatzamboangacity)

This room is designed as a realistic university penetration testing engagement focused on web application security, Linux enumeration, and privilege escalation. Players are expected to investigate a newly deployed Student Portal that has become the subject of an internal security incident.

The challenge emphasizes careful reconnaissance, application analysis, and chaining multiple discoveries together. Rather than relying on outdated exploits or guesswork, participants must follow a structured methodology similar to a real-world penetration test.

## Difficulty

Medium

## Skills Covered

* Network Reconnaissance
* Service Enumeration
* Web Application Enumeration
* Directory Discovery
* Source Code Analysis
* Authentication Testing
* Session Management
* Authorization Testing
* Information Disclosure
* File Upload Security
* Linux Enumeration
* Privilege Escalation
* Post-Exploitation

## Recommended Methodology

### Initial Reconnaissance

Begin by identifying exposed services and understanding the attack surface. Focus on gathering information about available ports, running services, and application technologies.

### Web Application Assessment

Carefully enumerate the web application and look for hidden functionality that may not be immediately visible through normal navigation. Pay attention to developer artifacts, forgotten endpoints, and application logic.

### Application Analysis

Review discovered resources and analyze how the application handles authentication, authorization, and user interactions. Small observations often reveal larger weaknesses later in the challenge.

### Obtaining Initial Access

The room contains a realistic attack path that requires combining information gathered during enumeration. Avoid assumptions and validate every finding before proceeding.

### Linux Enumeration

After gaining access, perform systematic Linux enumeration. Identify user accounts, scheduled tasks, application files, configuration data, and privilege boundaries.

### Privilege Escalation

The final stage requires understanding how automated system processes interact with user-controlled resources. Review permissions carefully and investigate anything that executes with elevated privileges.

## Learning Objectives

This room was created to teach players how to:

* Think like a penetration tester
* Perform thorough enumeration
* Analyze application behavior
* Identify security weaknesses
* Chain vulnerabilities together
* Enumerate Linux environments effectively
* Escalate privileges responsibly
* Document findings during an engagement

## Notes

This room intentionally avoids requiring brute-force attacks or password guessing. Success depends on observation, analysis, and methodical testing.

Players are encouraged to document their findings throughout the assessment and approach the challenge as if they were conducting a professional penetration test for a university environment.

For access to the room, visit the official TryHackMe room page and complete the challenges there.

---
**FLAGS:**
![Flags Captured](assets/screenshots/bsit-student/flags.png)
