// pages/admin/AdminSyllabus.jsx
// Admin page to upload syllabus PDFs for subjects
import React, { useEffect, useState } from "react";
import { Upload, CheckCircle, AlertCircle, Loader2, ChevronDown } from "lucide-react";
import { API_BASE_URL } from "../../config/api";

export default function AdminSyllabus() {
  const [degrees,     setDegrees]     = useState([]);
  const [semesters,   setSemesters]   = useState([]);
  const [subjects,    setSubjects]    = useState([]);
  const [degreeId,    setDegreeId]    = useState("");
  const [semesterId,  setSemesterId]  = useState("");
  const [subjectId,   setSubjectId]   = useState("");
  const [file,        setFile]        = useState(null);
  const [uploading,   setUploading]   = useState(false);
  const [result,      setResult]      = useState(null);
  const [error,       setError]       = useState(null);

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/degrees`, { headers }).then(r => r.json()).then(setDegrees).catch(() => {});
  }, []);

  useEffect(() => {
    setSemesterId(""); setSubjectId(""); setSemesters([]); setSubjects([]);
    if (!degreeId) return;
    fetch(`${API_BASE_URL}/api/semesters?degreeId=${degreeId}`, { headers }).then(r => r.json()).then(setSemesters).catch(() => {});
  }, [degreeId]);

  useEffect(() => {
    setSubjectId(""); setSubjects([]);
    if (!semesterId) return;
    fetch(`${API_BASE_URL}/api/subjects?semesterId=${semesterId}`, { headers }).then(r => r.json()).then(setSubjects).catch(() => {});
  }, [semesterId]);

  const handleUpload = async () => {
    if (!subjectId || !file) { setError("Select a subject and a PDF file"); return; }
    setUploading(true); setError(null); setResult(null);

    const formData = new FormData();
    formData.append("syllabus", file);
    formData.append("subjectId", subjectId);

    try {
      const res = await fetch(`${API_BASE_URL}/api/ollie/syllabus/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data);
      setFile(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const SelectField = ({ label, value, onChange, options, disabled, placeholder, renderOption }) => (
    <div>
      <label className="mb-1.5 block text-[10px] font-mono uppercase tracking-widest text-gray-500">{label}</label>
      <div className={`relative ${disabled ? "opacity-40" : ""}`}>
        <select value={value} onChange={e => onChange(e.target.value)} disabled={disabled}
          className="w-full appearance-none rounded-lg border border-white/10 bg-gray-800 px-3 py-2.5 pr-8 text-sm text-gray-200 outline-none focus:border-brand-accent/50 disabled:cursor-not-allowed">
          <option value="">{placeholder}</option>
          {options.map(opt => <option key={opt.id} value={opt.id}>{renderOption ? renderOption(opt) : opt.name}</option>)}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2 top-3 h-4 w-4 text-gray-500" />
      </div>
    </div>
  );

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Syllabus Upload</h1>
        <p className="mt-1 text-sm text-gray-500">Upload course syllabi to enable Ollie for students</p>
      </div>

      <div className="max-w-lg space-y-5 rounded-xl border border-white/8 bg-gray-900 p-6">
        <SelectField label="Degree" value={degreeId} onChange={setDegreeId} options={degrees} placeholder="Select Degree" />
        <SelectField label="Semester" value={semesterId} onChange={setSemesterId} options={semesters}
          disabled={!degreeId} placeholder="Select Semester" renderOption={s => `Semester ${s.number}`} />
        <SelectField label="Subject" value={subjectId} onChange={setSubjectId} options={subjects}
          disabled={!semesterId} placeholder="Select Subject" renderOption={s => `${s.code} — ${s.name}`} />

        <div>
          <label className="mb-1.5 block text-[10px] font-mono uppercase tracking-widest text-gray-500">Syllabus PDF</label>
          <div className="relative">
            <input type="file" accept=".pdf"
              onChange={e => setFile(e.target.files[0])}
              className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0" />
            <div className={`flex items-center justify-center gap-2 rounded-lg border-2 border-dashed py-8 text-sm font-medium transition-colors ${
              file ? "border-emerald-500/40 bg-emerald-500/5 text-emerald-400" : "border-white/10 bg-white/3 text-gray-500"
            }`}>
              <Upload className="h-5 w-5" />
              {file ? file.name : "Click to select PDF"}
            </div>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" /> {error}
          </div>
        )}

        {result && (
          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4">
            <div className="flex items-center gap-2 text-sm font-bold text-emerald-400 mb-2">
              <CheckCircle className="h-4 w-4" /> Parsed {result.topicCount} topics successfully!
            </div>
            <div className="max-h-40 overflow-y-auto space-y-1">
              {result.topics?.slice(0, 10).map((t, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-gray-400">
                  <span className="text-gray-600">U{t.unit}</span> {t.name}
                </div>
              ))}
              {result.topicCount > 10 && (
                <p className="text-xs text-gray-600">...and {result.topicCount - 10} more</p>
              )}
            </div>
          </div>
        )}

        <button onClick={handleUpload} disabled={uploading || !subjectId || !file}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 py-3 text-sm font-bold text-white hover:bg-emerald-500 disabled:opacity-50 transition-colors">
          {uploading ? <><Loader2 className="h-4 w-4 animate-spin" /> Processing...</> : <><Upload className="h-4 w-4" /> Upload & Parse</>}
        </button>
      </div>
    </div>
  );
}