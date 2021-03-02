import React, { useState, useEffect } from 'react'
import {NavLink} from 'react-router-dom'
 
import manager from '../GlobalSocket'
import { Admin, User } from '../user_management/handlers/PermissionHandler'

import { Adminnak, Usernek } from './Helpdesk'
import {ChevronRightIcon} from '@primer/octicons-react'

export default function Home(props) {

    const socket = new manager().socket
    const nev = props.user

    const [vanVizsga, setVanVizsga] = useState(false)

    useEffect(() => {
        socket.open()
        socket.emit('exams-get-signal')

        return () => {
            socket.disconnect()
        }
        // eslint-disable-next-line
    }, [])

    useEffect(() => {
        socket.on('exams-get-emitter', (dbExams) => {
            setVanVizsga(dbExams.length > 0)
        })
    })

    function needHelp(event, index) {
        if(event.target.checked) {
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
                        <div className="container">
                            <div className="row">
                                <div className="col-6">
                                    {Adminnak.map((value, index) => {
                                        return(
                                            <div className="container radio" key={index}>
                                                <label>
                                                    <input type="radio" name="question" onChange={e => needHelp(e, index)}/>
                                                    <ChevronRightIcon className="icon"/>
                                                    <label id="text">{value.kerdes}</label>
                                                </label>
                                            </div>
                                        )
                                    })}
                                </div>
                                <div className="col-6">
                                    <p id="help"/>
                                </div>
                            </div>
                        </div>
                    </Admin>
                    <User permission={props.permission}>
                        <div className="container">
                            <div className="row">
                                <div className="col-4">
                                    {Usernek.map((value, index) => {
                                        return(
                                            <div className="container radio" key={index}>
                                                <label>
                                                    <input type="radio" name="question" className="mr-1" onChange={e => needHelp(e, index)}/>
                                                    {value.kerdes}
                                                </label>
                                            </div>
                                        )
                                    })}
                                </div>
                                <div className="col-8">
                                    <p id="help"/>
                                </div>
                            </div>
                        </div>
                    </User>
            </div>
        </div>
    )
}