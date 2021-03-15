import React, { useCallback, useContext, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { Redirect, NavLink } from 'react-router-dom'
import DataTable from 'react-data-table-component'

import { SocketContext } from '../../GlobalSocket'

export default function Management() {

    const [user] = useSelector(state => [state.userReducer.user])
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
                    <NavLink to={`/management/${cardcode}`}>
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
    }, [])

    const search = useCallback(event => {
        const value = event.target.value.toLowerCase().trim()

        const filterBySearch = users.filter(user => {
            return user.name.toLowerCase().includes(value) || user.group.toLowerCase().includes(value)
        })

        setDisplayList(filterBySearch)
    }, [users])

    useEffect(() => {
        socket.emit('request-users')
    }, [socket])

    useEffect(() => {
        socket.on('existing-users', handleUsers)

        return () => socket.off('existing-users', handleUsers)
    }, [socket, handleUsers, displayList, users])

    const logout = useCallback(event => {
        event.preventDefault()
        setRedirect(true)
    }, [])

    return (
        <div className='container-fluid m-auto bg-light text-center py-3'>
            {redirect ? <Redirect to='/logout' /> : null}
            <button className='btn btn-danger float-right' onClick={logout}>Kilépés</button>
            <h2>Üdvözöljük, {user}</h2>

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
            />
        </div>
    )
}