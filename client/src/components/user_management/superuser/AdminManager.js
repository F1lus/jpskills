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
    const [admins, setAdmins] = useState([])
    const [selectedAdmin, setSelectedAdmin] = useState(-1)

    const [exams, setExams] = useState([])
    const [displayList, setDisplayList] = useState([])

    const [warning, setWarning] = useState(false)

    //Backend kezelők

    const handleUserInfo = useCallback(userinfo => {
        if(userinfo.length > 0){
            setUserInfo([userinfo[0].id, userinfo[0].name])
        }

        setLoad(store, false)
    }, [store])

    const handleAdmins = useCallback(admins => {
        setAdmins(admins)

        setLoad(store, false)
    }, [store])

    const handleExams = useCallback(exams => {
        setExams(exams)
        setDisplayList(exams)

        setLoad(store, false)
    }, [store])

    const handleChange = useCallback(event => {
        switch(event.target.name){
            case 'selectAdmin':
                if(event.target.value !== -1){
                    setSelectedAdmin(event.target.value)
                }
                break
            default:
                break
        }
    }, [])

    const search = useCallback(event => {
        const value = event.target.value.toLowerCase().trim()

        const filterBySearch = exams.filter(exam => {
            return exam.examName.toLowerCase().includes(value) || exam.examCode.toLowerCase().includes(value)
        })

        setDisplayList(filterBySearch)
    }, [exams])

    const delUser = useCallback(event => {
        event.preventDefault()

        if(selectedAdmin === -1){
            setWarning(true)
        }else{
            setWarning(false)
            setLoad(store, true)
            socket.emit('delete-admin', user, selectedAdmin)
        }
    }, [selectedAdmin, socket, user, store])

    const removeHandler = useCallback(() => {
        socket.emit('get-admin-exams', user)
    }, [user, socket])

    useEffect(() => {
        setLoad(store, true)

        socket
            .emit('get-userinfo', user)
            .emit('get-admins', user)
            .emit('get-admin-exams', user)

            .on('userinfo', handleUserInfo)
            .on('admin-list', handleAdmins)
            .on('admin-exams', handleExams)
            .on('admin-removed', removeHandler)

        return () => {
            socket
                .off('userinfo', handleUserInfo)
                .off('admin-list', handleAdmins)
                .off('admin-exams', handleExams)
                .off('admin-removed', removeHandler)
        }
    }, [socket, handleUserInfo, handleExams, handleAdmins, removeHandler, user, store])

    const dataColumns = [
        {
            name: 'Vizsga neve',
            selector: row => row.examName,
            sortable: true
        },
        {
            name: 'Cikkszám',
            selector: row => row.examCode,
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

            <button className='btn btn-danger float-right' onClick={delUser}>Felhasználó törlése</button>
            <br /><br />
            <h1>{userInfo[1]}</h1>

            <hr className="w-75" />

            {warning ? <h6 className='alert alert-danger'>Még nem választotta ki, hogy törlés után kire szálljon a vizsgák tulajdonjoga</h6> : null}

            <select name='selectAdmin' className="w-50 rounded" onChange={handleChange}>
                <option value={-1}>Válassza ki, hogy kire szálljon törlés után a vizsgák tulajdonjoga!</option>
                {admins.length > 0 ? admins.map((admin, index) => {
                    return <option key={index} value={admin.cardcode}>{admin.name}</option>
                }) : null}
            </select>

            <hr className="w-75" />

            <form className="mb-3 w-50">
                <div className="form-group m-auto">
                    <input type="text" name="search" onChange={search} autoComplete="off" required />
                    <label htmlFor="search" className="label-name">
                        <span className="content-name">
                            Keresés vizsganév, vagy cikkszám alapján
                        </span>
                    </label>
                </div>
            </form>

            <DataTable
                columns={dataColumns}
                data={displayList}
                pagination={true}
                fixedHeader={true}
                noDataComponent={'Nincsenek megjeleníthető adatok.'}
                paginationComponentOptions={customText}
                theme="ownTheme"
            />

        </div>
    )
}