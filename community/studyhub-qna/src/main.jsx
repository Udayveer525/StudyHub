import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import QuestionsPage from "./components/QuestionsPage";
import QuestionThread from "./components/QuestionThread"; 

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Router basename="/community/qna">
      <Routes>
        <Route path="/" element={<QuestionsPage />} />
        <Route path="/question/:id" element={<QuestionThread />} />
      </Routes>
    </Router>
  </React.StrictMode>
);