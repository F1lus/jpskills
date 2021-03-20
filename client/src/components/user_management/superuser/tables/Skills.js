import React, {useCallback, useEffect, useState} from 'react'

import DataTable, { createTheme } from 'react-data-table-component'

import { setLoad } from '../../../store/ActionHandler'

export default function Skills(props) {

    const socket = props.socket
    const store = props.store

    const [displayList, setDisplayList] = useState([])
    const [exams, setExams] = useState([])

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

    const delExam = useCallback((event, examId, workerId) => {
        event.preventDefault()

        setLoad(store, true)
        socket.emit('remove-skill', examId, workerId)
    }, [socket, store])

    const archiveExam = useCallback((event, examId, workerId) => {
        event.preventDefault()

        setLoad(store, true)

        socket.emit('archive-skills', [{
            examId,
            workerId
        }])
    }, [socket, store])

    const handleExams = useCallback(exams => {
        setExams(exams)

        const tempList = []

        exams.forEach(element => {
            tempList.push({
                operations: (
                    <div>
                        <button className="btn btn-outline-danger mx-2" onClick={e => {
                            delExam(e, element.examId, element.workerId)
                        }}>Törlés</button>
                        <button className="btn btn-outline-blue mx-2" onClick={e => {
                            archiveExam(e, element.examId, element.workerId)
                        }}>Archiválás</button>
                    </div>
                ),
                examName: element.examName,
                examCode: element.examCode,
                completed: element.completed ? 'Sikeres' : 'Sikertelen'
            })
        })

        setDisplayList(tempList)
        setLoad(store, false)
    }, [archiveExam, delExam, store])

    const search = useCallback(event => {
        const value = event.target.value.toLowerCase().trim()
        const tempList = []

        exams
            .filter(exam => {
                return exam.examName.toLowerCase().includes(value) || exam.examCode.toLowerCase().includes(value)
            })
            .forEach(element => {
                tempList.push({
                    operations: (
                        <div>
                            <button className="btn btn-outline-danger mx-2" onClick={e => {
                                delExam(e, element.examId, element.workerId)
                            }}>Törlés</button>
                            <button className="btn btn-outline-blue mx-2" onClick={e => {
                                archiveExam(e, element.examId, element.workerId)
                            }}>Archiválás</button>
                        </div>
                    ),
                    examName: element.examName,
                    examCode: element.examCode,
                    completed: element.completed ? 'Sikeres' : 'Sikertelen'
                })
            })

        setDisplayList(tempList)
    }, [exams, archiveExam, delExam])

    useEffect(() => {
        socket.on('user-exams', handleExams)

        return () => socket.off('user-exams', handleExams)
    })

    createTheme("ownTheme", {
        background: {
            default: "#f8f9fa"
        }
    })

    return (
        <div>
            <h3>Vizsga eredmények</h3>

            <form className="mb-3 w-50">
                <div className="form-group m-auto">
                    <input type="text" name="search" onChange={search} autoComplete="off" required />
                    <label htmlFor="search" className="label-name">
                        <span className="content-name">
                            Keresés név, vagy cikkszám alapján
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