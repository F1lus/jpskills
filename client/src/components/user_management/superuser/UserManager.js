import React, {useCallback, useContext, useEffect, useState} from 'react'
import { NavLink, useParams } from 'react-router-dom'
import DataTable from 'react-data-table-component'

import { SocketContext } from '../../GlobalSocket'

export default function UserManager() {

    const user = useParams().user
    const socket = useContext(SocketContext)

    const [exams, setExams] = useState([])
    const [userInfo, setUserInfo] = useState('')
    const [displayList, setDisplayList] = useState([])

    const dataColumns = [
        {
            name: 'Műveletek',
            selector: row => row.operations,
            sortable: false
        },
        {
            name: 'Vizsga',
            selector: row => row.examName,
            sortable: true
        },
        {
            name: 'Cikkszám',
            selector: row => row.examCode,
            sortable: true
        },
        {
            name: 'Eredmény',
            selector: row => row.completed,
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

    const handleExams = useCallback(exams => {
        setExams(exams[0])
        setUserInfo(exams[1][0].name)

        const tempList = []

        exams[0].forEach(element => {
            tempList.push({
                operations: (
                    <div>
                        <button>Törlés</button>
                        <button>Archiválás</button>
                    </div>
                ),
                examName: element.examName,
                examCode: element.examCode,
                completed: element.completed ? 'Sikeres' : 'Sikertelen'
            })
        })

        setDisplayList(tempList)
    }, [])

    useEffect(() => {
        socket.emit('exams-by-cardcode', user)
    }, [user, socket])

    useEffect(() => {
        socket.on('user-exams', handleExams)

        return () => socket.off('user-exams', handleExams)
    }, [socket, handleExams])

    return (
        <div className='container-fluid m-auto bg-light text-center py-3'>
            <NavLink to='/management'>
                <button className='btn btn-outline-primary float-left'>{'<- Vissza'}</button>
            </NavLink>
            <h2>Felhasználó: {userInfo}</h2>

            <h3>Vizsga eredmények</h3>

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