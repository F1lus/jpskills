import React, {useState, useEffect} from 'react'

import model from './models/ExamsModel'

import ExamsTable from './ExamsTable'
import { Admin, User } from '../user_management/handlers/PermissionHandler'

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
            <Admin permission={props.permission}>
                <h1><p>Az Ön által készített vizsgák:</p></h1>
                <ExamsTable exams={exams} permission={props.permission}/>
            </Admin>
            <User permission={props.permission}>
                <h1><p>Elérhető vizsgák:</p></h1>
                <ExamsTable exams={exams} permission={props.permission}/>
            </User>
        </div>
    )
}