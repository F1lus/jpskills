import React, { useCallback, useContext, useEffect, useState } from 'react'
import { useSelector, useStore } from 'react-redux'
import { Redirect, NavLink } from 'react-router-dom'
import DataTable, { createTheme } from 'react-data-table-component'

import { SocketContext } from '../../GlobalSocket'
import { setLoad } from '../../store/ActionHandler'

export default function Management() {

    const [user] = useSelector(state => [state.userReducer.user])
    const store = useStore()
    const socket = useContext(SocketContext)

    const [redirect, setRedirect] = useState(false)
    const [users, setUsers] = useState([])
    const [displayList, setDisplayList] = useState([])

    const dataColumns = [
        {
            name: '',
            selector: row => row.cardcode,
            sortable: false
        },
        {
            name: 'Név',
            selector: row => row.name,
            sortable: true
        },
        {
            name: 'Csoport',
            selector: row => row.group,
            sortable: true
        },
        {
            name: 'Állapot',
            selector: row => row.isActive,
            sortable: true
        }
    ]

    const customText = {
        rowsPerPageText: 'Sorok száma oldalanként:',
        rangeSeparatorText: '/',
        noRowsPerPage: false,
        selectAllRowsItem: false,
        selectAllRowsItemText: 'Összes'
    }

    const handleUsers = useCallback(userArray => {
        setUsers(userArray)
        const tempList = []
        userArray.forEach(element => {
            const cardcode = element.cardcode
            tempList.push({
                name: element.name,
                cardcode: (
                    <NavLink to={
                        element.group === 'admin' || element.group === 'Adminisztrátor' ?
                            `/management/admin/${cardcode}`
                            :
                            `/management/${cardcode}`
                    }>
                        <button className='btn btn-outline-blue'>
                            Kezelés
                        </button>
                    </NavLink>
                ),
                group: element.group,
                isActive: element.isActive ? 'Aktív' : 'Inaktív'
            })
        })
        setDisplayList(tempList)
        setLoad(store, false)
    }, [store])

    const search = useCallback(event => {
        const value = event.target.value.toLowerCase().trim()

        const filterBySearch = users.filter(user => {
            return user.name.toLowerCase().includes(value) || user.group.toLowerCase().includes(value)
        })
        const tempList = []

        filterBySearch.forEach(element => {
            const cardcode = element.cardcode
            tempList.push({
                name: element.name,
                cardcode: (
                    <NavLink to={
                        element.group === 'admin' || element.group === 'Adminisztrátor' ?
                            `/management/admin/${cardcode}`
                            :
                            `/management/${cardcode}`
                    }>
                        <button className='btn btn-outline-blue'>
                            Kezelés
                        </button>
                    </NavLink>
                ),
                group: element.group,
                isActive: element.isActive ? 'Aktív' : 'Inaktív'
            })
        })

        setDisplayList(tempList)
    }, [users])

    useEffect(() => {
        setLoad(store, true)
        socket.emit('request-users')
    }, [socket, store])

    useEffect(() => {
        socket.on('existing-users', handleUsers)

        return () => socket.off('existing-users', handleUsers)
    }, [socket, handleUsers, displayList, users])

    const logout = useCallback(event => {
        event.preventDefault()
        setRedirect(true)
    }, [])

    createTheme("ownTheme", {
        background: {
            default: "#f8f9fa"
        }
    })

    return (
        <div className='container-fluid bg-light w-75 shadow rounded text-center py-3 mb-3 page'>
            {redirect ? <Redirect to='/logout' /> : null}

            <button className='btn btn-danger float-right' onClick={logout}>Kilépés</button>
            <h2 className='float-center'>Üdvözöljük, {user}</h2>
            <hr className='mt-5 w-75' />

            <h3>A képzettségi mátrixban létező felhasználók száma: {users.length} fő</h3>

            <form className="mb-3 w-50">
                <div className="form-group m-auto">
                    <input type="text" name="search" onChange={search} autoComplete="off" required />
                    <label htmlFor="search" className="label-name">
                        <span className="content-name">
                            Keresés név, vagy csoport alapján
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