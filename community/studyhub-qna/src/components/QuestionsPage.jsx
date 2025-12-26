import React, { useEffect, useState, useMemo } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase_config";
import AskQuestionForm from "./AskQuestionForm";
import "./QuestionsPage.css";
import { useNavigate } from "react-router-dom";
import logo from "../assets/Owl-Face.png";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase_config";

const QuestionsPage = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [course, setCourse] = useState("");
  const [semester, setSemester] = useState("");
  const [questions, setQuestions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [filtersApplied, setFiltersApplied] = useState(false);


  // 1) Auth state listener – top-level hook
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // 2) Firestore subscription – reacts when course/semester change AND filtersApplied is true
  useEffect(() => {
    if (!filtersApplied || !course || !semester) return;

    const q = query(
      collection(db, "questions"),
      where("course", "==", course),
      where("semester", "==", semester),
      orderBy("timestamp", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setQuestions(data);
    });

    return () => unsubscribe();
  }, [course, semester, filtersApplied]);

  // 3) Handler for the filter form
  const handleFilterSubmit = (e) => {
    e.preventDefault();
    if (!course || !semester) return;
    setFiltersApplied(true);
  };

  // 4) Derived filtered list (search)
  const filteredQuestions = useMemo(
    () =>
      questions.filter((q) =>
        q.title?.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [questions, searchTerm]
  );

  const handleLogout = async () => {
    await auth.signOut();
    navigate("/"); // or wherever your login/main page is
  };

  // Load questions after filter submit
  const loadQuestions = () => {
    const q = query(
      collection(db, "questions"),
      where("course", "==", course),
      where("semester", "==", semester),
      orderBy("timestamp", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setQuestions(data);
    });

    setFiltersApplied(true);
    return unsubscribe;
  };

  return (
    <div className="qna-container">
      <header className="qna-header">
        <div className="qna-header-left">
          <a
            href="https://project-study-hub.netlify.app/"
            target="_blank"
            className="home-icon"
            title="Back to Home"
          >
            <img src={logo} className="logo" alt="Study Hub Logo" />
          </a>
        </div>

        <div className="qna-header-title">StudyHub Q&A</div>

        <div className="qna-header-right">
          {user ? (
            <>
              <div className="profile-avatar" title={user.email}>
                {user.email.charAt(0).toUpperCase()}
              </div>
            </>
          ) : (
            <a
              href="https://project-study-hub.netlify.app/signin"
              className="login-btn"
            >
              Login
            </a>
          )}
        </div>
      </header>

      <main className="qna-content">
        {!filtersApplied ? (
          <form className="filter-form" onSubmit={handleFilterSubmit}>
            <h3>Find Questions By</h3>
            <select
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              required
            >
              <option value="">Select Course</option>
              <option value="BCA">BCA</option>
              <option value="BBA">BBA</option>
              <option value="MCA">MCA</option>
            </select>
            <select
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              required
            >
              <option value="">Select Semester</option>
              <option value="1st">1st</option>
              <option value="2nd">2nd</option>
              <option value="3rd">3rd</option>
              <option value="4th">4th</option>
              <option value="5th">5th</option>
              <option value="6th">6th</option>
            </select>
            <button type="submit">Load Questions</button>
          </form>
        ) : (
          <>
            <input
              type="text"
              className="qna-search"
              placeholder="Search questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <div className="qna-list">
              {filteredQuestions.length > 0 ? (
                filteredQuestions.map((q) => (
                  <div
                    key={q.id}
                    className="qna-card"
                    onClick={() => navigate(`/question/${q.id}`)}
                  >
                    <h3>{q.title}</h3>
                    {q.description && (
                      <p className="qna-desc">{q.description}</p>
                    )}
                    <p className="qna-meta">
                      📘 {q.subject} | Asked by: {q.askedBy?.name || "Unknown"}{" "}
                      | {q.timestamp?.toDate().toLocaleString()}
                    </p>
                  </div>
                ))
              ) : (
                <p className="no-results">No questions found.</p>
              )}
            </div>
          </>
        )}
      </main>

      {filtersApplied && (
        <button className="qna-fab" onClick={() => setShowModal(true)}>
          Ask
        </button>
      )}
      {showModal && <AskQuestionForm onClose={() => setShowModal(false)} />}
    </div>
  );
};

export default QuestionsPage;
