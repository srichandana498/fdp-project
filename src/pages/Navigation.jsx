import { Link } from "react-router-dom"
import "./Navigation.css"
export default function Navigation() {
  return (
    <div className="navbar">
      <Link to="/">Home</Link>
      <Link to="/add-class">Add class Page</Link>
      <Link to="/view-attendance">View Attendance</Link>
    </div>
  )
}