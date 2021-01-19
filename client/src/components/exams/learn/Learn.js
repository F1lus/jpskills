import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';

import {io} from 'socket.io-client'

import { Bounce } from 'react-reveal';

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
            <div className="container" id="content">
                <div className="row">
                {exams.map((exam,index)=>{
                    return(
                        <Bounce left key={index}>
                        <div className="card m-2 shadow text-center">
                            <div className="card-body">
                                <p className="card-text">{exam[0]}</p>
                                <p className="card-text">Megjegyzés: {exam[2] !== 'null' ? exam[2] : ' - '}</p>
                                <p className="card-text">Készült: {exam[4]}</p>
                                <NavLink to={`/exams/learn/${exam[1]}`}>
                                    <button type="button" className="btn btn-outline-primary">
                                        Megtanulom!
                                    </button>
                                </NavLink>
                            </div>
                        </div>
                        </Bounce>
                    )
                })}
                </div>
            </div>
        </div>
    )
    
}
