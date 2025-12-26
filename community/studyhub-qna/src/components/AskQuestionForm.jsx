import React, { useState } from "react";
import { db, auth, serverTimestampFn } from "../firebase_config";
import { collection, addDoc } from "firebase/firestore";
import "./AskQuestionForm.css";

const AskQuestionForm = ({ onClose }) => {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [course, setCourse] = useState("");
  const [semester, setSemester] = useState("");
  const [subject, setSubject] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user || !title || !course || !semester || !subject) return;

    try {
      await addDoc(collection(db, "questions"), {
        title: title.trim(),
        description: desc.trim(),
        course,
        semester,
        subject,
        timestamp: serverTimestampFn(),
        askedBy: {
          uid: user.uid,
          name: user.email.split("@")[0],
          email: user.email,
        },
      });
      onClose(); // Close modal on success
    } catch (err) {
      console.error("Error submitting question:", err);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Ask a Question</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Enter your question"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <textarea
            placeholder="Where exactly are you stuck? (Optional)"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          ></textarea>

          {/* Course Selector */}
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

          {/* Semester Selector */}
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

          <input
            type="text"
            placeholder="Subject (e.g. DBMS)"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
          />

          <div className="modal-actions">
            <button type="submit">Post</button>
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AskQuestionForm;
