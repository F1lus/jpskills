import React, { useState, useEffect } from 'react';
import {NavLink} from 'react-router-dom';

import manager from '../GlobalSocket'

export default function Home(props){
    
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
    },[])

    useEffect(() => {
        socket.on('exams-get-emitter', (dbExams) => {
            setVanVizsga(dbExams.length > 0)
        })
    })
    
    return(
        <div className="container d-flex align-items-center vh-100">
            <div className="container shadow rounded p-3 bg-light">
                <div className="container text-center">
                    <div className="container text-center m-3">
                        <span id="nev">Kedves {nev}!</span>
                        <hr className="w-75"/>
                    </div>
                    {props.permission === 'admin' ?
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
                        :
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
                </div>
            </div>
        </div>
    )
}