import React, { useState, useEffect } from 'react';

import Learn from '../exams/learn/Learn';

import globalStats from './models/GlobalStatistics'

import manager from '../GlobalSocket'

export default function Profile(props) {

    const nev = props.user
    const csoport = props.permission

    const socket = new manager().socket

    const [stats, setStats] = useState(null)

    useEffect(() => {
        socket.emit('requesting-statistics')
        // eslint-disable-next-line
    },[])

    useEffect(() => {
        socket.on('sending-statistics', (stats) => {
            setStats(globalStats(stats))
        })
    })

    function renderStatsObject(entry){
        if(stats){
            switch(entry){
                case 'time':
                    return stats.avgTime.avgMins+" perc "+stats.avgTime.avgSecs+" másodperc"
                case 'score':
                    return stats.avgScore
                case 'completion':
                    return stats.completedRate+"%"
                default:
                    return null
            }
        }
    }
    
    return (
        <div className="container text-center">
            <div className="container shadow rounded text-center bg-light mb-5 mt-3">
                <span id="nev"><p>{nev}</p></span>
                <hr/>
                <h2>Besorolás: {csoport}</h2>
                <hr/>
                <h3>Globális statisztika</h3>
                <p>Az eddigi vizsgáihoz szükséges átlag idő: {renderStatsObject('time')}</p>
                <p>Az eddigi vizsgáin az átlagos pont: {renderStatsObject('score')}</p>
                <p>A vizsgák sikerességi aránya: {renderStatsObject('completion')}</p>
                <br/>
            </div>

            <div className="container shadow rounded text-center bg-light">
                {csoport === 'admin' ? null : <Learn />}
            </div>
        </div>
    )
}
