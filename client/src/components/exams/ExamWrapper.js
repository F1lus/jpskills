import React, {useEffect} from 'react'

import manager from '../GlobalSocket'

import Exams from './Exams'
import CreateTest from './create/CreateTest'

export default function ExamWrapper(props){

    const socket = new manager().socket

    useEffect(() => {
        socket.open()

        if(props.permission === 'admin'){
            socket.emit('get-types')
        }
        
        socket.emit('exams-get-signal')

        return () => socket.disconnect()
        // eslint-disable-next-line
    },[])

    return (
        <div>
            {props.permission === 'admin' ? <CreateTest socket={socket} permission={props.permission}/> : null}
            <Exams socket={socket} permission={props.permission}/>
        </div>
    )
}