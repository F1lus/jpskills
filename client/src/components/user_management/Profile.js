import React, { useState, useEffect } from 'react'

import Learn from '../exams/learn/Learn'
import DetailTable from './DataTable'

import globalStats from './models/GlobalStatistics'

import manager from '../GlobalSocket'
import { Admin, User } from './handlers/PermissionHandler'

export default function Profile(props) {

    const nev = props.user
    const csoport = props.permission

    const socket = new manager().socket

    const [stats, setStats] = useState(null)

    useEffect(() => {
        socket.open()
        socket.emit('requesting-statistics')
        // eslint-disable-next-line
    },[])

    useEffect(() => {
        socket.on('sending-statistics', (stats) => {
            setStats(globalStats(stats))
        })

        return () => socket.disconnect()
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
                case 'skills':
                    return stats.skills
                default:
                    return null
            }
        }
    }

    function renderGlobalStats(){
        if(stats != null){
            return (
                <div className="alert alert-success my-2 w-75 mx-auto">
                    <p>Az eddigi vizsgáihoz szükséges átlag idő: {renderStatsObject('time') || 'Nincs adat'}</p>
                    <p>Az eddigi vizsgáin elért átlagos pontszám: {renderStatsObject('score') || 'Nincs adat'}</p>
                    <p>A vizsgák sikerességi aránya: {renderStatsObject('completion') || 'Nincs adat'}</p>
                </div>
            )
        }else{
            return <p className="alert alert-danger my-2">Nincs megjeleníthető tartalom</p>
        }
    }
    
    return (
        <div className="container text-center">
            <div className="container shadow rounded text-center bg-light mb-3 mt-3">
                <span id="nev"><p>{nev}</p></span>
                <hr className="w-75" id="customline"/>
                
                <h2>Besorolás: {csoport}</h2>

                <hr className="w-75" id="customline"/>
                <h3>Az Ön vizsgáiról általánosságban:</h3>
                <br/>
                {renderGlobalStats()}
                <br/>
            </div>

            <div>
                <Admin permission={csoport}>
                    <div className="container shadow rounded text-center bg-light mb-3 py-3">
                        <DetailTable permission={csoport} results={renderStatsObject('skills')}/>
                    </div>
                </Admin>
                
                <User permission={csoport}>
                    <div>
                        <div className="container shadow rounded text-center bg-light mb-3">
                            <Learn />
                        </div>
                        <div className="container shadow rounded text-center bg-light mb-3 pt-3">
                            <DetailTable user={nev} permission={csoport} results={renderStatsObject('skills')}/>
                        </div>
                    </div>
                </User>
            </div>
        </div>
    )
}
