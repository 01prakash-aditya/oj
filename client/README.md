# AlgoU Online Judge

**AlgoU** is an **Online Judge platform** built with the **MERN stack** (MongoDB, Express.js, React.js, Node.js). It supports coding contests with automatic code evaluation, problem management, and leaderboard functionality.

---

## Overview

**AlgoU** enables:

- **User Registration and Login** with JWT-based authentication
- **Problem Listing** with filtering options
- **Code Submission** with real-time verdict feedback
- **Leaderboard Tracking** based on user performance
- **User Profiles** displaying past submissions

---

## Tech Stack

- **Frontend**: React.js
- **Backend**: Node.js + Express.js
- **Database**: MongoDB
- **Code Evaluation**: Docker containers with asynchronous job processing via Redis

---

## System Workflow

1. **User submits code** through the platform.
2. **Submission is queued** using a message broker (e.g., Redis).
3. **Worker service** runs the code inside a **Docker container**.
4. Output is **compared with expected results** stored in the database.
5. **Verdict** is stored and shown on the frontend.

---

## Security Measures

- **Docker sandboxing** for safe and isolated execution
- **JWT Authentication**
- **Rate-limiting** on code submissions
- **Input validation** and escaping to prevent injection attacks

---

## Future Enhancements

- **Plagiarism Detection** (e.g., MOSS integration)
- **Real-Time Leaderboard** using WebSockets
- **Timer-Based Contests**
- **Multi-Language Support** using language-specific Docker images

---
