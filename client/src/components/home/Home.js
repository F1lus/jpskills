import React, { useState } from 'react';
import {NavLink} from 'react-router-dom';
import './Timer.js';

export default function Home(props){
    
    const nev = props.user
    
    const [vanVizsga, setVanVizsga] = useState(false)
    
    return(
        <div className="d-flex align-items-center vh-100">
            <div className="container shadow rounded p-3 bg-light">
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
                <div className="d-flex align-items-center container">
                    <div className="container text-center">
                        <span>
                            Kedves {nev}!
                        </span>
                    </div>
                    <br/>
                    {vanVizsga ? 
                        <NavLink to="/exams">
                            <button type="button" className="btn btn-warning m-2" >
                                Van teljesítetlen vizsgája!
                            </button>
                        </NavLink>
                        :<div className="text-center rounded" id="nincs"><b>Gratulálunk, nincs teljesítetlen vizsgája!</b></div>}
                </div>
            </div>
        </div>
    )
}