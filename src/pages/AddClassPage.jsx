// src/pages/AddClassPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../services/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import Swal from "sweetalert2";
import { safeDoc } from "../lib/firestoreSafe";

export default function AddClassPage() {
  const [className, setClassName] = useState("");
  const [students, setStudents] = useState([{ id: "", name: "", email: "" }]);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const addRow = () =>
    setStudents((s) => [...s, { id: "", name: "", email: "" }]);

  const removeRow = (i) =>
    setStudents((s) => s.filter((_, idx) => idx !== i));

  const update = (i, field, value) =>
    setStudents((s) =>
      s.map((row, idx) => (idx === i ? { ...row, [field]: value } : row))
    );

  async function handleSubmit(e) {
    e.preventDefault();

    const name = (className ?? "").trim();

    // Clean & validate rows (no undefineds; trim strings)
    const cleanStudents = students
      .map((s) => ({
        id: (s.id ?? "").trim(),
        name: (s.name ?? "").trim(),
        email: (s.email ?? "").trim(),
      }))
      // keep rows that have at least one non-empty field
      .filter((s) => s.id || s.name || s.email)
      // turn empty strings into nulls later (safeDoc), but also validate email here
      .map((s) => s);

    if (!name) {
      return Swal.fire("Class name required", "Please enter a class name.", "info");
    }

    if (cleanStudents.length === 0) {
      return Swal.fire("Add at least one student", "Fill at least one row.", "info");
    }

    const badEmail = cleanStudents.find(
      (s) => s.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.email)
    );
    if (badEmail) {
      return Swal.fire("Invalid email", `Please fix: ${badEmail.email}`, "info");
    }

    // Final document – sanitize to remove undefined/NaN/empty strings
    const docData = safeDoc({
      name,
      students: cleanStudents, // safeDoc will clean nested values
      createdAt: serverTimestamp(),
    });

    setSaving(true);
    try {
      // Write (with an explicit timeout so UI never hangs forever)
      const write = addDoc(collection(db, "classes"), docData);
      const timeout = new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("Write timed out. Check network/Firestore rules.")),
          12000
        )
      );

      const docRef = await Promise.race([write, timeout]);

      // Optional: remember the new class for next pages
      localStorage.setItem("selectedClassId", docRef.id);

      setSaving(false);
      await Swal.fire("Saved!", "Class created successfully.", "success");
      navigate("/attendance");
    } catch (err) {
      console.error("Add class error:", err);
      setSaving(false);
      Swal.fire("Error", err?.message || err?.code || "Unknown error", "error");
    }
  }

  return (
    <div className="container mt-3">
      <h2>Add Class</h2>

      <form noValidate onSubmit={handleSubmit} className="col-12 col-lg-8">
        <div className="mb-3">
          <label className="form-label">Class name</label>
          <input
            className="form-control"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            placeholder="e.g., CSE-A 3rd Year"
          />
        </div>

        <h4>Students</h4>
        {students.map((s, i) => (
          <div className="row g-2 align-items-end mb-2" key={i}>
            <div className="col-md-3">
              <label className="form-label">Student ID</label>
              <input
                className="form-control"
                value={s.id}
                onChange={(e) => update(i, "id", e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Name</label>
              <input
                className="form-control"
                value={s.name}
                onChange={(e) => update(i, "name", e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Email</label>
              <input
                className="form-control"
                type="text" // keep text; we validate ourselves
                value={s.email}
                onChange={(e) => update(i, "email", e.target.value)}
                placeholder="name@example.com"
              />
            </div>
            <div className="col-md-1 d-grid">
              <button
                type="button"
                className="btn btn-outline-danger"
                onClick={() => removeRow(i)}
                disabled={students.length === 1}
                title="Remove row"
              >
                —
              </button>
            </div>
          </div>
        ))}

        <div className="d-flex gap-2 mt-2">
          <button type="button" className="btn btn-outline-secondary" onClick={addRow}>
            + Add row
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Saving…" : "Save Class"}
          </button>
        </div>
      </form>
    </div>
  );
}
