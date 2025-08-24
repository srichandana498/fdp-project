import { useState } from 'react'
import { useNavigate } from "react-router-dom"
import {db} from '../services/firebase'
import {collection,addDoc} from 'firebase/firestore'
import Swal from 'sweetalert2'

export default function AddClassPage() {
    const [className, setClassName] = useState("")
    const [students, setStudents] = useState([{ id: "", name: "", email: "" }])
    const navigate = useNavigate()
    
    function handleStudentChange(index, field, value){
        const updated=[...students]
        updated[index][field]=value
        setStudents(updated)
    }
    function addStudentField(){
        setStudents([...students,{id:"",name:"",email:""}])
    }
    async function handleSubmit(e){
        e.preventDefault()
        try{
            await addDoc(collection(db,"classes"),{
                name:className,
                students:students
            })
            Swal.fire({
                title: "Students & Class!",
                text: "Students added for this class!",
                icon: "success"
            });
            navigate("/")
        }
        catch(err){
            console.log("Error while adding the class",err)
        }
    }
    return (
        <div className='container mt-3'>
            <div className='row'>
                <h2 className='mb-3'>Add New Class</h2>
                <form action="" className='col-12 col-md-7' onSubmit={handleSubmit}>
                    <div className='mb-3'>
                        <label className="form-label">Class Name</label>
                        <input 
                            className="form-control" 
                            type="text" 
                            placeholder='Ex:Branch name'
                            required
                            value={className}
                            onChange={(e)=>setClassName(e.target.value)}/>
                    </div>
                    <h5>Students</h5>
                    {
                        students.map((student,index)=>(
                            <div className='row row-cols-2 row-cols-md-3 mb-3' key={index}>
                                <div className="col mb-3">
                                    <input 
                                        type="text" 
                                        className='form-control'
                                        placeholder='Student ID'
                                        value={student.id}
                                        onChange={(e)=>handleStudentChange(index, "id",e.target.value )} required
                                        />
                                </div>
                                <div className="col">
                                    <input 
                                        type="text" 
                                        className='form-control'
                                        placeholder='Student Name'
                                        value={student.name}
                                        onChange={(e)=>handleStudentChange(index, "name",e.target.value )} required
                                        />
                                </div>
                                <div className="col">
                                    <input 
                                        type="email" 
                                        className='form-control'
                                        placeholder='Student email'
                                        value={student.email}
                                        onChange={(e)=>handleStudentChange(index, "email",e.target.value )} required
                                        />
                                </div>
                            </div>
                        ))
                    }
                    <button 
                        className='btn btn-secondary mb-3' 
                        onClick={addStudentField}>
                            Add Another Student
                    </button>
                    <br />
                    <button className='btn btn-outline-success mb-5'>Save Class</button>
                </form>
            </div>
            
        </div>
    )
}

