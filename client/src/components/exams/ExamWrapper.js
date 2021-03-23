import React, { useContext, useEffect } from 'react'
import { useSelector, useStore } from 'react-redux'

import { SocketContext } from '../GlobalSocket'
import { setLoad } from '../store/ActionHandler'
 
import Exams from './Exams'
import CreateTest from './create/CreateTest'
import { Admin } from '../user_management/handlers/PermissionHandler'

export default function ExamWrapper() {

    const socket = useContext(SocketContext)
    const store = useStore()

    const permission = useSelector(state => state.userReducer.permission)

    useEffect(() => {
        setLoad(store, true)

        if (permission === 'admin') {
            socket
                .emit('get-types')
                .emit('get-groups')
        }
        socket.emit('exams-get-signal')

    }, [socket, permission, store])

    return (
        <div className="page">
            <Admin permission={permission}>
                <CreateTest socket={socket} store={store} permission={permission} />
            </Admin>
            <Exams socket={socket} store={store} permission={permission} />
        </div>
    )
}