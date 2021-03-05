import React, {useCallback, useContext, useEffect} from 'react'

import {useStore, useSelector} from 'react-redux'
import { Redirect, Route } from 'react-router'

import {SocketContext} from '../../GlobalSocket'
import {setNameHandler, setPermHandler, setStatusHandler} from '../../store/ActionHandler'

export default function Routing({component: Component, login, ...rest}){

    const user = useSelector(state => state.userReducer.user)
    const permission = useSelector(state => state.userReducer.permission)
    const status = useSelector(state => state.userReducer.loggedIn)

    const store = useStore()
    const socket = useContext(SocketContext)

    const handleLoginInfo = useCallback((username, permission) => {
        setStatusHandler(store, username && permission)
        setNameHandler(store, username)
        setPermHandler(store, permission)
    }, [store])

    useEffect(() => {
        socket.emit('request-login-info')
        socket.on('login-info', handleLoginInfo)

        return () => socket.off('login-info', handleLoginInfo)
    })

    return (
        <Route {...rest} render={(props) => {
            if(login){
                return status ? <Redirect to='/home' /> : <Component {...props} user={user} permission={permission}/>
            }else{
                return status ? <Component {...props} user={user} permission={permission}/> : <Redirect to='/' />
            }
        }}
        />
    )
}