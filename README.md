# 🎓 StudyHub - Academic Resource Platform

![Project Status](https://img.shields.io/badge/Status-Live-success)
![Stack](https://img.shields.io/badge/Tech-Hybrid_Architecture-blueviolet)

**StudyHub** is a comprehensive academic resource platform designed for university students. It bridges the gap between static learning resources (Notes, PYQs) and dynamic peer-to-peer collaboration (Q&A Forum).

🔗 **Live Demo:** [Insert Your Netlify Link Here]

---

## 🚀 The Architecture: Hybrid Micro-Frontend

This project demonstrates a **Hybrid Architecture** approach to handle distinct performance requirements:

1.  **Landing & Resource Engine (Vanilla JS):**
    * Built with pure HTML/CSS/JS for maximum load speed and SEO performance.
    * Handles static content delivery (Lecture notes, PDF integration, 7000+ indexed resources).
2.  **Student Forum (React + Vite):**
    * A dynamic Single Page Application (SPA) for the Q&A section.
    * Features real-time state management and component-based UI.
    * Powered by **Firebase** for Authentication and Real-time Database.

---

## 🛠️ Tech Stack

| Domain | Technologies |
| :--- | :--- |
| **Frontend (Core)** | ![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white) ![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white) ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black) |
| **Frontend (Forum)** | ![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB) ![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white) |
| **Backend / DB** | ![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=flat&logo=firebase&logoColor=black) (Auth & Firestore) |
| **Hosting** | ![Netlify](https://img.shields.io/badge/Netlify-00C7B7?style=flat&logo=netlify&logoColor=white) |

---

## ✨ Key Features

* **📚 Centralized Resources:** Aggregated database of Past Year Questions (PYQs), handwritten notes, and video lectures.
* **🔐 User Authentication:** Secure Google & Email login via Firebase Auth.
* **💬 Live Q&A Forum:** Students can post doubts and receive answers in real-time.
* **⚡ Optimized Performance:** Static assets are served via a lightweight Vanilla JS engine, while interactive elements use React.
