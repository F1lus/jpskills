import React, { useState, useEffect, useContext, useCallback } from 'react'
import { NavLink } from 'react-router-dom'
import { useSelector, useStore } from 'react-redux'

import { setLoad } from '../store/ActionHandler'
import { SocketContext } from '../GlobalSocket'
import { Admin, User } from '../user_management/handlers/PermissionHandler'

import { Adminnak, Usernek } from './Helpdesk'
import { ChevronRightIcon } from '@primer/octicons-react'

import OverlayScrollbars from 'overlayscrollbars'
import 'overlayscrollbars/css/OverlayScrollbars.css'

export default function Home() {

    const socket = useContext(SocketContext)
    const store = useStore()

    const [user, permission] = useSelector(state => [state.userReducer.user, state.userReducer.permission])

    const [vanVizsga, setVanVizsga] = useState(false)

    const handleExams = useCallback(dbExams => {
        setVanVizsga(dbExams.length > 0)
        setLoad(store, false)
    }, [store])

    useEffect(() => {
        if (permission !== 'admin') {
            setLoad(store, true)
            socket.emit('exams-get-signal')
        }

        socket.on('exams-get-emitter', handleExams)

        return () => socket.off('exams-get-emitter', handleExams)
        // eslint-disable-next-line
    }, [store])

    useEffect(() => {
        OverlayScrollbars(document.getElementById('questions'), { className: "os-theme-dark" })
        OverlayScrollbars(document.getElementById('helpcontainer'), { className: "os-theme-dark" })
    })

    const needHelp = useCallback((event, index) => {
        if (permission === 'admin') {
            if (event.target.checked) {
                document.getElementById('help').innerHTML = Adminnak[index].valasz
            } else {
                document.getElementById('help').innerHTML = null
            }
        } else {
            if (event.target.checked) {
                document.getElementById('help').innerHTML = Usernek[index].valasz
            } else {
                document.getElementById('help').innerHTML = null
            }
        }
    }, [permission])

    const welcomeText = useCallback(() => {
        const timeOfDay = new Date().getHours()
        if (timeOfDay >= 6 && timeOfDay < 10) {
            return 'Jó reggelt, ' + user + '!'
        } else if (timeOfDay >= 10 && timeOfDay < 18) {
            return 'Jó napot, ' + user + '!'
        } else if (timeOfDay >= 18 || timeOfDay < 6) {
            return 'Jó estét, ' + user + '!'
        } else {
            return 'Üdvözöljük, ' + user + '!'
        }
    }, [user])

    return (
        <div className="container mb-3 mt-3 page">
            <div className="container shadow rounded p-3 bg-light mb-3">
                <div className="container text-center">
                    <div className="container text-center m-3">
                        <span id="nev">{welcomeText()}</span>
                        <hr className="w-75" />
                    </div>
                    <Admin permission={permission}>
                        <div>
                            <NavLink to="/profile">
                                <button type="button" className="btn btn-warning m-2" >
                                    Nézze meg a statisztikákat
                                </button>
                            </NavLink>
                            <h4>vagy</h4>
                            <NavLink to="/exams">
                                <button type="button" className="btn btn-warning m-2" >
                                    Ugorjon a vizsgákhoz
                                </button>
                            </NavLink>
                        </div>
                    </Admin>
                    <User permission={permission}>
                        {
                            vanVizsga ?
                                <NavLink to="/exams">
                                    <button type="button" className="btn btn-warning m-2" >
                                        Van teljesítetlen vizsgája!
                                    </button>
                                </NavLink>
                                :
                                <div className="container w-50 text-center rounded m-auto p-2 border border-warning" id="nincs">
                                    <b>
                                        Gratulálunk, nincs teljesítetlen vizsgája!
                                    </b>
                                </div>
                        }
                    </User>
                </div>
            </div>

            <div className="container shadow rounded p-3 bg-light mb-3">
                <h1 className="text-center"><p>Használati útmutató</p></h1>
                <Admin permission={permission}>
                    <div className="container">
                        <div className="border border-warning rounded" id="questions">
                            {Adminnak.map((value, index) => {
                                return (
                                    <div className="container radio" key={index}>
                                        <label>
                                            <input type="radio" name="question" onChange={e => needHelp(e, index)} />
                                            <ChevronRightIcon className="icon" />
                                            <label>{value.kerdes}</label>
                                        </label>
                                    </div>
                                )
                            })}
                        </div>
                        <div className="mt-3" id="helpcontainer">
                            <p id="help" />
                        </div>
                    </div>
                </Admin>
                <User permission={permission}>
                    <div className="container">
                        <div className="border border-warning rounded" id="questions">
                            {Usernek.map((value, index) => {
                                return (
                                    <div className="container radio" key={index}>
                                        <label>
                                            <input type="radio" name="question" onChange={e => needHelp(e, index)} />
                                            <ChevronRightIcon className="icon" />
                                            <label>{value.kerdes}</label>
                                        </label>
                                    </div>
                                )
                            })}
                        </div>
                        <div className="mt-3" id="helpcontainer">
                            <p id="help" />
                        </div>
                    </div>
                </User>
            </div>
        </div>
    )
}