// src/components/AcademicSelector.jsx
import { useEffect, useState } from "react";
import { ChevronDown, Building2, GraduationCap, CalendarDays, BookOpen } from "lucide-react";
import { API_BASE_URL } from "../config/api";

export default function AcademicSelector({ onChange }) {
  // Internal State (Self-contained)
  const [institutions, setInstitutions] = useState([]);
  const [degrees, setDegrees] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [institutionId, setInstitutionId] = useState("");
  const [degreeId, setDegreeId] = useState("");
  const [semesterId, setSemesterId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  
  const [loading, setLoading] = useState(true);

  // 1. Load Initial Data (Institutions & Degrees)
  useEffect(() => {
    (async () => {
      try {
        const [instRes, degRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/institutions`),
          fetch(`${API_BASE_URL}/api/degrees`)
        ]);

        if (instRes.ok) setInstitutions(await instRes.json());
        else setInstitutions([{ id: 1, name: "Punjab University" }]); // Fallback
        
        if (degRes.ok) setDegrees(await degRes.json());
      } catch (err) {
        // Fallback for demo/offline
        setInstitutions([{ id: 1, name: "Punjab University" }]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // 2. Cascading Logic: Load Semesters when Degree Changes
  useEffect(() => {
    // Reset downstream
    setSemesterId("");
    setSubjectId("");
    setSubjects([]);
    setSemesters([]);

    if (!degreeId) return;

    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/semesters?degreeId=${degreeId}`);
        if (res.ok) setSemesters(await res.json());
      } catch (e) { console.error(e); }
    })();
  }, [degreeId]);

  // 3. Cascading Logic: Load Subjects when Semester Changes
  useEffect(() => {
    // Reset downstream
    setSubjectId("");
    setSubjects([]);

    if (!semesterId) return;

    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/subjects?semesterId=${semesterId}`);
        if (res.ok) setSubjects(await res.json());
      } catch (e) { console.error(e); }
    })();
  }, [semesterId]);

  // 4. Notify Parent ONLY when everything is selected (or update partials if needed)
  useEffect(() => {
    // We only trigger the parent onChange if we have a valid chain, 
    // or you can adjust this to trigger on every step if you want the parent to know partial state.
    // Based on your previous code, it triggered on subjectId.
    if (onChange) {
      onChange({
        institutionId,
        degreeId,
        semesterId,
        subjectId,
      });
    }
  }, [institutionId, degreeId, semesterId, subjectId, onChange]);

  // Helper UI Component for consistent styling
  const SelectField = ({ icon: Icon, label, value, options, onChange, disabled, placeholder }) => (
    <div className={`relative transition-all duration-300 ${disabled ? "opacity-50 grayscale" : "opacity-100"}`}>
      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-gray-400">
        {label}
      </label>
      <div className="relative group">
        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-accent transition-colors">
          <Icon className="h-4 w-4" />
        </div>
        <select
          className={`w-full appearance-none rounded-xl border bg-white py-3 pl-10 pr-8 text-sm font-medium text-brand-deep outline-none transition-all
            ${disabled 
              ? "cursor-not-allowed border-gray-100 bg-gray-50 text-gray-400" 
              : "cursor-pointer border-gray-200 hover:border-brand-mid/30 focus:border-brand-accent focus:ring-4 focus:ring-brand-accent/10"
            }
          `}
          value={value}
          onChange={onChange}
          disabled={disabled}
        >
          <option value="">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.code ? `${opt.code} - ${opt.name}` : (opt.number ? `Semester ${opt.number}` : opt.name)}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
          <ChevronDown className="h-4 w-4" />
        </div>
      </div>
    </div>
  );

  if (loading) return (
     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {[1,2,3,4].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl"></div>)}
     </div>
  );

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <SelectField
        icon={Building2}
        label="University"
        value={institutionId}
        options={institutions}
        placeholder="Select Campus"
        onChange={(e) => setInstitutionId(e.target.value)}
      />

      <SelectField
        icon={GraduationCap}
        label="Degree"
        value={degreeId}
        options={degrees}
        disabled={!institutionId}
        placeholder="Select Degree"
        onChange={(e) => setDegreeId(e.target.value)}
      />

      <SelectField
        icon={CalendarDays}
        label="Semester"
        value={semesterId}
        options={semesters}
        disabled={!degreeId}
        placeholder="Select Sem"
        onChange={(e) => setSemesterId(e.target.value)}
      />

      <SelectField
        icon={BookOpen}
        label="Subject"
        value={subjectId}
        options={subjects}
        disabled={!semesterId}
        placeholder="Select Subject"
        onChange={(e) => setSubjectId(e.target.value)}
      />
    </div>
  );
}