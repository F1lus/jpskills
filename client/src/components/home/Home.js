import React, { useState, useEffect } from 'react';
import {NavLink} from 'react-router-dom';

import manager from '../GlobalSocket'

//import './Timer.js';

export default function Home(props){
    
    const socket = new manager().socket
    const nev = props.user
    
    const [vanVizsga, setVanVizsga] = useState(false)

    useEffect(() => {

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
                <div className="d-flex justify-content-center">
                    <div className="row" id="ido">
                        <div className="container m-2 px-2" id="h1"/>
                        <div className="container m-2 px-2" id="h2"/>
                        <p className="py-1 ml-1">:</p>
                        <div className="container m-2 px-2" id="m1"/>
                        <div className="container m-2 px-2" id="m2"/>
                        <p className="py-1 ml-1">:</p>
                        <div className="container m-2 px-2" id="s1"/>
                        <div className="container m-2 px-2" id="s2"/>
                    </div>
                </div>
                <div className="container text-center">
                    <div className="container text-center m-3">
                        <span id="nev">Kedves {nev}!</span>
                    </div>

                    {
                        props.permission === 'admin' ?
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