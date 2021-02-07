import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';

import model from '../models/ExamsModel'

import manager from '../../GlobalSocket'

//import { Bounce } from 'react-reveal';

export default function Learn() {

    const socket = new manager().socket
    
    const [exams, setExams] = useState([])

    useEffect(() => {

        socket.emit('exams-get-signal')

        return () => {
            socket.disconnect()
        }
        // eslint-disable-next-line
    },[])

    useEffect(() => {
        socket.on('exams-get-emitter', (dbExams) => {
            setExams(model(dbExams))
        })
    })

    return (
        <div className="container text-center p-3 mb-3">
            <h1><p>Elérhető tananyagok:</p></h1>
            <div className="container">
                <div className="row">
                {exams.length !== 0 ? exams.map((exam,index)=>{
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
                }) : <h2>Itt fognak megjelenni az elérhető tanagyagok.</h2>}
                </div>
            </div>
        </div>
    )
    
}
