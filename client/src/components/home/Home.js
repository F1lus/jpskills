import React, { useState, useEffect, useContext, useCallback } from 'react'
import { NavLink } from 'react-router-dom'

import { SocketContext } from '../GlobalSocket'
import { Admin, User } from '../user_management/handlers/PermissionHandler'

import { Adminnak, Usernek } from './Helpdesk'
import { ChevronRightIcon } from '@primer/octicons-react'

export default function Home(props) {

    const socket = useContext(SocketContext)

    const nev = props.user

    const [vanVizsga, setVanVizsga] = useState(false)

    const handleExams = useCallback(dbExams => {
        setVanVizsga(dbExams.length > 0)
    }, [])

    useEffect(() => {

        socket.emit('exams-get-signal')

        socket.on('exams-get-emitter', handleExams)

        return () => socket.off('exams-get-emitter', handleExams)
        // eslint-disable-next-line
    }, [])



    function needHelp(event, index) {
        if (event.target.checked) {
            document.getElementById('help').innerHTML = Adminnak[index].valasz
        } else {
            document.getElementById('help').innerHTML = null
        }
    }

    return (
        <div className="container mb-3">
            <div className="container shadow rounded p-3 bg-light mb-3">
                <div className="container text-center">
                    <div className="container text-center m-3">
                        <span id="nev">Kedves {nev}!</span>
                        <hr className="w-75" />
                    </div>
                    <Admin permission={props.permission}>
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
                    <User permission={props.permission}>
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

            <div className="container shadow rounded p-3 bg-light">
                <h1 className="text-center"><p>Segítség a használathoz</p></h1>
                <Admin permission={props.permission}>
                    <p className="ml-2">Segítségnyújtás adminoknak</p>
                    <div className="container">
                        <div className="row">
                            <div className="col-sm-6 col-8">
                                {Adminnak.map((value, index) => {
                                    return (
                                        <div className="container radio" key={index}>
                                            <label>
                                                <input type="radio" name="question" onChange={e => needHelp(e, index)} />
                                                <ChevronRightIcon className="icon" />
                                                <label>{value.kerdes}</label>
                                            </label>
                                            <hr className="w-50 mx-0 mb-4" />
                                        </div>
                                    )
                                })}
                            </div>
                            <div className="col-sm-6 col-4">
                                <p id="help" />
                            </div>
                        </div>
                    </div>
                </Admin>
                <User permission={props.permission}>
                <p className="ml-2">Segítségnyújtás vizsgázóknak</p>
                    <div className="container">
                        <div className="row">
                        <div className="col-sm-6 col-8">
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
                            <div className="col-sm-6 col-4">
                                <p id="help" />
                            </div>
                        </div>
                    </div>
                </User>
            </div>
        </div>
    )
}