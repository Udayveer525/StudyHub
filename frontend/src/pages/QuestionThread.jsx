// src/pages/QuestionThread.jsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  ArrowLeft, 
  MessageCircle, 
  CheckCircle, 
  Clock, 
  MoreHorizontal,
  Share2
} from "lucide-react";
import { API_BASE_URL } from "../config/api";
import { useAuth } from "../context/AuthContext";
import AnswerCard from "../components/AnswerCard";
import AnswerForm from "../components/AnswerForm";

export default function QuestionThread() {
  const { id } = useParams();
  const { user } = useAuth();

  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Logic remains identical
  useEffect(() => {
    (async () => {
      try {
        const qRes = await fetch(`${API_BASE_URL}/api/questions/${id}`);
        const aRes = await fetch(`${API_BASE_URL}/api/questions/${id}/answers`);

        if (qRes.ok) setQuestion(await qRes.json());
        if (aRes.ok) setAnswers(await aRes.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  async function handleVote(answerId, value) {
    await fetch(`${API_BASE_URL}/api/answers/${answerId}/vote`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ value }),
    });
    refreshAnswers();
  }

  async function handleAccept(answerId) {
    await fetch(`${API_BASE_URL}/api/answers/${answerId}/accept`, {
      method: "POST",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    refreshAnswers();
    refreshQuestion();
  }

  async function handleAnswerSubmit(content) {
    await fetch(`${API_BASE_URL}/api/questions/${id}/answers`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content }),
    });
    refreshAnswers();
  }

  async function refreshAnswers() {
    const res = await fetch(`${API_BASE_URL}/api/questions/${id}/answers`);
    if (res.ok) setAnswers(await res.json());
  }

  async function refreshQuestion() {
    const res = await fetch(`${API_BASE_URL}/api/questions/${id}`);
    if (res.ok) setQuestion(await res.json());
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background-light">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-accent border-t-transparent"></div>
    </div>
  );

  if (!question) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background-light">
      <h2 className="text-xl font-bold text-brand-deep">Question not found</h2>
      <Link to="/questions" className="mt-4 text-brand-accent hover:underline">Return to list</Link>
    </div>
  );

  const isAuthor = user?.id === question.user_id;
  const canAnswer = user && question.status !== "resolved" && !isAuthor;

  return (
    <div className="min-h-screen bg-background-light py-8 font-sans text-brand-deep">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        
        {/* Back Navigation */}
        <Link 
          to="/questions" 
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-gray-500 transition-colors hover:text-brand-accent"
        >
          <ArrowLeft className="h-4 w-4" /> Back to questions
        </Link>

        {/* QUESTION HERO CARD */}
        <div className="relative overflow-hidden rounded-xl2 bg-white shadow-soft">
          {/* Status Bar */}
          <div className={`h-1.5 w-full ${question.status === "open" ? "bg-accent-orange" : "bg-emerald-500"}`}></div>
          
          <div className="p-6 md:p-8">
            <div className="flex items-start justify-between gap-4">
               <div>
                  <h1 className="text-2xl font-extrabold leading-tight text-brand-deep md:text-3xl">
                    {question.title}
                  </h1>
                  
                  {/* Metadata Row */}
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-500">
                    <span className="font-semibold text-brand-accent">
                      {question.subject_name}
                    </span>
                    <span className="h-1 w-1 rounded-full bg-gray-300"></span>
                    <span>{question.degree_name}</span>
                    <span className="h-1 w-1 rounded-full bg-gray-300"></span>
                    <span>Sem {question.semester_number}</span>
                    <span className="h-1 w-1 rounded-full bg-gray-300"></span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(question.created_at).toLocaleDateString()} {/* You might want to use question.created_at */}
                    </span>
                  </div>
               </div>

               {/* Status Badge */}
               <div className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide border ${
                  question.status === "open" 
                    ? "border-orange-100 bg-orange-50 text-accent-orange" 
                    : "border-emerald-100 bg-emerald-50 text-emerald-600"
               }`}>
                  {question.status === "open" ? (
                    <Clock className="h-3 w-3" />
                  ) : (
                    <CheckCircle className="h-3 w-3" />
                  )}
                  {question.status}
               </div>
            </div>

            {/* Description Body */}
            <div className="mt-8 prose prose-blue max-w-none border-t border-gray-100 pt-8 text-gray-700">
              <p className="whitespace-pre-wrap leading-relaxed">{question.description}</p>
            </div>

            {/* Action Footer */}
            <div className="mt-8 flex items-center justify-between border-t border-gray-100 pt-6">
               <div className="flex items-center gap-3">
                 <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-deep text-xs font-bold text-white">
                    {/* Initials Placeholder */}
                    {question?.author_name ? question.author_name.charAt(0) : "U"}
                 </div>
                 <div className="text-xs">
                    <p className="font-bold text-brand-deep">Asked by {question.author_name}</p>
                    <p className="text-gray-400">Computer Science Dept</p>
                 </div>
               </div>
               
               <button className="flex items-center gap-2 rounded-lg p-2 text-gray-400 hover:bg-gray-50 hover:text-brand-deep">
                 <Share2 className="h-4 w-4" />
                 <span className="text-xs font-semibold">Share</span>
               </button>
            </div>
          </div>
        </div>

        {/* ANSWERS SECTION */}
        <div className="mt-10">
          <div className="mb-6 flex items-center gap-3">
            <h2 className="text-xl font-bold text-brand-deep">
              Answers <span className="ml-2 rounded-lg bg-brand-deep/5 px-2 py-0.5 text-base text-brand-mid">{answers.length}</span>
            </h2>
          </div>

          <div className="space-y-6">
            {answers.length === 0 ? (
               <div className="flex flex-col items-center justify-center rounded-xl2 border border-dashed border-gray-300 bg-white/50 p-12 text-center">
                  <MessageCircle className="h-10 w-10 text-gray-300" />
                  <p className="mt-3 text-gray-500">No answers yet. Be the first to help!</p>
               </div>
            ) : (
              answers.map((a) => (
                // Wrapper to ensure spacing if AnswerCard is basic
                <div key={a.id} className="rounded-xl2">
                  <AnswerCard
                    answer={a}
                    canVote={!!user}
                    canAccept={isAuthor}
                    onVote={handleVote}
                    onAccept={handleAccept}
                  />
                </div>
              ))
            )}
          </div>

          {/* ANSWER FORM */}
          <div className="mt-10">
             <div className="rounded-xl2 bg-white p-1 shadow-soft">
                {/* Visual Header for Form */}
                <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-3">
                   <h3 className="text-sm font-bold text-brand-deep">Your Answer</h3>
                </div>
                <div className="p-6">
                   <AnswerForm disabled={!canAnswer} onSubmit={handleAnswerSubmit} />
                </div>
             </div>
             {!canAnswer && !user && (
                <p className="mt-4 text-center text-sm text-gray-500">
                  <Link to="/login" className="font-bold text-brand-accent hover:underline">Log in</Link> to contribute an answer.
                </p>
             )}
          </div>

        </div>
      </div>
    </div>
  );
}