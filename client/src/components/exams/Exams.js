import React, {useState, useEffect} from 'react'
import {NavLink} from 'react-router-dom'

import model from './models/ExamsModel'

import ExamsTable from './ExamsTable'

export default function Exams(props){

    const socket = props.socket

    const [exams, setExams] = useState([])

    useEffect(() => {

        socket.on('exam-processed', () => {
            socket.emit('exams-get-signal')
        })

        socket.on('exams-get-emitter', (dbExams) => {
            setExams(model(dbExams))
        })
        // eslint-disable-next-line
    }, [])

    return(
        <div className="container shadow rounded text-center p-3 mt-3 mb-3 bg-light">
            {props.permission === 'admin'? <h1><p>Az Ön által készített vizsgák:</p></h1>
            : <h1><p>Elérhető vizsgák:</p></h1>
            }
            {/*<ExamsTable exams={exams}/>*/}
            <div className="container">
                <div className="row">
                    {exams.length === 0 ? 
                        <div className="container text-center"><h2 className='text-center'>Itt fognak megjelenni az elérhető vizsgák</h2></div>  
                    : exams.map((exam, index)=>{                
                        return(
                            <div key={index} className="card m-2 bg-light text-center shadow" style={{borderColor: exam.status === 'Aktív' ? "green" : "red"}}>
                                <div className="card-body">
                                    <NavLink to={props.permission === 'admin' ? `/exams/modify/${exam.itemcode}` : `/exams/${exam.itemcode}`}>
                                        <button disabled={props.permission !== 'admin' ? exam.status === 'Inaktív' : false} className="btn btn-outline-blue m-2">
                                            {exam.name}
                                        </button>
                                    </NavLink>
                                    <p className="card-text">Készült: {exam.date}</p>
                                    <p className="card-text">Cikkszám: {exam.itemcode}</p>
                                </div>
                            </div>
                        )
                    })}
                </div>
                </div>
        </div>
    )
}