import React, {useEffect} from 'react'

import manager from '../GlobalSocket'

import Exams from './Exams'
import CreateTest from './create/CreateTest'
import { Admin } from '../user_management/handlers/PermissionHandler'

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
            <Admin permission={props.permission}>
                <CreateTest socket={socket} permission={props.permission}/>
            </Admin>
            <Exams socket={socket} permission={props.permission}/>
        </div>
    )
}