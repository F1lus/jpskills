import React from 'react'
import {Elemek} from './navItems';
import {NavLink} from 'react-router-dom';

export default function CustomNavbar(){
    
    return (
        <div className="sticky-top">
            <section className="sticky-top" id="hatter"/>
            <ul className="nav nav-fill mb-3 sticky-top">
            {Elemek.map((elem,index)=>{
                return(
                    <NavLink exact to={elem.url} className="nav-link" key={index} activeClassName="current">
                        {elem.title}
                    </NavLink>
                )
            })}
            </ul>
        </div>
    );  
}