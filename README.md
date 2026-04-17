# Multi-Stage "Chained" Honeypot

## Project Overview

The Multi-Stage "Chained" Honeypot is a web-based deception system designed to simulate attacker behavior across multiple stages of compromise. The honeypot mimics a realistic corporate environment where attackers are lured through fake credentials, exposed password files, and a simulated administrative terminal.

This project demonstrates cybersecurity concepts such as deception engineering, privilege escalation simulation, and attacker interaction logging in a safe and controlled environment.

The system is built using Python Flask and includes realistic user interfaces designed to mimic enterprise login portals and server environments.

---

## Objectives

This project was designed to:

- Simulate attacker movement through multiple system layers
- Demonstrate credential harvesting traps
- Create a believable corporate file environment
- Simulate administrative privilege escalation
- Provide a fake Ubuntu terminal interface
- Trigger a deception-based response during execution attempts
- Practice honeypot development using Python and Flask
- Log Collection to identfy attacker

---

## Attack Simulation Workflow

The honeypot simulates the following attack chain:

### Step 1 — Initial Login

Attacker logs into the system using normal user credentials.

Example credentials:

Username: user  
Password: user123

After login, the attacker is redirected to a corporate file directory.

---

### Step 2 — File Directory Lure

The user dashboard displays realistic corporate files including:

- SecurityPolicy.pdf
- NetworkPolicy.docx
- Passwords.txt

The Passwords.txt file acts as a bait file.

---

### Step 3 — Privilege Escalation Trap

When Passwords.txt is opened, it displays administrator credentials:

Username: admin  
Password: admin123

This simulates poor credential management practices often exploited by attackers.

---

### Step 4 — Administrator Login

The attacker logs in using the stolen administrator credentials.

After login, they are redirected to a simulated Ubuntu terminal interface.

---

### Step 5 — Terminal Interaction

Inside the terminal, the attacker can run:

ls

The command displays:

ConfidentialApp.exe

This file appears to be a sensitive application.

---

### Step 6 — Final Trap Execution

When the attacker executes:

ConfidentialApp.exe

A popup message appears:

"Hey hacker, you have installed Ransomware!"

This represents a deception-triggered security event.

---

## Technologies Used

- Python 3
- Flask
- HTML5
- CSS3
- JavaScript
- Ubuntu-style terminal simulation
- Web-based deception techniques

---

## Project Structure
