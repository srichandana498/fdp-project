// src/pages/ViewAttendancePage.jsx
import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { db } from "../services/firebase";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";

/** Normalize any input to YYYY-MM-DD for Firestore doc IDs */
function toYmd(date) {
  if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
  if (typeof date === "string" && /^\d{2}-\d{2}-\d{4}$/.test(date)) {
    const [dd, mm, yyyy] = date.split("-");
    return `${yyyy}-${mm}-${dd}`;
  }
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function ViewAttendancePage() {
  const [classes, setClasses] = useState([]); // [{id,name}]
  const [classId, setClassId] = useState("");
  const [dateVal, setDateVal] = useState(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`; // HTML date format
  });

  const [students, setStudents] = useState([]);     // [{id,name,email}]
  const [presentIds, setPresentIds] = useState([]); // ["150", ...]
  const [loading, setLoading] = useState(false);

  // Load classes for dropdown
  useEffect(() => {
    (async () => {
      try {
        const snap = await getDocs(collection(db, "classes"));
        const rows = snap.docs.map((d) => {
          const data = d.data() || {};
          return { id: d.id, name: data.name || d.id };
        });
        setClasses(rows);

        // Preselect last-used class if available
        const fromLS = localStorage.getItem("selectedClassId");
        if (fromLS && rows.some((r) => r.id === fromLS)) {
          setClassId(fromLS);
        } else if (rows[0]) {
          setClassId(rows[0].id);
        }
      } catch (e) {
        console.error("Load classes failed:", e);
        Swal.fire("Error", e?.message || "Failed to load classes.", "error");
      }
    })();
  }, []);

  // Auto-load when class/date change
  useEffect(() => {
    if (classId) {
      console.log("ViewAttendance → classId:", classId, "date:", dateVal);
      handleSubmit(); // no event; uses current state
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId, dateVal]);

  // Load students + attendance for selected class/date
  async function handleSubmit(e) {
    if (e) e.preventDefault();
    if (!classId) {
      return Swal.fire("Select class", "Please choose a class.", "info");
    }
    const ymd = toYmd(dateVal);
    if (!ymd) {
      return Swal.fire("Invalid date", "Please pick a valid date.", "info");
    }

    setLoading(true);
    try {
      // 1) Get class doc (embedded students)
      const classSnap = await getDoc(doc(db, "classes", classId));
      if (!classSnap.exists()) {
        setStudents([]);
        setPresentIds([]);
        setLoading(false);
        return Swal.fire("Class not found", "Selected class was not found.", "error");
      }
      const cls = classSnap.data() || {};
      const arr = Array.isArray(cls.students) ? cls.students : [];
      const norm = arr.map((s) => ({
        id: (s.id ?? "").toString(),
        name: s.name ?? "",
        email: s.email ?? "",
      }));
      setStudents(norm);

      // 2) Read attendance at YYYY-MM-DD; fallback to DD-MM-YYYY if needed
      const ref1 = doc(db, "classes", classId, "attendance", ymd);
      let attSnap = await getDoc(ref1);

      if (!attSnap.exists() && /^\d{4}-\d{2}-\d{2}$/.test(ymd)) {
        const [yyyy, mm, dd] = ymd.split("-");
        const ddmmyyyy = `${dd}-${mm}-${yyyy}`;
        const ref2 = doc(db, "classes", classId, "attendance", ddmmyyyy);
        attSnap = await getDoc(ref2);
        if (attSnap.exists()) {
          console.warn("Found attendance under legacy DD-MM-YYYY id:", ddmmyyyy);
        }
      }

      if (!attSnap.exists()) {
        console.log("No attendance doc for", ymd, "under class", classId);
        setPresentIds([]);
      } else {
        const att = attSnap.data() || {};
        const ids = Array.isArray(att.presentIds) ? att.presentIds.map(String) : [];
        console.log("Loaded attendance:", { ymd, presentIds: ids, raw: att });
        setPresentIds(ids);
      }
    } catch (e) {
      console.error("Load attendance failed:", e);
      Swal.fire("Error", e?.message || "Failed to load attendance.", "error");
    } finally {
      setLoading(false);
    }
  }

  // Build table rows; compare IDs as strings
  const rows = useMemo(() => {
    const presentSet = new Set((presentIds || []).map(String));
    return (students || []).map((s, idx) => {
      const sid = String(s.id ?? "");
      const present = sid && presentSet.has(sid);
      return {
        idx: idx + 1,
        name: s.name || "",
        id: sid || "",
        email: s.email || "",
        status: present ? "Present" : "Absent",
      };
    });
  }, [students, presentIds]);

  return (
    <div className="container mt-3">
      <h2>View Attendance</h2>

      <form className="row g-2 align-items-end mb-3" onSubmit={handleSubmit}>
        <div className="col-md-4">
          <label className="form-label">Select Class</label>
          <select
            className="form-select"
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-4">
          <label className="form-label">Select Date</label>
          <input
            type="date"
            className="form-control"
            value={dateVal}
            onChange={(e) => setDateVal(e.target.value)}
          />
        </div>

        <div className="col-md-2 d-grid">
          <button type="submit" className="btn btn-success">Submit</button>
        </div>
      </form>

      <div className="table-responsive">
        <table className="table table-striped table-bordered">
          <thead className="table-dark">
            <tr>
              <th style={{ width: 60 }}>#</th>
              <th>Name</th>
              <th>Student ID</th>
              <th>Email</th>
              <th style={{ width: 120 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.idx}>
                <td>{r.idx}</td>
                <td>{r.name}</td>
                <td>{r.id}</td>
                <td>{r.email}</td>
                <td style={{ color: r.status === "Present" ? "green" : "red", fontWeight: 600 }}>
                  {r.status}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center">No students found for this class.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {students.length > 0 && presentIds.length === 0 && !loading && (
        <p className="mt-2 text-muted">
          Students loaded, but no attendance records for this date.
        </p>
      )}
    </div>
  );
}
