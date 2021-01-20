import React, {useState, useEffect} from 'react'

import {NavLink} from 'react-router-dom'

export default function Exams(props){

    const socket = props.socket

    const [exams, setExams] = useState([])

    useEffect(() => {
        socket.emit('exams-get-signal')
    }, [])

    useEffect(() => {
        socket.on('exams-get-emitter', (dbExams) => {
            if(dbExams){
                let examList = []
                
                if(JSON.stringify(exams) !== JSON.stringify(dbExams)){
                    dbExams.forEach((exam) => {
                        examList.push([exam[0], exam[1], exam[2], exam[3], exam[4]])
                    })
                    setExams(examList)
                }
            }else{
                setExams([])
            }
        })
    })

    return(
        <div className="container shadow rounded text-center p-3 mt-5 mb-3 bg-light">
            <h1><p>Elérhető vizsgák:</p></h1>
            {exams.length === 0 ? <h1>Jelenleg nem találhatóak elérhető vizsgák</h1> : exams.map((exam, index)=>{                
                return(
                    <div key={index}>
                        <NavLink to={
                            props.permission === 'admin' ? 
                            `/exams/modify/${exam[1]}` : `/exams/${exam[1]}`
                        }>
                            <button className="btn btn-outline-primary m-2">
                                {exam[0]}
                            </button>
                        </NavLink>
                        <div>
                            Megjegyzés: {exam[2] !== 'null' ? exam[2] : ' - '}
                        </div>
                        <p>Készült: {exam[4]}</p>
                    </div>
                )
            })}
        </div>
    )
}