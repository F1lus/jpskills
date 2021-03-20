import React, { useCallback, useContext, useEffect, useState } from 'react'
import { NavLink, useParams } from 'react-router-dom'
import { useStore } from 'react-redux'

import { SocketContext } from '../../GlobalSocket'
import { setLoad } from '../../store/ActionHandler'
import Skills from './tables/Skills'
import Archived from './tables/Archived'

export default function UserManager() {

    const user = useParams().user
    const socket = useContext(SocketContext)
    const store = useStore()

    const [userInfo, setUserInfo] = useState([])

    //Backend kezelők

    const archiveUser = useCallback((event, workerId) => {
        event.preventDefault()

        setLoad(store, true)
        socket.emit('archive-user', workerId)
    }, [socket, store])

    const handleUserInfo = useCallback(userinfo => {
        setUserInfo([userinfo[0].id, userinfo[0].name])
    }, [])

    const commonHandler = useCallback(() => {
        socket
            .emit('exams-by-cardcode', user)
            .emit('get-archived', user)
    }, [user, socket])

    //Adatok feldolgozása

    useEffect(() => {

        setLoad(store, true)
        socket
            .emit('exams-by-cardcode', user)
            .emit('get-archived', user)
            .on('userinfo', handleUserInfo)
            .on('skill-update', commonHandler)

        return () => {
            socket
                .off('userinfo', handleUserInfo)
                .off('skill-update', commonHandler)
        }
    }, [socket, commonHandler, handleUserInfo, user, store])



    return (
        <div className="d-flex container align-items-center justify-content-center vh-100">
            <div className='container-fluid m-auto bg-light shadow rounded py-3 page mb-3'>
                <NavLink to='/management'>
                    <button className='btn btn-outline-blue float-left'>Vissza</button>
                </NavLink>

                <button className='btn btn-danger float-right' onClick={e => {
                    archiveUser(e, userInfo[0])
                }}>Felhasználó vizsgáinak archiválása</button>
                <h1 className='text-center'>{userInfo[1]}</h1>

                <hr />

                <div className='alert alert-danger w-50 m-auto'>
                    <h2>CSALÁSSAL GYANÚSÍTOTT</h2>
                    <hr />
                    <h4>Indoklás: a fejlesztői konzol használatának kísérlete.</h4>
                    <br />
                    <small>Ezt az üzenetet azért látja, mivel a rendszer a felhasználónál gyanús tevékenységet rögzített.</small>
                </div>

                <Skills store={store} socket={socket} />

                <hr className='m-3' />

                <Archived store={store} socket={socket} />
                
            </div>
        </div>
    )
}