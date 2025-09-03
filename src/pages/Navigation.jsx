import { Link } from "react-router-dom";
import "./Navigation.css";

export default function Navigation() {
  return (
    <nav className="navbar">
      <ul className="nav-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/attendance">Attendance</Link></li>
        <li><Link to="/add-class">Add Class Page</Link></li>
        <li><Link to="/view-attendance">View Attendance</Link></li>
      </ul>
    </nav>
  );
}