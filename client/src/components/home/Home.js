import React, { useState } from 'react';
import {NavLink} from 'react-router-dom';
import './Timer.js';

export default function Home(props){
    
    const nev = props.user
    
    const [vanVizsga, setVanVizsga] = useState(true)
    
    return(
        <div className="d-flex align-items-center vh-100">
            <div className="container shadow rounded p-3 text-center">
                <div className="container d-flex justify-content-center">
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
                    <b>Kedves {nev}!</b>
                    <br/>
                    {vanVizsga ? 
                        <NavLink to="/exams">
                            <button type="button" className="btn btn-danger m-2" >
                                Van teljesítetlen vizsgája!
                            </button>
                        </NavLink>
                        :"Nincs teljesítetlen vizsgája!"}
                </div>
            </div>
        </div>
    )
}