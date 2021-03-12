import React, { useCallback, useContext, useEffect } from 'react'

import { useStore, useSelector } from 'react-redux'
import { Redirect, Route, useLocation } from 'react-router'

import { SocketContext } from '../../GlobalSocket'
import { setNameHandler, setPermHandler, setStatusHandler } from '../../store/ActionHandler'
import API from '../../BackendAPI'

export default function Routing({ component: Component, allowed, ...rest }) {

    const [user, permission, status] = useSelector(state => {
        return [state.userReducer.user, state.userReducer.permission, state.userReducer.loggedIn]
    })

    const store = useStore()
    const path = useLocation().pathname
    const socket = useContext(SocketContext)

    const handleLoginInfo = useCallback((username, permission) => {
        setStatusHandler(store, username != null && permission != null)
        if (status) {
            setNameHandler(store, username)
            setPermHandler(store, permission)
        }
    }, [store, status])

    useEffect(() => {
        window.scrollTo(0, 0)

        socket.emit('request-login-info')
        socket.on('login-info', handleLoginInfo)

        return () => socket.off('login-info', handleLoginInfo)
    }, [handleLoginInfo, socket])

    return (
        <Route {...rest} render={(props) => {
            if (!status && path === '/') {
                return <Component  {...props} />
            } else if (status && path === '/') {
                return <Redirect to='/home' />
            } else if (status && path === '/logout') {
                return (
                    <div>
                        <Component />
                        {
                            API.post('/logout', { cmd: 'jp-logout' })
                                .then(response => {
                                    if (response.data.success) {
                                        window.location.reload()
                                    }
                                }).catch(err => console.log(err))
                        }
                    </div>
                )
            } else if (status) {
                if (permission !== 'superuser') {
                    if (allowed.findIndex(perm => perm === '*' || perm === permission) !== -1) {
                        return <Component {...props} user={user} permission={permission} />
                    } else {
                        return <Redirect to='/home' />
                    }
                }else{
                    if(path !== '/management'){
                        return <Redirect to='/management' />
                    }else{
                        return <Component {...props} user={user} permission={permission} />
                    }
                }
            } else {
                return <Redirect to='/' />
            }
        }} />
    )
}