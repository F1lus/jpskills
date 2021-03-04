import React, { useState, useEffect, useContext, useCallback } from 'react'

import Learn from '../exams/learn/Learn'
import DetailTable from './DataTable'

import globalStats from './models/GlobalStatistics'

import {SocketContext} from '../GlobalSocket'
import { Admin, User } from './handlers/PermissionHandler'

export default function Profile(props) {

    const nev = props.user
    const csoport = props.permission

    const socket = useContext(SocketContext)

    const [stats, setStats] = useState(null)

    const handleStatistics = useCallback(stats => {
        if(stats.length > 0){
            setStats(globalStats(stats))
        }
    }, [])

    useEffect(() => {
        socket.emit('requesting-statistics')

        socket.on('sending-statistics', handleStatistics)

        return () => socket.off('sending-statistics', handleStatistics)
        // eslint-disable-next-line
    },[])

    const renderStatsObject = useCallback(entry =>{
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
    }, [stats])

    const renderGlobalStats = useCallback(() => {
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
    }, [renderStatsObject, stats])
    
    return (
        <div className="container text-center page">
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
