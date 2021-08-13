import React, { useState, useEffect, useCallback } from 'react'

import DataTable, { createTheme } from 'react-data-table-component'
import { Admin } from './handlers/PermissionHandler'

import useExamStats from './models/ExamStatistics'
import Visualizer from './Visualizer'

export default function DetailTable(props) {

    const [exams, setExams] = useState([])
    const [examSelector, setExamSelector] = useState([])
    const [examCode, setExamCode] = useState(null)
    const [workingList, setWorkingList] = useState([])
    const [results, setResults] = useState([])
    const [displayList, setDisplayList] = useState([])
    const [completion, setCompletion] = useState(0)

    const stats = useExamStats(workingList)

    const columns = [
        {
            name: ['admin', 'Adminisztrátor'].includes(props.permission)  ? 'Vizsgázó neve' : 'Vizsga neve',
            selector: row => ['admin', 'Adminisztrátor'].includes(props.permission) ? row.worker : row.examName,
            sortable: true
        },

        {
            name: "Pontszám",
            selector: row => row.score,
            sortable: true
        },

        {
            name: "Idő",
            selector: row => row.time,
            sortable: true
        },

        {
            name: "Eredmény",
            selector: row => row.completed,
            sortable: true
        }
    ]

    const filterByExam = useCallback(isAdmin => {
        let filteredArray = []
        if (isAdmin) {
            if (props.results && examCode) {
                props.results.forEach((value, index) => {
                    const timeFormat = (value.time % 60).toString().length < 2 ?
                        Math.floor(value.time / 60) + ":0" + (value.time % 60).toString()
                        : Math.floor(value.time / 60) + ":" + (value.time % 60).toString()
                    if (value.examCode === examCode) {
                        filteredArray.push(
                            {
                                id: index + 1,
                                worker: value.worker,
                                score: value.score,
                                time: timeFormat,
                                completed: value.completed ? 'Átment' : 'Megbukott'
                            }
                        )
                    }
                })
            }
        } else {
            if (props.results) {
                props.results.forEach((value, index) => {
                    const timeFormat = (value.time % 60).toString().length < 2 ?
                        Math.floor(value.time / 60) + ":0" + (value.time % 60).toString()
                        : Math.floor(value.time / 60) + ":" + (value.time % 60).toString()
                    if (examCode) {
                        if (value.examCode === examCode) {
                            filteredArray.push(
                                {
                                    id: index + 1,
                                    examName: value.examName,
                                    score: value.score,
                                    time: timeFormat,
                                    completed: value.completed ? 'Átment' : 'Megbukott'
                                }
                            )
                        }
                    } else {
                        filteredArray.push(
                            {
                                id: index + 1,
                                examName: value.examName,
                                score: value.score,
                                time: timeFormat,
                                completed: value.completed ? 'Átment' : 'Megbukott'
                            }
                        )
                    }
                })
            }
        }
        return filteredArray
    }, [examCode, props.results])

    const handleCompletion = useCallback(completion => {
        setCompletion(completion)
    }, [])

    useEffect(() => {
        if (props.results) {
            const array = []
            props.results.forEach(skill => {
                if (array.findIndex(value => value.key === skill.examName && value.value === skill.examCode) === -1) {
                    array.push({ key: skill.examName, value: skill.examCode })
                }
            })
            setExams(array)
            setExamSelector(array)
        }
    }, [props.results])

    useEffect(() => {
        if(examCode){
            props.socket.emit('get-examCompletion', examCode)
        }

        props.socket.on('examCompletion', handleCompletion)

        return () => props.socket.off('examCompletion', handleCompletion)

    }, [examCode, props.socket, handleCompletion])

    useEffect(() => {
        const list = filterByExam(['admin', 'Adminisztrátor'].includes(props.permission))
        if (props.results) {
            setResults(list)
            setDisplayList(list)
            setWorkingList(props.results)
        } else if (props.results && examCode) {
            setResults(list)
            setDisplayList(list)
            setWorkingList(props.results.filter(skill => skill.examCode === examCode))
        }
    }, [examCode, props.results, filterByExam, props.permission])

    const handleChange = useCallback(event => {
        if (!event.target.value || event.target.value === 'Vizsga kiválasztása') {
            setExamCode(null)
        } else {
            setExamCode(event.target.value)
        }
    }, [])

    const examStatistics = useCallback(() => {
        if (examCode && workingList.length > 0) {
            return (
                <Visualizer
                    details={{ completion }}
                    time={stats.avgTime.avgMins + " p " + stats.avgTime.avgSecs + " mp"}
                    avgPoints={stats.avgScore}
                    successRate={stats.completionRate}
                    isSame={props.isSame}
                    group={props.permission}
                    isGlobal={false}
                />
            )
        } else {
            return null
        }
    }, [examCode, workingList, stats, completion, props.isSame, props.permission])

    const searchUser = useCallback(event => {
        if (['admin', 'Adminisztrátor'].includes(props.permission)) {
            if (examCode && results.length > 0) {
                const filterBySearch = results.filter(exam => exam.worker.toLowerCase().includes(event.target.value.toLowerCase().trim()))
                setDisplayList(filterBySearch)
            }
        }

    }, [examCode, props.permission, results])

    const searchExam = useCallback(event => {
        if (exams.length > 0) {
            const filterBySearch = exams.filter(exam => {
                const search = event.target.value.toLowerCase().trim()
                return exam.key.toLowerCase().includes(search) || exam.value.toLowerCase().includes(search)
            })
            setExamSelector(filterBySearch)
        }

    }, [exams])

    const conditionalRowStyles = [
        {
            when: row => row.completed === "Átment",
            style: () => ({
                backgroundColor: "#b1dfbb",
                color: "green"
            })

        },
        {
            when: row => row.completed === "Megbukott",
            style: () => ({
                backgroundColor: "#f1b0b7",
                color: "red"
            })
        }
    ]

    const customText = {
        rowsPerPageText: 'Sorok száma oldalanként:',
        rangeSeparatorText: '/',
        noRowsPerPage: false,
        selectAllRowsItem: false,
        selectAllRowsItemText: 'Összes'
    }

    createTheme("ownTheme", {
        background: {
            default: "#f8f9fa"
        }
    })

    return (
        <div className="container">
            <h1><p>{['admin', 'Adminisztrátor'].includes(props.permission) ? 'Vizsgánkénti statisztika' : 'Vizsga eredmények'}</p></h1>

            {exams.length > 0 ?
                <form className="mb-3 w-50">
                    <div className="form-group m-auto">
                        <input type="text" name="search" onChange={searchExam} autoComplete="off" required />
                        <label htmlFor="search" className="label-name">
                            <span className="content-name">
                                Vizsga keresése név, vagy cikkszám alapján
                            </span>
                        </label>
                    </div>
                </form> : null
            }

            <select onChange={handleChange} className="mb-3 rounded" id="tableselect" size='5'>
                <option value={null}>Vizsga kiválasztása</option>
                {examSelector.length > 0 ? examSelector.map((exam, index) => {
                    return <option key={index} value={exam.value}>{exam.key + " || " + exam.value}</option>
                }) : null}
            </select>

            <Admin permission={props.permission}>
                {examStatistics()}
                {examCode ?
                    <form className="mb-3 w-50">
                        <div className="form-group m-auto">
                            <input type="text" name="search" onChange={searchUser} autoComplete="off" required />
                            <label htmlFor="search" className="label-name">
                                <span className="content-name">
                                    Vizsgázó keresése
                            </span>
                            </label>
                        </div>
                    </form> : null
                }
            </Admin>

            <DataTable
                columns={columns}
                data={displayList}
                pagination={true}
                fixedHeader={true}
                noDataComponent={'Nincsenek megjeleníthető adatok.'}
                conditionalRowStyles={conditionalRowStyles}
                paginationComponentOptions={customText}
                theme="ownTheme"
            />
        </div>
    )

}