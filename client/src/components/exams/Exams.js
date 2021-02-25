import React, {useState, useEffect} from 'react'

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
            <ExamsTable exams={exams} permission={props.permission}/>
        </div>
    )
}