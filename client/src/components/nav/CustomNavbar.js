import React, { useCallback, useContext, useEffect, useState } from 'react'
import { Elemek } from './navItems';
import { NavLink } from 'react-router-dom';
import { SocketContext } from '../GlobalSocket';

export default () => {

    const [cardnum, setCardnum] = useState(null)

    const socket = useContext(SocketContext)

    const handleCardnum = useCallback(cardnum => setCardnum(cardnum), [])

    useEffect(() => {
        socket.emit('req-cardnum')

        socket.on('res-cardnum', handleCardnum)

        return () => {
            socket.off('res-cardnum', handleCardnum)
        }
    }, [socket, handleCardnum])

    return (
        <div id="navbar">
            <section id="hatter" />
            <ul className="nav nav-fill mb-3 border border-primary">
                {Elemek.map((elem, index) => {
                    return (
                        <NavLink
                            exact to={elem.url === '/profile' ? `/${cardnum}` : elem.url}
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
}