import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  increment,
} from "firebase/firestore";
import "./QuestionThread.css";
import { db, auth, serverTimestampFn } from "../firebase_config";
import { FaThumbsUp, FaThumbsDown } from "react-icons/fa";

const QuestionThread = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [newAnswer, setNewAnswer] = useState("");
  const user = auth.currentUser;
  const inputRef = useRef(null);

  // Load question details
  useEffect(() => {
    const fetchQuestion = async () => {
      const docRef = doc(db, "questions", id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        setQuestion({ id: snap.id, ...snap.data() });
      } else {
        console.error("Question not found");
        navigate("/"); // Redirect back if invalid
      }
    };

    fetchQuestion();
  }, [id, navigate]);

  // Load answers live
  useEffect(() => {
    const q = query(
      collection(db, "questions", id, "answers"),
      orderBy("votes", "desc"),
      orderBy("timestamp", "desc") // secondary sort: newer first if same votes
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAnswers(data);
    });

    return () => unsubscribe();
  }, [id]);

  // Handle answer submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !newAnswer.trim()) return;

    try {
      await addDoc(collection(db, "questions", id, "answers"), {
        text: newAnswer.trim(),
        author: {
          uid: user.uid,
          name: user.email.split("@")[0],
        },
        votes: 0,
        timestamp: serverTimestampFn(),
      });
      setNewAnswer("");
      inputRef.current?.blur();
    } catch (err) {
      console.error("Error submitting answer:", err);
    }
  };

  // Handle voting
  const handleVote = async (answerId, delta) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const answerRef = doc(db, "questions", id, "answers", answerId);
    const answerSnap = await getDoc(answerRef);
    const answerData = answerSnap.data();

    const previousVote = answerData?.votedBy?.[userId] || 0;

    let updatedVotes = answerData.votes || 0;
    let updatedVotedBy = { ...(answerData.votedBy || {}) };

    // Toggle logic
    if (previousVote === delta) {
      // Remove vote
      updatedVotes -= delta;
      delete updatedVotedBy[userId];
    } else {
      // Switch vote or apply new one
      updatedVotes = updatedVotes - previousVote + delta;
      updatedVotedBy[userId] = delta;
    }

    await updateDoc(answerRef, {
      votes: updatedVotes,
      votedBy: updatedVotedBy,
    });
  };

  return (
    <div className="thread-container">
      {question && (
        <div className="question-box">
          <h2>{question.title}</h2>
          {question.description && (
            <p className="question-desc">{question.description}</p>
          )}
          <p className="question-meta">
            📘 {question.subject} | Asked by:{" "}
            {question.askedBy?.name || "Unknown"} |{" "}
            {question.timestamp?.toDate().toLocaleString()}
          </p>
        </div>
      )}

      <div className="answers-section">
        <h3>Answers</h3>
        {answers.length > 0 ? (
          answers.map((ans) => (
            <div key={ans.id} className="answer-card">
              <div className="answer-header">
                <div className="answer-avatar">
                  {ans.author.name?.[0]?.toUpperCase() || "?"}
                </div>
                <div className="answer-author-name">{ans.author.name}</div>
              </div>
              <div className="answer-text">{ans.text}</div>
              <div className="answer-meta">
                {ans.timestamp?.toDate().toLocaleString()}
              </div>
              <div className="vote-footer">
                <span
                  className={`vote-count ${
                    ans.votes > 0
                      ? "positive"
                      : ans.votes < 0
                      ? "negative"
                      : "neutral"
                  }`}
                >
                  {ans.votes} votes
                </span>

                <div className="vote-buttons">
                  <button
                    className={`vote-button ${
                      user && ans.votedBy?.[user.uid] === 1 ? "voted-up" : ""
                    }`}
                    onClick={() => handleVote(ans.id, 1)}
                    title="Upvote"
                  >
                    <FaThumbsUp />
                  </button>

                  <button
                    className={`vote-button ${
                      user && ans.votedBy?.[user.uid] === -1 ? "voted-down" : ""
                    }`}
                    onClick={() => handleVote(ans.id, -1)}
                    title="Downvote"
                  >
                    <FaThumbsDown />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="no-answers">No answers yet. Be the first!</p>
        )}
      </div>

      {user && (
        <form
          onSubmit={handleSubmit}
          className="answer-form scroll-answer-form"
        >
          <textarea
            placeholder="Write your answer..."
            value={newAnswer}
            onChange={(e) => {
              setNewAnswer(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height =
                Math.min(e.target.scrollHeight, 240) + "px";
            }}
            style={{ overflowY: "hidden" }}
            rows={1}
            ref={inputRef}
            required
          />
          <button type="submit">Submit Answer</button>
        </form>
      )}
    </div>
  );
};

export default QuestionThread;
