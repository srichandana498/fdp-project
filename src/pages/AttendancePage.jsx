// inside your AttendancePage component
async function handleSave() {
  // --- normalize date to YYYY-MM-DD (use your toYmd if you have one) ---
  const ymd =
    typeof dateVal === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateVal)
      ? dateVal
      : (() => {
          const d = new Date(dateVal);
          if (Number.isNaN(d.getTime())) return null;
          const y = d.getFullYear();
          const m = String(d.getMonth() + 1).padStart(2, "0");
          const day = String(d.getDate()).padStart(2, "0");
          return `${y}-${m}-${day}`;
        })();

  if (!ymd) {
    await Swal.fire("Invalid date", "Pick a valid date.", "info");
    return;
  }
  if (!classId) {
    await Swal.fire("No class selected", "Please reselect your class.", "info");
    return;
  }

  // --- build present list + payload ---
  const present = (students || [])
    .filter((s) => !!presentMap[String(s.id)])
    .map((s) => ({
      id: String(s.id ?? ""),
      name: s.name ?? "",
      email: s.email ?? "",
    }));

  const payload = {
    date: ymd,
    classId,
    presentIds: present.map((p) => p.id).filter(Boolean), // viewer relies on this
    present,                                              // richer objects (optional)
    presentCount: present.length,
    createdAt: serverTimestamp(),
  };

  // helpful debug in browser console (live + local)
  console.log("Attendance save →", { classId, ymd, payload });

  setSaving(true);
  try {
    // (Optional but super useful) tiny health write to confirm rules/env
    await setDoc(doc(db, "__health", "ping"), { t: serverTimestamp() }, { merge: true });

    // actual attendance write: classes/{classId}/attendance/{YYYY-MM-DD}
    const attRef = doc(db, "classes", classId, "attendance", ymd);
    await setDoc(attRef, payload, { merge: true });

    setSaving(false);
    await Swal.fire("Saved!", "Attendance saved successfully.", "success");
  } catch (e) {
    setSaving(false);
    console.error("Save attendance failed:", e);
    await Swal.fire(
      "Error saving attendance",
      `${e.code ?? "error"} — ${e.message ?? "Unknown error"}`,
      "error"
    );
  }
}
