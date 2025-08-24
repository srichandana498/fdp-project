import { BrowserRouter,Routes,Route } from "react-router-dom"
import Home from "./pages/Home"
import AttendancePage from "./pages/AttendancePage"
import AddClassPage from "./pages/AddClassPage"
import Navigation from "./pages/Navigation"
import ViewAttendacePage from "./pages/ViewAttendacePage"

export default function App() {
  return (
    <BrowserRouter>
    <Navigation/>
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/attendance" element={<AttendancePage/>}/>
        <Route path="/add-class" element={<AddClassPage/>}/>
        <Route path="/view-attendance" element={<ViewAttendacePage/>}/>
      </Routes>
    </BrowserRouter>
  )
}
