import React, { useState, useCallback, useEffect } from 'react'

import DataTable, { createTheme } from 'react-data-table-component'

import { setLoad } from '../../../store/ActionHandler'

export default function Archived(props) {

    const socket = props.socket
    const store = props.store

    const [archivedList, setArchivedList] = useState([])
    const [displayArchived, setDisplayArchived] = useState([])
    const [selectedRows, setSelectedRows] = useState([])
    const [archiveIds, setArchiveIds] = useState([])

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

    const delExam = useCallback((event) => {
        event.preventDefault()

        setLoad(store, true)

        socket.emit('remove-skill', selectedRows)
    }, [socket, store, selectedRows])

    const delArchived = useCallback((event) => {
        event.preventDefault()

        setLoad(store, true)

        socket.emit('remove-archived', archiveIds)
    }, [socket, store, archiveIds])

    const handleArchived = useCallback(archived => {
        const tempList = []

        setArchivedList(archived)
        archived.forEach(element => {
            tempList.push({
                skillId: element.skillId,
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

        const selected = []
        const aIds = []

        archivedList.forEach(archive => {
            rows.forEach(row => {
                if(archive.skillId === row.skillId){
                    aIds.push(archive.archiveId)
                    selected.push({
                        examId: archive.examId,
                        workerId: archive.workerId,
                        skillId: archive.skillId
                    })
                }
            })
        })

        setSelectedRows(selected)
        setArchiveIds(aIds)
    }, [archivedList])

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

            <div className='my-2'>
                <button className='btn btn-primary m-5' onClick={delArchived}>Kiválasztott archívumok visszavonása</button>
                <button className='btn btn-danger m-5' onClick={delExam}>Kiválasztott archívumok törlése</button>
            </div>

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