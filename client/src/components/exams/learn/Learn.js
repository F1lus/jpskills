import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';

import {io} from 'socket.io-client'

//import { Bounce } from 'react-reveal';

export default function Learn(props) {
    
    const [exams, setExams] = useState([])

    useEffect(() => {
        const socket = io('http://localhost:5000', {withCredentials:true})
        
        socket.emit('exams-get-signal')

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

        return () => socket.disconnect()
    })

    return (
        <div className="container text-center p-3 mb-3">
            <h1><p>Elérhető tananyagok:</p></h1>
            <div className="container">
                <div className="row">
                {exams.map((exam,index)=>{
                    return(
                        <div className="card shadow bg-light m-2 text-center" key={index}>
                            <div className="card-body text-center">
                                <h4 className="card-title"><p>{exam[0]}</p></h4>
                                <p className="card-text">{exam[2] !== '' ? `Megjegyzés: ${exam[2]}` : null}</p>
                                <p className="card-text">Készült: {exam[4]}</p>
                                <NavLink to={`/exams/learn/${exam[1]}`}>
                                    <button type="button" className="btn btn-outline-blue card-link">
                                        Megtanulom!
                                    </button>
                                </NavLink>
                            </div>
                        </div>
                    )
                })}
                </div>
            </div>
        </div>
    )
    
}
