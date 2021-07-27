import React, { useState, useEffect, useContext, useCallback } from 'react'
import { useParams } from 'react-router'

import Learn from '../exams/learn/Learn'
import DetailTable from './DataTable'

import globalStats from './models/GlobalStatistics'

import { SocketContext } from '../GlobalSocket'
import { NavLink } from 'react-router-dom'

export default function Profile() {

    const [data, setData] = useState([])
    const [filtered, setFiltered] = useState([])

    const [nev, setNev] = useState('')
    const [csoport, setCsoport] = useState('')
    const [isSame, setSame] = useState(false)

    const cardNum = useParams().profile

    const socket = useContext(SocketContext)

    const [stats, setStats] = useState(null)

    const handleStatistics = useCallback(stats => {
        if (stats.length > 0) {
            setStats(globalStats(stats))
        }
    }, [])

    const handleUsers = useCallback(users => {
        setData(users)
    }, [])

    const handleInfo = useCallback(user => {
        setNev(user[0].name)
        setCsoport(user[0].group)
    }, [])

    const handleSameUser = useCallback(result => {
        setSame(result)
    }, [])

    useEffect(() => {
        socket
            .emit('requesting-statistics', cardNum)
            .emit('get-user-list', cardNum)
            .emit('get-userinfo', cardNum)
            .emit('get-sameUser', cardNum)

        socket
            .on('sending-statistics', handleStatistics)
            .on('user-list', handleUsers)
            .on('userinfo', handleInfo)
            .on('sameUser', handleSameUser)

        return () => {
            socket
                .off('sending-statistics', handleStatistics)
                .off('user-list', handleUsers)
                .off('userinfo', handleInfo)
                .off('sameUser', handleSameUser)
        }
    }, [cardNum, handleStatistics, handleUsers, handleInfo, handleSameUser, socket])

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
            return <>Még nincsenek megjeleníthető adatok!</>
        }
    }, [renderStatsObject, stats])

    const search = useCallback(event => {
        if (event.target.value.length > 0) {
            const filteredBy = data.filter(item => {
                const search = event.target.value.toLowerCase().trim()
                return item.worker_name.includes(search) || item.worker_name.toLowerCase().includes(search) || item.worker_cardcode.toString().includes(search)
            })
            setFiltered(filteredBy)
        } else {
            setFiltered([])
        }
    }, [data])

    return (
        <div className="container-fluid text-center page">

            <div className='float-left mt-5 mr-3'>
                <form className="bg-light shadow rounded p-2">
                    <div className="form-group m-auto w-75">
                        <input type="text" name="search" autoComplete="off" onChange={search} required />
                        <label htmlFor="examName" className="label-name">
                            <span className="content-name">
                                Vizsgázó keresése
                            </span>
                        </label>
                    </div>
                    {<ul className="list-group w-75 mx-auto">
                        {filtered.map((elem, index) => {
                            return (
                                <NavLink to={`/${elem.worker_cardcode}`}><li className="list-group-item" key={index}>{elem.worker_name}</li></NavLink>
                            )
                        })}
                    </ul>}
                </form>

                <ProfileCard className='mt-5 border border-primary shadow' nev={nev} csoport={csoport} stats={renderGlobalStats()} />
            </div>

            <div className='float-right w-75'>
                <div className='mt-5 container shadow rounded text-center bg-light mb-3'>
                    <h5>Statisztika</h5>
                    <hr className="w-75" id="customline" />
                    <br />
                </div>

                <div className='mt-5'>
                    {isSame ?
                        <div className="container shadow rounded text-center bg-light mb-3">
                            <Learn />
                        </div>
                    : null}

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
            <text x="50%" y="50%" alignmentBaseline="central" textAnchor="middle" fontFamily="sans-serif" fontSize="50" fill="#fff">{`${nev ? nev.split(' ')[0].charAt(0) : 'J'}${nev ? nev.split(' ')[1].charAt(0) : 'D'}`}</text>
        </svg>

        <div className="card-body">
            <h5 className="card-title">{nev}</h5>
            <h6 className="card-subtitle mb-2 text-muted">Besorolás: {csoport}</h6>
            <hr />
            <p className="card-text">Az felhasználó vizsgáiról</p>
            <p className="card-text">{stats}</p>
        </div>
    </div>
)
