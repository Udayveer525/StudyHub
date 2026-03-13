// src/components/AcademicFilter.jsx
import { useEffect, useState } from "react";
import { ChevronDown, Building2, GraduationCap, CalendarDays, BookOpen } from "lucide-react";
import { API_BASE_URL } from "../config/api";

export default function AcademicFilter({ value, onChange }) {
  const { institutionId, degreeId, semesterId, subjectId } = value;

  const [institutions, setInstitutions] = useState([]);
  const [degrees, setDegrees] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  /* Load initial data */
  useEffect(() => {
    (async () => {
      try {
        const [instRes, degRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/institutions`),
          fetch(`${API_BASE_URL}/api/degrees`)
        ]);

        if (instRes.ok) setInstitutions(await instRes.json());
        else setInstitutions([{ id: 1, name: "Punjab University" }]);
        
        if (degRes.ok) setDegrees(await degRes.json());
      } catch {
        setInstitutions([{ id: 1, name: "Punjab University" }]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* Load semesters */
  useEffect(() => {
    if (!degreeId) {
      setSemesters([]);
      return;
    }
    (async () => {
      const res = await fetch(`${API_BASE_URL}/api/semesters?degreeId=${degreeId}`);
      if (res.ok) setSemesters(await res.json());
    })();
  }, [degreeId]);

  /* Load subjects */
  useEffect(() => {
    if (!semesterId) {
      setSubjects([]);
      return;
    }
    (async () => {
      const res = await fetch(`${API_BASE_URL}/api/subjects?semesterId=${semesterId}`);
      if (res.ok) setSubjects(await res.json());
    })();
  }, [semesterId]);

  // Helper for cleaner select styling
  const SelectGroup = ({ icon: Icon, label, value, options, onChange, disabled, placeholder }) => (
    <div className={`relative transition-opacity duration-200 ${disabled ? "opacity-50 grayscale" : "opacity-100"}`}>
      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-gray-400">
        {label}
      </label>
      <div className="relative">
        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <Icon className="h-4 w-4" />
        </div>
        <select
          className={`w-full appearance-none rounded-xl border bg-white py-2.5 pl-10 pr-8 text-sm font-medium text-brand-deep outline-none transition-all
            ${disabled 
              ? "cursor-not-allowed border-gray-100 bg-gray-50 text-gray-400" 
              : "cursor-pointer border-gray-200 hover:border-brand-mid/30 focus:border-brand-accent focus:ring-4 focus:ring-brand-accent/10"
            }
          `}
          value={value || ""}
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

  if (loading) return <div className="h-20 animate-pulse rounded-xl bg-gray-100"></div>;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <SelectGroup
        icon={Building2}
        label="University"
        value={institutionId}
        options={institutions}
        placeholder="Select Campus"
        onChange={(e) => onChange({
          institutionId: e.target.value,
          degreeId: "",
          semesterId: "",
          subjectId: "",
        })}
      />

      <SelectGroup
        icon={GraduationCap}
        label="Degree"
        value={degreeId}
        options={degrees}
        placeholder="Select Degree"
        onChange={(e) => onChange({
          institutionId,
          degreeId: e.target.value,
          semesterId: "",
          subjectId: "",
        })}
      />

      <SelectGroup
        icon={CalendarDays}
        label="Semester"
        value={semesterId}
        options={semesters}
        disabled={!degreeId}
        placeholder="Select Sem"
        onChange={(e) => onChange({
          institutionId,
          degreeId,
          semesterId: e.target.value,
          subjectId: "",
        })}
      />

      <SelectGroup
        icon={BookOpen}
        label="Subject"
        value={subjectId}
        options={subjects}
        disabled={!semesterId}
        placeholder="Select Subject"
        onChange={(e) => onChange({
          institutionId,
          degreeId,
          semesterId,
          subjectId: e.target.value,
        })}
      />
    </div>
  );
}