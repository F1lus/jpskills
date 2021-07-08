import React, { useCallback, useContext, useEffect } from 'react'
import { useStore, useSelector } from 'react-redux'
import { Redirect, Route, useLocation } from 'react-router'

import OverlayScrollbars from 'overlayscrollbars'
import 'overlayscrollbars/css/OverlayScrollbars.css'

import { SocketContext } from '../../GlobalSocket'
import { setNameHandler, setPermHandler, setStatusHandler } from '../../store/ActionHandler'

export default function Routing({ component: Component, allowed, ...rest }) {

    const [user, permission, status] = useSelector(state => {
        return [state.userReducer.user, state.userReducer.permission, state.userReducer.loggedIn]
    })

    const noLoginPaths = ['/', '/resetRequest']

    const path = useLocation().pathname

    const socket = useContext(SocketContext)
    const store = useStore()

    const handleLoginInfo = useCallback((username, permission) => {
        setStatusHandler(store, username != null && permission != null)
        setNameHandler(store, username)
        setPermHandler(store, permission)
    }, [store])

    const handleLogout = useCallback(() => {
        window.location.reload()
    }, [])

    useEffect(() => {

        const bar = OverlayScrollbars(document.querySelectorAll('body'), { className: "os-theme-dark" })
        bar.scroll({ y: '0%' }, 500)

        socket
            .emit('request-login-info')
            .on('login-info', handleLoginInfo)

        return () => {
            socket
                .off('login-info', handleLoginInfo)
                .off('logged-out', handleLogout)
        }
    }, [handleLoginInfo, handleLogout, socket, store])

    const logoutHelper = useCallback(() => {
        socket.emit('logout').on('logged-out', handleLogout)
        return <Component />
    }, [socket, handleLogout])

    return (
        <Route {...rest} render={(props) => {
            if(!status){
                if(!noLoginPaths.includes(path)){
                    return <Redirect to='/' />
                }
            }else{
                if(noLoginPaths.includes(path)){
                    return <Redirect to='/home' />
                }

                if(path === '/logout'){
                    return (
                        <div>
                            {logoutHelper()}
                        </div>
                    )
                }

                if (allowed.findIndex(perm => perm === '*' || perm === permission) === -1) {
                    return <Redirect to='/home' />
                    
                }
            }

            return <Component {...props} user={user} permission={permission} />
        }} />
    )
}

/*
if (!status && path === '/') {
                return <Component  {...props} />
            } else if (status && path === '/') {
                return <Redirect to='/home' />
            } else if (status && path === '/logout') {
                return (
                    <div>
                        <div>
                            {logoutHelper()}
                        </div>
                    </div>
                )
            } else if (status && path.includes('/management')) {
                if (permission === 'superuser') {
                    return <Component {...props} />
                } else {
                    return <Redirect to='/home' />
                }
            } else if (status) {
                if (permission === 'superuser') {
                    return <Redirect to='/management' />
                } else {
                    if (allowed.findIndex(perm => perm === '*' || perm === permission) !== -1) {
                        return <Component {...props} user={user} permission={permission} />
                    } else {
                        return <Redirect to='/home' />
                    }
                }
            } else {
                return <Redirect to='/' />
            }
*/