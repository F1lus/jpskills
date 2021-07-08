import React, { useState, useEffect, useContext, useCallback } from 'react'
import { NavLink } from 'react-router-dom'

import model from '../models/ExamsModel'

import { SocketContext } from '../../GlobalSocket'

import OverlayScrollbars from 'overlayscrollbars'
import 'overlayscrollbars/css/OverlayScrollbars.css'

export default function Learn() {

    const socket = useContext(SocketContext)

    const [exams, setExams] = useState([])

    const handleExams = useCallback(dbExams => {
        setExams(model(dbExams))
    }, [])

    useEffect(() => {
        socket.emit('exams-learn-signal')

        socket.on('exams-learn-emitter', handleExams)

        return () => socket.off('exams-learn-emitter', handleExams)
    }, [handleExams, socket])

    useEffect(() => {
        OverlayScrollbars(document.getElementById("learn"), { className: "os-theme-dark" });
    }, [])

    return (
        <div className="container text-center p-3 mb-3" id="learn">
            <h1><p>Elérhető tananyagok:</p></h1>
            <div className="container">
                <div className="row">
                    {exams.length !== 0 ? exams.map((exam, index) => {
                        return (
                            <div className="card shadow bg-light m-2 text-center" key={index}>
                                <div className="card-body text-center">
                                    <h4 className="card-title"><p>{exam.name}</p></h4>
                                    <p className="card-text">Készült: {exam.date}</p>
                                    <NavLink to={`/exams/learn/${exam.itemcode}`}>
                                        <button type="button" className="btn btn-outline-blue card-link">
                                            Megtekintés
                                        </button>
                                    </NavLink>
                                </div>
                            </div>
                        )
                    }) : <div className="container text-center"><h2>Itt fognak megjelenni az elérhető tananyagok.</h2></div>}
                </div>
            </div>
        </div>
    )
}
