import React, { useState, useCallback, useEffect } from 'react'

import DataTable, { createTheme } from 'react-data-table-component'

import { setLoad } from '../../../store/ActionHandler'

export default function Archived(props) {

    const socket = props.socket
    const store = props.store

    const [archivedList, setArchivedList] = useState([])
    const [displayArchived, setDisplayArchived] = useState([])
    const [selectedRows, setSelectedRows] = useState([])

    const dataColumns = [
        {
            name: 'Vizsga',
            selector: row => row.examName,
            sortable: true
        },
        {
            name: 'Archiváló',
            selector: row => row.archiver,
            sortable: true
        },
        {
            name: 'Vizsga eredmény',
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

    const delExam = useCallback((event, examId, workerId, skillId) => {
        event.preventDefault()

        setLoad(store, true)

        socket.emit('remove-skill', examId, workerId, skillId)
    }, [socket, store])

    const delArchived = useCallback((event, archiveId) => {
        event.preventDefault()

        setLoad(store, true)

        socket.emit('remove-archived', archiveId)
    }, [socket, store])

    const handleArchived = useCallback(archived => {
        const tempList = []

        setArchivedList(archived)
        archived.forEach(element => {
            tempList.push({
                examName: element.examName,
                archiver: element.archiver,
                completed: element.completed ? 'Sikeres' : 'Sikertelen'
            })
        })

        setDisplayArchived(tempList)
    }, [])

    useEffect(() => {
        socket.on('archived-list', handleArchived)

        return () => socket.off('archived-list', handleArchived)
    }, [handleArchived, socket])

    const search = useCallback(event => {
        const value = event.target.value.toLowerCase().trim()
        const tempList = []

        archivedList
            .filter(exam => {
                return exam.examName.toLowerCase().includes(value) || exam.archiver.toLowerCase().includes(value)
            })
            .forEach(element => {
                tempList.push({
                    examName: element.examName,
                    archiver: element.archiver,
                    completed: element.completed ? 'Sikeres' : 'Sikertelen'
                })
            })

        setDisplayArchived(tempList)
    }, [archivedList])

    createTheme("ownTheme", {
        background: {
            default: "#f8f9fa"
        }
    })

    const handleSelect = useCallback((state) => {
        const rows = state.selectedRows
        setSelectedRows(rows)
    }, [])

    return (
        <div>
            <h3>Archivált vizsgák</h3>

            <form className="mb-3 w-50">
                <div className="form-group m-auto">
                    <input type="text" name="search" onChange={search} autoComplete="off" required />
                    <label htmlFor="search" className="label-name">
                        <span className="content-name">
                            Keresés név, vagy archiváló alapján
                        </span>
                    </label>
                </div>
            </form>

            <DataTable
                columns={dataColumns}
                data={displayArchived}
                pagination={true}
                fixedHeader={true}
                noDataComponent={'Nincsenek megjeleníthető adatok.'}
                paginationComponentOptions={customText}
                theme="ownTheme"
                selectableRows
                onSelectedRowsChange={handleSelect}
            />
        </div>
    )
}