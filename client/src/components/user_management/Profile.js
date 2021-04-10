import React, { useState, useEffect, useContext, useCallback } from 'react'
import { useSelector, useStore } from 'react-redux'

import { setLoad } from '../store/ActionHandler'

import Learn from '../exams/learn/Learn'
import DetailTable from './DataTable'

import globalStats from './models/GlobalStatistics'

import { SocketContext } from '../GlobalSocket'
import { Admin, User } from './handlers/PermissionHandler'

export default function Profile() {

    const [nev, csoport] = useSelector(state => [state.userReducer.user, state.userReducer.permission])

    const socket = useContext(SocketContext)
    const store = useStore()

    const [stats, setStats] = useState(null)

    const handleStatistics = useCallback(stats => {
        if (stats.length > 0) {
            setStats(globalStats(stats))
        }
        setLoad(store, false)
    }, [store])

    useEffect(() => {
        socket.emit('requesting-statistics')
        setLoad(store, true)

        socket.on('sending-statistics', handleStatistics)

        return () => socket.off('sending-statistics', handleStatistics)
        // eslint-disable-next-line
    }, [store])

    const renderStatsObject = useCallback(entry => {
        if (stats) {
            switch (entry) {
                case 'time':
                    return stats.avgTime.avgMins + " perc " + stats.avgTime.avgSecs + " másodperc"
                case 'score':
                    return stats.avgScore
                case 'completion':
                    return stats.completedRate + "%"
                case 'skills':
                    return stats.skills
                default:
                    return null
            }
        }
    }, [stats])

    const renderGlobalStats = useCallback(() => {
        if (stats != null) {
            return (
                <div className="alert alert-success text-justify my-2 w-75 mx-auto">
                    <h2 className='text-center'>Az Ön vizsgáiról általánosságban</h2>
                    <hr />
                    <h5>A vizsgáin eltöltött átlag idő: {renderStatsObject('time') || 'Nincs adat'}</h5>
                    <h5>A vizsgáin elért átlagos pontszám: {renderStatsObject('score')}</h5>
                    <h5>A vizsgáin a sikerességi arány: {renderStatsObject('completion') || 'Nincs adat'}</h5>
                </div>
            )
        } else {
            return <h5 className="alert alert-danger my-2">Az Ön vizsgáiról még nem készíthető statisztika!</h5>
        }
    }, [renderStatsObject, stats])

    return (
        <div className="container text-center page">
            <div className="container shadow rounded text-center bg-light mb-3 mt-3">
                <span id="nev"><p>{nev}</p></span>

                <h2>Besorolás: {csoport}</h2>

                <hr className="w-75" id="customline" />
                {renderGlobalStats()}
                <br />
            </div>

            <div>
                <div className="container shadow rounded text-center bg-light mb-3">
                    <Learn />
                </div>
                <Admin permission={csoport}>
                    <div className="container shadow rounded text-center bg-light mb-3 py-3">
                        <DetailTable permission={csoport} results={renderStatsObject('skills')} />
                    </div>
                </Admin>

                <User permission={csoport}>
                    <div>
                        <div className="container shadow rounded text-center bg-light mb-3 py-3">
                            <DetailTable user={nev} permission={csoport} results={renderStatsObject('skills')} />
                        </div>
                    </div>
                </User>
            </div>
        </div>
    )
}
