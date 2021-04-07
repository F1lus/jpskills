import React, { useState, useEffect, useCallback } from 'react'
import { Redirect, Prompt } from 'react-router-dom'

import { setLoad } from '../../store/ActionHandler'

export default function RenderContent(props) {

    const list = props.list
    const socket = props.socket

    const [answers, setAnswers] = useState([])
    const [disable, setDisable] = useState(false)
    const [finished, setFinished] = useState(false)

    const createImage = useCallback(picture => {
        const arrayBufferView = new Uint8Array(picture)
        const blob = new Blob([arrayBufferView], { type: 'image/jpeg' })
        const urlCreator = window.URL || window.webkitURL

        return urlCreator.createObjectURL(blob)
    }, [])

    const handleChange = useCallback((event, qId, aId) => {
        const answersCopy = answers.slice()
        if (event.target.checked) {
            const index = answersCopy.findIndex(value => value.id === qId)
            if (answersCopy[index].answers.findIndex(value => value === aId) === -1) {
                answersCopy[index].answers.push(aId)
            }
        } else {
            const index = answersCopy.findIndex(value => value.id === qId)
            if (index !== -1) {
                const answerIndex = answersCopy[index].answers.findIndex(value => value === aId)
                if (answerIndex !== -1) {
                    answersCopy[index].answers.splice(answerIndex, 1)
                }
            }
        }
        setAnswers(answersCopy)
    }, [answers])

    const handleSubmit = useCallback(event => {
        event.preventDefault()
        socket.emit('exam-finished', answers, props.exam)
        setDisable(true)
    }, [answers, props.exam, socket])

    const handleExamProcessed = useCallback(() => {
        setFinished(true)
    }, [])

    const submitExam = useCallback(() => {
        if (!disable) {
            socket.emit('exam-finished', answers, props.exam)
            setLoad(props.store, true)
        }
    }, [answers, disable, props.exam, socket, props.store])

    const warnUser = useCallback(event => {
        event.preventDefault()
        event.returnValue = 'Biztosan el akarja hagyni az oldalt? A vizsga a jelenlegi állapotában le lesz adva.'
    }, [])

    useEffect(() => {
        window.addEventListener('beforeunload', warnUser)
        window.addEventListener('unload', submitExam)

        if (disable) {
            socket.on('exam-processed', handleExamProcessed)
        }

        return () => {
            window.removeEventListener('beforeunload', warnUser)
            window.removeEventListener('unload', submitExam)

            socket.off('exam-processed', handleExamProcessed)
        }
    }, [list, disable, handleExamProcessed, socket, submitExam, warnUser])

    useEffect(() => {
        const temp = []
        list.forEach(question => {
            const answerObj = { id: question.id, answers: [] }
            temp.push(answerObj)
        })
        setAnswers(temp)
    }, [list])

    return (
        <div className="mt-2">
            {finished ? <Redirect to={`/exams/result/${props.exam}`} /> : null}
            {list.map((question, qId) => {
                return (
                    <ul key={qId} className="container bg-white rounded shadow py-3 mb-3 text-center">
                        <li className="container-fluid mb-2 mt-3">
                            <b><span>{qId + 1}. </span> {question.name} ({question.points} pont)</b>
                        </li>
                        {
                            question.pic ?
                                <li>
                                    <img className='rounded img-fluid' src={createImage(question.pic)} alt='' />
                                </li>
                                : null
                        }
                        <li>
                            {question.answers.map((text, index) => {
                                return (
                                    <div className="my-2" key={index}>
                                        <label htmlFor={index} className="checkbox-label">
                                            <input type="checkbox" className="m-2" name={index} onChange={e => { handleChange(e, question.id, text.id) }} />
                                            {text.text}
                                        </label>
                                    </div>
                                )
                            })}
                        </li>
                    </ul>)
            })}
            <div className="container text-center rounded bg-light shadow p-3 mb-2">
                <button className="btn btn-warning" onClick={handleSubmit} disabled={disable}>Leadás</button>
            </div>

            <React.Fragment>

                <Prompt message={() => {
                    const confirm = window.confirm('Biztosan el akarja hagyni az oldalt? A vizsga a jelenlegi állapotában le lesz adva, és ez a művelet visszafordíthatatlan!')
                    if (confirm) {
                        setLoad(props.store, true)
                        submitExam()
                    } else {
                        setDisable(false)
                    }
                    return confirm
                }} />

            </React.Fragment>

        </div>
    )
}