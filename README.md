# AlgoU Online Judge

**AlgoU** is an **Online Judge platform** built with the **MERN stack** (MongoDB, Express.js, React.js, Node.js). It supports coding problems with automatic code evaluation, problem management, AI review and leaderboard functionality.

---

![Home](https://github.com/01prakash-aditya/online-judge/blob/e88b29a8e858b5856ab65424a2c79794997ad7e7/proj_images/Screenshot%202025-05-28%20092317.png)

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
- **Code Evaluation**: Docker containers 

---

## Architecture Overview  
AlgoU Online Judge follows the MVC (Model-View-Controller) architectural pattern to ensure clean separation of concerns and maintainable code structure.  
  
![MVC](https://github.com/01prakash-aditya/online-judge/blob/7423f06cbc75a0ad3cda7ca53b27bbf452c18a1d/proj_images/Screenshot%202025-05-28%20152116.png)

---
  
## MVC Implementation  
**Model Layer (Database & Data Logic)**  
  
User Model: Handles user authentication, profiles, and submissions  
Problem Model: Manages coding problems, test cases, and metadata  
Discussion Model: Manages problem discussions, comments, and community interactions  
  
**Routes Layer (API Endpoints)**  
  
Auth Routes: User authentication and authorization endpoints   
User Routes: User profile management and statistics  
Community Routes: Discussion forums and community interactions  
Problem Routes: Problem CRUD operations and submissions  
  
**Controller Layer (Backend API Logic)**
   
User Controller: Manages user profiles, statistics, and submissions  
Auth Controller: Handles login, registration, and JWT verification  
  
**View Layer (Frontend/React Components)**  
  
Problem List View: Displays available coding problems  
Code Editor View: Interactive code submission interface  
Profile View: User dashboard and submission history  
Leaderboard View: Real-time rankings and statistics  
  
---
  
## System Workflow

1. **User submits code** through the platform
2. **Worker service** runs the code inside a **Docker container**.
3. Output is **compared with expected results** stored in the database.
4. **Verdict** is stored and shown on the frontend.

---

## Security Measures

- **Docker sandboxing** for safe and isolated execution
- **JWT Authentication**
- **Input validation** and escaping to prevent injection attacks

---

## Installation and Setup

### Prerequisites

- **Node.js** (v14 or higher)
- **npm** or **yarn**
- **C++ compiler, Python3, Java jdk24** installed on your system

---

### Compiler & AI review Setup

1. Navigate to the backend directory:

    ```bash
    cd backend
    ```

2. Install dependencies:

    ```bash
    npm install
    npm i @google/genai
    ```

3. Create a `.env` file with the following variables:

    ```env
    PORT=8000
    GOOGLE_API_KEY=your_google_api_key
    ```

4. Start the server:

    ```bash
    npx nodemon index.js
    ```

---

### Frontend Setup

1. Navigate to the frontend directory:

    ```bash
    cd client
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

3. Create a `.env` file with the following variables:

    ```env
    VITE_FIREBASE_API_KEY=your_firebase_api_key
    ```

4. Start the development server:

    ```bash
    npm run dev
    ```

5. Open your browser and go to:  
   [http://localhost:5173](http://localhost:5173) *(or the port shown in your terminal)*

---

### Backend Setup

1. Install dependencies:

    ```bash
    npm install
    npm i mongoose
    ```

2. Create a `.env` file with the following variables:

    ```env
    MONGO=your_mongo_uri
    JWT_SECRET='...'
    ```

3. Start the development server:

    ```bash
    npm run dev
    ```

---

## 📡 API Endpoints

- `GET /` – Health check endpoint  
- `POST /run` – Execute code with input  
  **Body:**
  ```json
  {
    "language": "string",
    "code": "string",
    "input": "string"
  }
  ```

- `POST /ai-review` – Get AI feedback on code  
  **Body:**
  ```json
  {
    "code": "string"
  }
  ```

---

## 🐳 Docker Support

The backend includes Docker configuration for containerized deployment.

1. **Build the Docker image:**

    ```bash
    docker-compose up --build
    ```

2. **Run on PORT:**

    ```bash
    (http://localhost:5173)
    ```
3. **To stop the containers:**

   ```bash
   docker-compose down
   ```
---

## Best Practices Implemented  
**Code Organization**  
  
Separation of Concerns: Clear distinction between frontend, backend, and database layers  
Modular Structure: Components and services are organized in logical modules  
RESTful API Design: Consistent and intuitive endpoint naming conventions  
  
**Security Best Practices**    
  
Environment Variables: Sensitive data stored in .env files  
Input Sanitization: All user inputs are validated and sanitized  
Authentication Middleware: JWT-based route protection  
Docker Isolation: Code execution in sandboxed containers  
CORS Configuration: Proper cross-origin resource sharing setup  
  
**Performance Optimization**  
  
Database Indexing: Optimized queries with proper indexing  
Caching Strategy: Redis implementation for frequently accessed data  
Code Splitting: Frontend bundle optimization with lazy loading  
Connection Pooling: Efficient database connection management  
  
**Development Practices**  
  
Version Control: Git workflow with meaningful commit messages  
Error Handling: Comprehensive error catching and logging  
Code Documentation: Inline comments and README documentation  
Testing Strategy: Unit and integration tests for critical components  
  
**Deployment & DevOps**  
  
Containerization: Docker for consistent deployment environments  
Environment Configuration: Separate configs for development, testing, and production  
Monitoring & Logging: Application performance monitoring setup  
CI/CD Pipeline: Automated testing and deployment workflows  

---

## Project Images 

**Online Compiler**
![Compiler](https://github.com/01prakash-aditya/online-judge/blob/4d5c1ad93d4724c686fa889b37fd93a476a6d41d/proj_images/Screenshot%202025-05-28%20092345.png)

**AI Chat Assistant**
![ChatBot](https://github.com/01prakash-aditya/online-judge/blob/4d5c1ad93d4724c686fa889b37fd93a476a6d41d/proj_images/Screenshot%202025-05-28%20092357.png)

**Problem Set**
![ProblemSet](https://github.com/01prakash-aditya/online-judge/blob/4d5c1ad93d4724c686fa889b37fd93a476a6d41d/proj_images/Screenshot%202025-05-28%20092418.png)

**LeaderBoard**
![Leaderboard](https://github.com/01prakash-aditya/online-judge/blob/4d5c1ad93d4724c686fa889b37fd93a476a6d41d/proj_images/Screenshot%202025-05-28%20092433.png)

**Discussions**
![Discussions](https://github.com/01prakash-aditya/online-judge/blob/4d5c1ad93d4724c686fa889b37fd93a476a6d41d/proj_images/Screenshot%202025-05-28%20092443.png)

**Contribute Page**
![Contribute](https://github.com/01prakash-aditya/online-judge/blob/4d5c1ad93d4724c686fa889b37fd93a476a6d41d/proj_images/Screenshot%202025-05-28%20092455.png)

**Profile Page**
![Profile](https://github.com/01prakash-aditya/online-judge/blob/4d5c1ad93d4724c686fa889b37fd93a476a6d41d/proj_images/Screenshot%202025-05-28%20092504.png)

**SignUp Page**
![SignUp](https://github.com/01prakash-aditya/online-judge/blob/4d5c1ad93d4724c686fa889b37fd93a476a6d41d/proj_images/Screenshot%202025-05-28%20093024.png)

---

## Future Enhancements

- **Plagiarism Detection** (e.g., MOSS integration)
- **Real-Time Leaderboard** using WebSockets
- **Timer-Based Contests**
- **Multi-Language Support** using language-specific Docker images

---
