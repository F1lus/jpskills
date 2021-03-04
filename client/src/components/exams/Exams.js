import React, {useState, useEffect, useCallback} from 'react'

import model from './models/ExamsModel'

import ExamsTable from './ExamsTable'
import { Admin, User } from '../user_management/handlers/PermissionHandler'

export default function Exams(props){

    const socket = props.socket

    const [exams, setExams] = useState([])

    const handleExams = useCallback(dbExams => setExams(model(dbExams)), [])

    const handleProcessed = useCallback(() => socket.emit('exams-get-signal'), [socket])

    useEffect(() => {

        socket.on('exam-processed', handleProcessed)

        socket.on('exams-get-emitter', handleExams)

        return () => {
            socket.off('exam-processed', handleProcessed)

            socket.off('exams-get-emitter', handleExams)
        }
        
    }, [socket, handleExams, handleProcessed])

    return(
        <div>
            <Admin permission={props.permission}>
                <div className="container shadow rounded text-center p-3 mt-3 mb-3 bg-light">
                    <h1><p>Az Ön által készített vizsgák:</p></h1>
                    <ExamsTable exams={exams} permission={props.permission}/>
                </div>
            </Admin>

            <User permission={props.permission}>
                <div className="container shadow rounded text-center p-3 mt-3 mb-3 bg-light">
                    <h1><p>Elérhető vizsgák:</p></h1>
                    <ExamsTable exams={exams} permission={props.permission}/>
                </div>
            </User>
        </div>
    )
}