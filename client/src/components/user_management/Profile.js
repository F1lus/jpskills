import React, { useState } from 'react';

export default function Profile(props) {

    const nev = props.user
    const csoport = props.permission
    const [vizsgaszam, setVizsgaszam] = useState(5)
    
    return (
        <div className="d-flex align-items-center text-center vh-100">
            <div className="container shadow rounded text-center bg-light">
                <span><p>{nev}</p></span>
            </div>
        </div>
    )
}
