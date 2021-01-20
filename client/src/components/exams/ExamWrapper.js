import React, {useEffect} from 'react'

import manager from '../GlobalSocket'

import Exams from './Exams'
import CreateTest from './create/CreateTest'

export default function ExamWrapper(props){

    const socket = new manager().socket

    useEffect(() => {
        return () => socket.disconnect()
    })

    return (
        <div>
            {props.permission === 'admin' ? <CreateTest socket={socket} permission={props.permission}/> : null}
            <Exams socket={socket} permission={props.permission}/>
        </div>
    )
}