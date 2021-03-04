import React, {useContext, useEffect} from 'react'

import {SocketContext} from '../GlobalSocket'

import Exams from './Exams'
import CreateTest from './create/CreateTest'
import { Admin } from '../user_management/handlers/PermissionHandler'

export default function ExamWrapper(props){

    const socket = useContext(SocketContext)

    useEffect(() => {
        if(props.permission === 'admin'){
            socket.emit('get-types')
        }
        
        socket.emit('exams-get-signal')
        
    },[socket, props.permission])

    return (
        <div className="page">
            <Admin permission={props.permission}>
                <CreateTest socket={socket} permission={props.permission}/>
            </Admin>
            <Exams socket={socket} permission={props.permission}/>
        </div>
    )
}