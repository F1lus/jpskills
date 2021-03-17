import React, { useContext, useEffect } from 'react'
import { useSelector } from 'react-redux'

import { SocketContext } from '../GlobalSocket'

import Exams from './Exams'
import CreateTest from './create/CreateTest'
import { Admin } from '../user_management/handlers/PermissionHandler'

export default function ExamWrapper() {

    const socket = useContext(SocketContext)
    const permission = useSelector(state => state.userReducer.permission)

    useEffect(() => {
        if (permission === 'admin') {
            socket.emit('get-types')
        }
        socket.emit('exams-get-signal')

    }, [socket, permission])

    return (
        <div className="page">
            <Admin permission={permission}>
                <CreateTest socket={socket} permission={permission} />
            </Admin>
            <Exams socket={socket} permission={permission} />
        </div>
    )
}