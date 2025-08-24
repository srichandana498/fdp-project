import { useEffect, useState } from 'react'
import { db } from '../services/firebase'
import { collection, getDocs, query, where, addDoc } from "firebase/firestore"
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
export default function AttendancePage() {
    let [classId, setClassId] = useState(null)
    const [students, setStudents] = useState([])
    const [attendance, setAttendance] = useState({})
    const [date, setDate] = useState(new Date().toISOString().split("T")[0])
    const navigate = useNavigate()
    useEffect(() => {
        classId = localStorage.getItem("selectedClassId")
        setClassId(classId)
        const fetchClassData = async () => {
            try {
                const classRef = collection(db, "classes")
                const q = query(classRef, where("__name__", "==", classId))
                const classSnapshot = await getDocs(q)
                if (!classSnapshot.empty) {
                    const classData = classSnapshot.docs[0].data()
                    //console.log(classData)
                    setStudents(classData.students)
                }
            }
            catch (err) {
                console.log("error while fetching the classes in attendance page", err)
            }
        }
        fetchClassData()
    }, [])
    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            await addDoc(collection(db, "attendance"), {
                classId,
                date,
                records: students.map((student) => ({
                    studentId: student.id,
                    present: attendance[student.id] ?? false
                }))
            })
            Swal.fire({
                title: "Attendance",
                text: "Marking attendance successful!",
                icon: "success"
            });
            localStorage.removeItem("selectedClassId")
            navigate("/")
        }
        catch (err) {
            console.log("error while submiting attendance", err)
        }
    }
    const handleToggle = (studentId) => {
        setAttendance((prev) => ({
            ...prev,
            [studentId]: !prev[studentId]
        }))
    }
    return (
        <div className='container mt-3'>
            <h2>Mark Attedance </h2>
            <div className="row">
                <form onSubmit={handleSubmit} className='col-12 col-md-6'>
                    <div className='mb-2 col-12 col-md-6'>
                        <label className='form-label'>Date</label>
                        <input
                            type="date"
                            className='form-control'
                            value={date}
                            onChange={(e) => setDate(e.target.value)} />
                    </div>
                    <h4>Students</h4>
                    {
                        students.map((student) => (
                            <div className='form-check' key={student.id}>
                                <input
                                    type="checkbox"
                                    className='form-check-input'
                                    id={`student-${student.id}`}
                                    checked={attendance[student.id] ?? false}
                                    onChange={() => handleToggle(student.id)} />
                                <label htmlFor={`student-${student.id}`} className='form-check-label'>
                                    {student.id} Name:-{student.name}
                                </label>
                            </div>
                        ))
                    }
                    <button className='btn btn-primary mt-3'>Save attendance</button>
                </form>
            </div>
        </div>
    )
}
