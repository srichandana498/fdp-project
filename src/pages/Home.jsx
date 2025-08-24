import { useEffect, useState } from 'react'
import { db } from '../services/firebase'
import { collection, getDocs } from "firebase/firestore"
import { useNavigate } from 'react-router-dom'
export default function Home() {
    const [classes, setClasses] = useState([])
    const navigate = useNavigate()
    useEffect(()=>{
        const fetchClasses= async ()=>{
            try{
                const classSnapshot= await getDocs(collection(db,"classes"))
                //console.log(classSnapshot)
                const classList=classSnapshot.docs.map(doc=>({
                    id:doc.id,
                    ...doc.data()
                }))
                //console.log(classList)
                setClasses(classList)
            }
            catch(err){
                console.log("error from fetching the classes in Home.jsx",err)
            }
        }

        fetchClasses()
    },[])
    function handleClassClick(classId){
        //console.log("classid for marking attendance",classId)
        localStorage.setItem("selectedClassId",classId)
        navigate("/attendance")
    }
    return (
        <div className="container">
            <h2 className="mb-4">Class rooms</h2>
            <div className="row">
                {
                    classes.map(cls=>(
                        <div 
                            className='col-12 col-md-4 mb-3' 
                            key={cls.id} 
                            onClick={()=>handleClassClick(cls.id)} 
                            style={{cursor:"pointer"}}>
                                <div className='card shadow-sm h-100'>
                                    <div className="card-body">
                                        <h4 className='card-title'>{cls.name}</h4>
                                        <p className='card-text'>Total Students: {cls.students?.length|| 0}</p>
                                    </div>
                                </div>
                        </div>
                    ))
                }
            </div>
        </div>
    )
}
