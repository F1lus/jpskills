import React, { useCallback, useContext, useEffect, useState } from 'react'
import { NavLink, useParams } from 'react-router-dom'
import { useStore } from 'react-redux'

import { SocketContext } from '../../GlobalSocket'
import { setLoad } from '../../store/ActionHandler'

import DataTable, { createTheme } from 'react-data-table-component'

export default function AdminManager(){

    const user = useParams().user
    const socket = useContext(SocketContext)
    const store = useStore()

    const [userInfo, setUserInfo] = useState([])

    //Backend kezelők

    const handleUserInfo = useCallback(userinfo => {
        if(userinfo.length > 0){
            setUserInfo([userinfo[0].id, userinfo[0].name])
        }
    }, [])

    const commonHandler = useCallback(() => {
        socket
            .emit('exams-by-cardcode', user)
            .emit('get-archived', user)
    }, [user, socket])

    //Adatok feldolgozása

    useEffect(() => {

        setLoad(store, true)
        socket
            .emit('exams-by-cardcode', user)
            .emit('get-archived', user)
            .on('userinfo', handleUserInfo)
            .on('skill-update', commonHandler)

        return () => {
            socket
                .off('userinfo', handleUserInfo)
                .off('skill-update', commonHandler)
        }
    }, [socket, commonHandler, handleUserInfo, user, store])

    const dataColumns = [
        {
            name: 'Művelet',
            selector: row => row.operations,
            sortable: false
        },
        {
            name: 'Vizsga neve',
            selector: row => row.examName,
            sortable: true
        },
        {
            name: 'Készült',
            selector: row => row.created,
            sortable: true
        },
        {
            name: 'Módosítva',
            selector: row => row.modified,
            sortable: true
        }
    ]

    createTheme("ownTheme", {
        background: {
            default: "#f8f9fa"
        }
    })

    const customText = {
        rowsPerPageText: 'Sorok száma oldalanként:',
        rangeSeparatorText: '/',
        noRowsPerPage: false,
        selectAllRowsItem: false,
        selectAllRowsItemText: 'Összes'
    }

    return(
        <div className='container-fluid bg-light w-75 shadow rounded text-center py-3 mb-3 page'>
            <NavLink to='/management'>
                <button className='btn btn-outline-blue float-left'>Vissza</button>
            </NavLink>

            <button className='btn btn-danger float-right'>Felhasználó törlése</button>
            <br /><br />
            <h1>{userInfo[1]}</h1>

            <hr className="w-75" />

            <select className="w-50 rounded">
                <option value="0">Kérem válasszon</option>
            </select>

            <hr className="w-75" />

            <DataTable
                columns={dataColumns}
                pagination={true}
                fixedHeader={true}
                noDataComponent={'Nincsenek megjeleníthető adatok.'}
                paginationComponentOptions={customText}
                theme="ownTheme"
            />

        </div>
    )
}