import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { db } from "../services/firebase";
import { collection, getDocs } from "firebase/firestore";

export default function Home() {
  const [classes, setClasses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const snap = await getDocs(collection(db, "classes"));
      setClasses(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    })();
  }, []);

  const select = (id) => {
    localStorage.setItem("selectedClassId", id);
    navigate("/attendance");
  };

  return (
    <div className="container mt-3">
      <h2>Home</h2>
      <p className="mb-3">
        Choose a class to mark attendance, or <Link to="/add-class">create one</Link>.
      </p>

      {classes.length === 0 ? (
        <p>No classes yet.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered">
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>Class</th>
                <th>Students</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {classes.map((c, i) => (
                <tr key={c.id}>
                  <td>{i + 1}</td>
                  <td>{c.name ?? c.id}</td>
                  <td>{Array.isArray(c.students) ? c.students.length : 0}</td>
                  <td>
                    <button className="btn btn-primary btn-sm" onClick={() => select(c.id)}>
                      Mark Attendance
                    </button>
                    <Link
                      className="btn btn-outline-secondary btn-sm ms-2"
                      to="/view-attendance"
                      onClick={() => localStorage.setItem("selectedClassId", c.id)}
                    >
                      View Attendance
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}