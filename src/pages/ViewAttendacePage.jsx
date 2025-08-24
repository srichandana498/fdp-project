import { useEffect, useState } from 'react'
import { db } from '../services/firebase'
import { collection, getDocs, query, where } from 'firebase/firestore'

export default function ViewAttendacePage() {
  const [classes, setClasses] = useState([])
  const [students, setStudents] = useState([])
  const [selectedClassId, setSelectedClassId] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [attendanceData, setAttendanceData] = useState([])

  useEffect(() => {
    const fetchClasses = async () => {
      const snapshot = await getDocs(collection(db, "classes"))
      const classList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setClasses(classList)
    }
    fetchClasses()
  }, [])

  const fetchAttendance = async () => {
    if (!selectedClassId || !selectedDate) return;
    //getting classes
    const classSnap = await getDocs(
      query(collection(db, 'classes'), where('__name__', '==', selectedClassId))
    )
    const classData = classSnap.docs[0]?.data()
    const studentList = classData?.students || []
    setStudents(studentList)
    //getting attendance 
    const attendanceSnap = await getDocs(
      query(collection(db, "attendance"),
        where('classId', '==', selectedClassId)),
      where('date', '==', selectedDate)
    )
    //getting individual records
    const attendanceRecords = attendanceSnap.empty ? [] :
      attendanceSnap.docs[0]?.data()?.records || []
    setAttendanceData(attendanceRecords)
  }
  const getAttendanceStatus=(studentId)=>{
    const record=attendanceData.find((rec)=>rec.studentId===studentId)
    if(!record) return 'Absent'
    return record.present? "Present": "Absent"
  }

  return (
    <div className="container mt-3">
      <h2 className='mb-2'>View Attendance</h2>
      <div className="row">
        <div className='col-md-4 mt-3'>
          <label className='form-label'>Select Class:</label>
          <select
            className='form-select'
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}>
            <option value="">Select Class</option>
            {
              classes.map(cls => (
                <option key={cls.id} value={cls.id}>{cls.name}</option>
              ))
            }
          </select>
        </div>

        <div className="col-md-4 mt-3">
          <label className='form-label'>Select Date</label>
          <input
            type="date"
            className='form-control'
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)} />
        </div>

        <div className='col-md-4 mt-3 d-flex align-items-end'>
          <button onClick={fetchAttendance} className='btn btn-success w-25'>Submit</button>
        </div>
      </div>
      {
        selectedClassId &&selectedDate && students.length === 0 &&attendanceData.length===0 &&(
          <div className='col-12 mt-3'>
            No attendance found for the selected date
          </div>
        )
      }
      {
        students.length>0 && attendanceData.length>0 &&(
          <div className='table-responsive mt-3'>
            <table className='table table-bordered'>
              <thead className='table-dark'>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {
                  students.map((student,index)=>{
                    const status=getAttendanceStatus(student.id)
                    return(
                      <tr key={student.id || index}>
                        <td>{index+1}</td>
                        <td>{student.name}</td>
                        <td>{student.email}</td>
                        <td className={status==="Present"?"text-success":"text-danger"}>
                          {status}
                        </td>
                      </tr>
                    )
                  })
                }
              </tbody>
            </table>
          </div>
        )
      }
    </div>
  )
}
