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
        <div className='container-fluid bg-light w-75 shadow rounded text-center py-3 mb-3 page'>
            <NavLink to='/management'>
                <button className='btn btn-outline-blue float-left'>Vissza</button>
            </NavLink>

            <button className='btn btn-danger float-right' onClick={e => {
                archiveUser(e, userInfo[0])
            }}>Felhasználó vizsgáinak archiválása</button>
            <br /><br />
            <h1>{userInfo[1]}</h1>

            <hr className="w-75" />

            <div className='alert alert-danger w-50 m-auto text-center mb-3'>
                <h2>CSALÁSSAL GYANÚSÍTOTT</h2>
                <hr className="w-75" />
                <h4>Indoklás: a fejlesztői konzol használatának kísérlete.</h4>
                <br />
                <small>Ezt az üzenetet azért látja, mivel a rendszer a felhasználónál gyanús tevékenységet rögzített.</small>
            </div>

            <Skills store={store} socket={socket} />

            <hr className='w-75 my-3' />

            <Archived store={store} socket={socket} />

        </div>
    )
}