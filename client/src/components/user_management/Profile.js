import React, { } from 'react';
import Learn from '../exams/learn/Learn';

export default function Profile(props) {

    const nev = props.user
    const csoport = props.permission
    
    return (
        <div className="container text-center">
            <div className="container shadow rounded text-center bg-light mb-5 mt-3">
                <span id="nev"><p>{nev}</p></span>
                <p>Besorolás: {csoport}</p>

                <h2>Globális statisztika</h2>
            </div>

            <div className="container shadow rounded text-center bg-light">
                {csoport === 'admin' ? null :<Learn />}
            </div>
        </div>
    )
}
