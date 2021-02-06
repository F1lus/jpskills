import React, {useState, useEffect} from 'react'
import {NavLink} from 'react-router-dom'

import model from './models/ExamsModel'

export default function Exams(props){

    const socket = props.socket

    const [exams, setExams] = useState([])

    useEffect(() => {
        socket.emit('exams-get-signal')
        // eslint-disable-next-line
    }, [])

    useEffect(() => {
        socket.on('exams-get-emitter', (dbExams) => {
            setExams(model(dbExams))
        })
    })

    return(
        <div className="container shadow rounded text-center p-3 mt-5 mb-3 bg-light">
            {props.permission === 'admin'? <h1><p>Az Ön által készített vizsgák:</p></h1>
            : <h1><p>Elérhető vizsgák:</p></h1>
            }
            <div className="container">
                <div className="row">
                    {exams.length === 0 ? 
                        <h1 className='text-center'>Itt fognak megjelenni az elérhető vizsgák</h1>  
                    : exams.map((exam, index)=>{                
                        return(
                            <div key={index} className="card m-2 bg-light text-center shadow" style={{borderColor: exam[3] === 1 ? "green" : "red"}}>
                                <div className="card-body">
                                    <NavLink to={props.permission === 'admin' ? `/exams/modify/${exam[1]}` : `/exams/${exam[1]}`}>
                                        <button disabled={props.permission !== 'admin' ? exam[3] !== 1 : false} className="btn btn-outline-blue m-2">
                                            {exam[0]}
                                        </button>
                                    </NavLink>
                                    <p className="card-text">{exam[2] !== '' ? `Megjegyzés: ${exam[2]}` : ''}</p>
                                    <p className="card-text">Készült: {exam[4]}</p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}