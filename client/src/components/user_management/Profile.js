import React, { useState, useEffect, useContext, useCallback } from 'react'
import { useParams } from 'react-router'
import { useSelector } from 'react-redux'

import Learn from '../exams/learn/Learn'
import DetailTable from './DataTable'

import globalStats from './models/GlobalStatistics'

import { SocketContext } from '../GlobalSocket'

export default function Profile() {

    const [nev, csoport] = useSelector(state => [state.userReducer.user, state.userReducer.permission])

    const cardNum = useParams().profile

    const socket = useContext(SocketContext)

    const [stats, setStats] = useState(null)

    const handleStatistics = useCallback(stats => {
        if (stats.length > 0) {
            setStats(globalStats(stats))
        }
    }, [])

    useEffect(() => {
        socket.emit('requesting-statistics', cardNum)

        socket.on('sending-statistics', handleStatistics)

        return () => socket.off('sending-statistics', handleStatistics)
        // eslint-disable-next-line
    }, [])

    const renderStatsObject = useCallback(entry => {
        if (stats) {
            switch (entry) {
                case 'time':
                    return stats.avgTime.avgMins + " p " + stats.avgTime.avgSecs + " mp"
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
                <div className='text-justify'>
                    <div>Átlagos vizsgaidő: {renderStatsObject('time') || 'Nincs adat'}</div>
                    <div>Átlagos pontszám: {renderStatsObject('score')}</div>
                    <div>Sikerességi arány: {renderStatsObject('completion') || 'Nincs adat'}</div>
                </div>
            )
        } else {
            return <div>Még nincsenek megjeleníthető adatok!</div>
        }
    }, [renderStatsObject, stats])

    return (
        <div className="container-fluid text-center page">

            <ProfileCard className='float-left mt-5 ml-5 border border-primary shadow' nev={nev} csoport={csoport} stats={renderGlobalStats()} />

            <div className='float-right w-75'>
                <div className='mt-5 container shadow rounded text-center bg-light mb-3'>
                    <h5>Statisztika</h5>
                    <hr className="w-75" id="customline" />
                    <br />
                </div>

                <div className='mt-5'>
                    <div className="container shadow rounded text-center bg-light mb-3">
                        <Learn />
                    </div>

                    <div className="container shadow rounded text-center bg-light mb-3 py-3">
                        <DetailTable user={nev} permission={csoport} results={renderStatsObject('skills')} />
                    </div>

                </div>
            </div>
        </div>
    )
}

const ProfileCard = ({ nev, csoport, stats, className }) => (
    <div className={`card ${className}`} style={{ width: '20rem' }}>
        <br />
        <svg className='m-auto' width="100" height="100">
            <circle cx="50" cy="50" r="50" fill="#ffc107" />
            <text x="50%" y="50%" alignment-baseline="central" text-anchor="middle" font-family="sans-serif" font-size="50" fill="#fff">{`${nev ? nev.split(' ')[0].charAt(0) : 'J'}${nev ? nev.split(' ')[1].charAt(0) : 'D'}`}</text>
        </svg>

        <div className="card-body">
            <h5 className="card-title">{nev}</h5>
            <h6 className="card-subtitle mb-2 text-muted">Besorolás: {csoport}</h6>
            <hr/>
            <p className="card-text">Az Ön vizsgáiról</p>
            <p className="card-text">{stats}</p>
        </div>
    </div>
)
