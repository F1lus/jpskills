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
        setNameHandler(store, username)
        setPermHandler(store, permission)
    }, [store])

    useEffect(() => {
        socket.emit('request-login-info')
        socket.on('login-info', handleLoginInfo)

        return () => socket.off('login-info', handleLoginInfo)
    }, [handleLoginInfo, socket])

    return (
        <Route {...rest} render={(props) => {
            if (path === '/') {
                return status ? <Redirect to='/home' /> : <Component {...props} />
            } else if (path === '/logout') {
                if (status) {
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
                } else {
                    return <Redirect to='/' />
                }
            } else {
                if (status && allowed.findIndex(perm => perm === '*' || perm === permission) !== -1) {
                    return <Component {...props} user={user} permission={permission} />
                } else {
                    return <Redirect to='/' />
                }
            }
        }}/>
    )
}