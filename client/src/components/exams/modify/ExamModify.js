import React, { useState, useEffect, useContext, useCallback, useRef } from 'react'
import { useParams, Redirect } from 'react-router-dom'

import { useStore } from 'react-redux'

import { setLoad } from '../../store/ActionHandler'

import ListManager from './ListManager'
import AddQuestion from './AddQuestion'
import Qmodel from '../models/QuestionsModel'
import ModifyProps from './ModifyProps'

import { SocketContext } from '../../GlobalSocket'

export default function ExamModify() {

    const examCode = useParams()
    const timeout = useRef()
    const socket = useContext(SocketContext)
    const store = useStore()

    const [questions, setQuestions] = useState([])
    const [maxPoints, setMaxPoints] = useState(0)
    const [displayQuestion, setDisplayQuestion] = useState(false)
    const [updater, setUpdater] = useState(0)

    const [callTimeout, setCallTimeout] = useState(false)
    const [removed, setRemoved] = useState(false)

    const handleContent = useCallback(questionList => {
        const questionsModel = Qmodel(questionList)

        setQuestions(questionsModel.questions)
        setMaxPoints(questionsModel.points)
        setLoad(store, false)
    }, [store])

    const timeoutCb = useCallback(() => {
        const modify = document.getElementById('modify')
        modify.classList.remove('alert-danger', 'alert-success')
        modify.innerHTML = null

        setCallTimeout(false)
    }, [])

    const handleServerAccept = useCallback(() => {
        setUpdater(count => ++count)
    }, [])

    const handleUpdate = useCallback(updated => {
        clearTimeout(timeout.current)
        timeoutCb()

        const modify = document.getElementById('modify')
        if (updated) {
            modify.classList.add('alert-success')
            modify.innerHTML = 'A módosítás elmentve! &#10003;'
            setUpdater(count => ++count)
        } else {
            modify.classList.add('alert-danger')
            modify.innerHTML = 'A módosítás mentése sikertelen! &#10540;'
        }
        setCallTimeout(true)
    }, [timeoutCb])

    const handleExamRemoved = useCallback(() => setRemoved(true), [])

    useEffect(() => {
        setLoad(store, true)

    }, [store])

    useEffect(() => {

        socket.emit('request-exam-content', examCode.examName)
        socket.emit('request-exam-props', examCode.examName)

        socket.on('exam-content', handleContent)

        socket.on('server-accept', handleServerAccept)
        socket.on('updated', handleUpdate)
        socket.on('removed-exam', handleExamRemoved)

        return () => {
            socket.off('exam-content', handleContent)
            socket.off('server-accept', handleServerAccept)
            socket.off('removed-exam', handleExamRemoved)
            socket.off('updated', handleUpdate)

            clearTimeout(timeout.current)
        }

    }, [updater, examCode.examName, handleUpdate, handleContent, handleExamRemoved, handleServerAccept, socket])

    useEffect(() => {
        if (callTimeout) {
            timeout.current = setTimeout(timeoutCb, 5000)
        }
    }, [callTimeout, timeoutCb])

    const setDisplay = useCallback(event => {
        event.preventDefault()
        setDisplayQuestion(display => !display)
    }, [])

    const removeExam = useCallback(event => {
        event.preventDefault()
        socket.emit('remove-test', examCode.examName)
    }, [examCode.examName, socket])

    return (
        <div className="container mt-3 text-center mb-3 page">
            <div className="alert w-25" id="modify" ></div>
            {removed ? <Redirect from={`/exams/modify/${examCode.examName}`} to='/exams' /> : null}
            <ModifyProps socket={socket} points={maxPoints} exam={examCode} />
            {questions.length === 0 ? null : <ListManager socket={socket} list={questions} />}

            <div className="container text-center rounded w-75 shadow bg-light p-3">
                <h3><p>Általános műveletek</p></h3>

                <AddQuestion socket={socket} display={displayQuestion} />

                <button onClick={setDisplay} className="btn btn-primary my-1">{!displayQuestion ? 'Kérdés hozzáadása' : 'Mégse'}</button>
                <br />
                <hr className="w-75" />
                <button onClick={removeExam} className="btn btn-danger m-3">A vizsga törlése</button>
            </div>
        </div>
    )
}
