import React, { useState, useEffect } from 'react'

import examStats from './models/ExamStatistics'

export default function ResultTable(props) {

    const [exams, setExams] = useState([])
    const [examCode, setExamCode] = useState(null)
    const [results, setResults] = useState([])

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
            let filteredArray = props.results.filter(skill => skill.examCode === examCode)
            filteredArray.sort((a, b) => b.score - a.score)
            setResults(filteredArray)
        } else {
            setResults([])
        }
    }, [examCode, props.results])

    function handleChange(event) {
        if (!event.target.value || event.target.value === 'Vizsga kiválasztása') {
            setExamCode(null)
        } else {
            setExamCode(event.target.value)
        }
    }

    function examStatistics() {
        if (examCode && props.permission === 'admin' && results.length > 0) {
            const stats = examStats(results)
            return (
                <div>
                    <p>Átlagos teljesítési idő: {stats.avgTime.avgMins + " perc " + stats.avgTime.avgSecs + " másodperc"}</p>
                    <p>Átlagosan elért pontszám: {stats.avgScore}</p>
                    <p>Sikerességi arány: {stats.completionRate + "%"}</p>
                </div>
            )
        }
    }

    function renderRows() {
        return results.map((result, index) => {
            const timeFormat = (result.time % 60).toString().length < 2 ?
                Math.floor(result.time / 60) + ":0" + (result.time % 60).toString()
                : Math.floor(result.time / 60) + ":" + (result.time % 60).toString()
            return (
                <tr key={index} className={result.completed ? "table-success" : "table-danger"}>
                    <td>{result.worker || props.user}</td>
                    <td>{result.score}</td>
                    <td>{timeFormat}</td>
                    <td>{result.completed ? 'Átment' : 'Megbukott'}</td>
                </tr>
            )
        })
    }

    return (
        <div className="container text-center">
            <br />
            <h1><p>Vizsgánkénti statisztika</p></h1>

            <select onChange={handleChange} className="mb-3" id="tableselect">
                <option value={null}>Vizsga kiválasztása</option>
                {exams.length > 0 ? exams.map((exam, index) => {
                    return <option key={index} value={exam.value}>{exam.key}{props.permission === 'admin' ? " || " + exam.value : null}</option>
                }) : null}
            </select>

            {results.length > 0 ?
                <div>
                    {examStatistics()}
                    <table className="table table-hover">
                        <thead>
                            <tr>
                                <th>Vizsgázó neve</th>
                                <th>Pontszám</th>
                                <th>Idő</th>
                                <th>Eredmény</th>
                            </tr>
                        </thead>

                        <tbody>
                            {renderRows()}
                        </tbody>
                    </table>
                </div> : null
            }
            <br />
        </div>
    )
}