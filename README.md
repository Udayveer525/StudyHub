# StudyHub 2.0 🎓

A comprehensive, AI-powered e-learning platform designed to streamline exam preparation, resource sharing, and collaborative learning for students. StudyHub features role-based access, a community Q&A forum, and **Ollie**, an intelligent AI tutor that parses syllabus PDFs, generates quizzes, and creates personalized study timetables.

## ✨ Core Features

* **🧠 Ollie (AI Tutor Integration):** * **Syllabus Parsing:** Upload syllabus PDFs to automatically extract units, topics, and weightage using `pdfjs-dist` and the Groq LLM.
    * **Interactive Study Chat:** Explain or review specific syllabus topics with AI-guided assistance.
    * **Dynamic Quizzes:** Auto-generate MCQs based on specific syllabus topics to test knowledge.
    * **Smart Timetables:** Generate personalized study schedules based on exam dates, daily available hours, and weak topics.
* **📚 Resource Library:** Upload, manage, and share academic resources categorized by degree, semester, and subject.
* **💬 Community Q&A:** A dedicated discussion forum for students to ask questions, share answers, and collaborate.
* **🔐 Authentication & Profiles:** Secure JWT-based authentication with distinct user profiles and study progress tracking.
* **🛡️ Admin Dashboard:** Dedicated admin panel to manage syllabus structures, review reported content, and moderate user submissions.

## 🛠️ Tech Stack

### Frontend
* **Framework:** React 19 + Vite
* **Routing:** React Router v7
* **Styling:** Tailwind CSS + PostCSS
* **Icons:** Lucide React & Heroicons

### Backend
* **Runtime:** Node.js with Express.js
* **Database:** PostgreSQL (via `pg` client)
* **AI Integration:** Groq SDK
* **Authentication:** JSON Web Tokens (JWT) & bcrypt
* **File Handling:** Multer & pdfjs-dist
* **Email Services:** Resend / Brevo

## 📂 Project Structure

```text
StudyHub/
├── backend/                # Express server and API logic
│   ├── src/
│   │   ├── auth/           # Authentication controllers and middleware
│   │   ├── config/         # Database and environment configurations
│   │   ├── controllers/    # API route controllers
│   │   ├── ollie/          # AI tutor logic, Groq client, PDF parsing
│   │   └── routes/         # Express route definitions
│   └── package.json
└── frontend/               # React application
    ├── src/
    │   ├── components/     # Reusable UI components (Nav, Cards, etc.)
    │   ├── pages/          # Public and protected application views
    │   ├── config/         # API and environment configs
    │   └── context/        # React Context (Auth state)
    ├── tailwind.config.js
    └── package.json
```

## 🚀 Getting Started

### Prerequisites
Make sure you have the following installed on your local machine:
* [Node.js](https://nodejs.org/en/) (v18 or higher recommended)
* [PostgreSQL](https://www.postgresql.org/)
* A [Groq API Key](https://console.groq.com/) for the AI tutor

### 1. Clone the Repository

```bash
git clone [https://github.com/your-username/StudyHub.git](https://github.com/your-username/StudyHub.git)
cd StudyHub
```

### 2. Backend Setup
Navigate to the backend directory and install dependencies:

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory with the following variables:

```env
PORT=5000
DATABASE_URL=postgres://username:password@localhost:5432/studyhub_db
JWT_SECRET=your_super_secret_jwt_key
GROQ_API_KEY=your_groq_api_key
# Add your email provider keys (Brevo/Resend) here
```

Start the development server:

```bash
npm run dev
```
*The backend API will run on `http://localhost:5000`.*

### 3. Frontend Setup
Open a new terminal, navigate to the frontend directory, and install dependencies:

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` directory:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Start the Vite development server:

```bash
npm run dev
```
*The frontend will run on `http://localhost:5173`.*

## 📜 License

This project is licensed under the ISC License.

---
*Built to decode complex concepts and make collaborative learning seamless.*
