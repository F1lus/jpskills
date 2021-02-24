import React, { useState, useEffect } from 'react'

import DataTable from 'react-data-table-component'

import examStats from './models/ExamStatistics'

export default function DetailTable(props) {

    const [exams, setExams] = useState([])
    const [examCode, setExamCode] = useState(null)
    const [workingList, setWorkingList] = useState([])
    const [results, setResults] = useState([])
    const [displayList, setDisplayList] = useState([])

    const columns = [
        {
            name: "Vizsgázó neve",
            selector: row => row.worker,
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

    function filterByExam() {
        let filteredArray = []
        if (props.results && examCode) {
            props.results.forEach((value, index) => {
                if (value.examCode === examCode) {
                    const timeFormat = (value.time % 60).toString().length < 2 ?
                        Math.floor(value.time / 60) + ":0" + (value.time % 60).toString()
                        : Math.floor(value.time / 60) + ":" + (value.time % 60).toString()

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
        return filteredArray
    }

    useEffect(() => {
        if (props.results) {
            const array = []
            props.results.forEach(skill => {
                if (array.findIndex(value => value.key === skill.examName && value.value === skill.examCode) === -1) {
                    array.push({ key: skill.examName, value: skill.examCode })
                }
            })
            setExams(array)
        }
    }, [props.results])

    useEffect(() => {
        if (props.results && examCode) {
            const list = filterByExam()
            setResults(list)
            setDisplayList(list)
            setWorkingList(props.results.filter(skill => skill.examCode === examCode))
        } else {
            setResults([])
            setDisplayList([])
        }
        // eslint-disable-next-line
    }, [examCode, props.results])

    function handleChange(event) {
        if (!event.target.value || event.target.value === 'Vizsga kiválasztása') {
            setExamCode(null)
        } else {
            setExamCode(event.target.value)
        }
    }

    function examStatistics() {
        if (examCode && props.permission === 'admin' && workingList.length > 0) {
            const stats = examStats(workingList)
            return (
                <div>
                    <p>Átlagos teljesítési idő: {stats.avgTime.avgMins + " perc " + stats.avgTime.avgSecs + " másodperc"}</p>
                    <p>Átlagosan elért pontszám: {stats.avgScore}</p>
                    <p>Sikerességi arány: {stats.completionRate + "%"}</p>
                </div>
            )
        }
    }

    function search(event) {
        if (examCode && props.permission === 'admin' && results.length > 0) {
            const filterBySearch = results.filter(exam => exam.worker.toLowerCase().includes(event.target.value.toLowerCase().trim()) )
            setDisplayList(filterBySearch)
        }
    }

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

    const customText={ 
        rowsPerPageText: 'Sorok száma oldalanként:', 
        rangeSeparatorText: '/', 
        noRowsPerPage: false, 
        selectAllRowsItem: false, 
        selectAllRowsItemText: 'Összes' 
    }

    return (
        <div className="container">
            <h1><p>Vizsgánkénti statisztika</p></h1>

            <select onChange={handleChange} className="mb-3 rounded" id="tableselect">
                <option value={null}>Vizsga kiválasztása</option>
                {exams.length > 0 ? exams.map((exam, index) => {
                    return <option key={index} value={exam.value}>{exam.key} {props.permission === 'admin' ? " || " + exam.value : null}</option>
                }) : null}
            </select>

            {workingList.length > 0 ? examStatistics() : null}

            <form className="mb-3 w-25">
                <div className="form-group m-auto">
                    <input type="text" name="search" onChange={search} autoComplete="off" />
                    <label htmlFor="search" className="label-name">
                        <span className="content-name">
                            Vizsgázó keresése
                        </span>
                    </label>
                </div>
            </form>

            <DataTable
                columns={columns}
                data={displayList}
                pagination={true}
                fixedHeader={true}
                noDataComponent={'Nincsenek megjeleníthető adatok.'}
                conditionalRowStyles={conditionalRowStyles}
                paginationComponentOptions={customText}
            />
        </div>
    )

}