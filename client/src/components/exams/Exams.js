import React, {useState, useEffect} from 'react'

import {NavLink} from 'react-router-dom'

export default function Exams(props){

    const socket = props.socket

    const [exams, setExams] = useState([])

    useEffect(() => {
        socket.emit('exams-get-signal')
        // eslint-disable-next-line
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
            <div className="container">
                <div className="row">
                    {exams.length === 0 ? <h1>Itt fognak megjelenni az elérhető vizsgák</h1> : exams.map((exam, index)=>{                
                        return(
                            <div key={index} className="card m-2 bg-light text-center shadow" style={{borderColor: exam[3] === 1 ? "green" : "red"}}>
                                <div className="card-body">
                                    <NavLink to={props.permission === 'admin' ? `/exams/modify/${exam[1]}` : `/exams/${exam[1]}`}>
                                        <button disabled={props.permission !== 'admin' ? exam[3] !== 1 : false} className="btn btn-outline-blue m-2">
                                            {exam[0]}
                                        </button>
                                    </NavLink>
                                    <div>
                                        {exam[2] !== '' ? `Megjegyzés: ${exam[2]}` : ''}
                                    </div>
                                    <p>Készült: {exam[4]}</p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}