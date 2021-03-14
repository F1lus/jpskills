import React from 'react'
import { Elemek } from './navItems';
import { NavLink } from 'react-router-dom';

export default () => (
    <div id="navbar">
        <section id="hatter" />
        <ul className="nav nav-fill mb-3">
            {Elemek.map((elem, index) => {
                return (
                    <NavLink 
                        exact to={elem.url} 
                        className={elem.url === '/logout' ? "nav-link text-danger" : "nav-link"} 
                        key={index} activeClassName="current"
                    >
                        {elem.title}
                    </NavLink>
                )
            })}
        </ul>
    </div>
)