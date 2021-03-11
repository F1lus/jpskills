import React, { useState, useEffect, useContext, useCallback } from 'react'
import { useParams, Redirect } from 'react-router-dom'

import ListManager from './ListManager'
import AddQuestion from './AddQuestion'
import Qmodel from '../models/QuestionsModel'
import ModifyProps from './ModifyProps'

import { SocketContext } from '../../GlobalSocket'

export default function ExamModify() {

    const examCode = useParams()
    const socket = useContext(SocketContext)

    const [questions, setQuestions] = useState([])
    const [maxPoints, setMaxPoints] = useState(0)
    const [displayQuestion, setDisplayQuestion] = useState(false)
    const [updater, setUpdater] = useState(0)

    const [removed, setRemoved] = useState(false)

    const handleContent = useCallback(questionList => {
        setQuestions([])

        const questionsModel = Qmodel(questionList)

        if (questionsModel.questions.length > 0) {
            setQuestions(questionsModel.questions)
        }
        setMaxPoints(questionsModel.points)
    }, [])

    const handleServerAccept = useCallback(() => setUpdater(count => ++count), [])
    const handleUpdate = useCallback(updated => {
        if(updated){
            setUpdater(count => ++count)
        }
    }, [])
    const handleExamRemoved = useCallback(() => setRemoved(true), [])

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
        }
        
    }, [updater, examCode.examName, handleUpdate, handleContent, handleExamRemoved, handleServerAccept, socket])

    const setDisplay = useCallback(event => {
        event.preventDefault()
        setDisplayQuestion(display => !display)
    }, [])

    const removeExam = useCallback(event => {
        event.preventDefault()
        socket.emit('remove-test', examCode.examName)
    },[examCode.examName, socket])

    return (
        <div className="container text-center mb-3">
            <div className="alert alert-danger w-25" id="modify">asd</div>
            {removed ? <Redirect from={`/exams/modify/${examCode.examName}`} to='/exams' /> : null}
            <ModifyProps socket={socket} points={maxPoints} exam={examCode} />
            {questions.length === 0 ? null : <ListManager socket={socket} list={questions} />}

            <div className="container text-center rounded w-75 shadow bg-light p-3 mb-3">
                <h3><p>Általános műveletek</p></h3>

                <AddQuestion socket={socket} display={displayQuestion} />

                <button onClick={setDisplay} className="btn btn-primary my-1">{!displayQuestion ? 'Kérdés hozzáadása' : 'Mégse'}</button>
                <br />
                <hr/>
                <button onClick={removeExam} className="btn btn-danger m-3">A vizsga törlése</button>
            </div>
        </div>
    )
}
