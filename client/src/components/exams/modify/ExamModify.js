import React, {useState, useEffect} from 'react'
import {useParams, Redirect} from 'react-router-dom'

import ListManager from './ListManager'
import AddQuestion from './AddQuestion'
import Qmodel from '../models/QuestionsModel'
import ModifyProps from './ModifyProps'

import manager from '../../GlobalSocket'

export default function ExamModify(){

    const examCode = useParams()
    const socket = new manager().socket

    const [questions, setQuestions] = useState([])
    const [maxPoints, setMaxPoints] = useState(0)
    const [displayQuestion, setDisplayQuestion] = useState(false)
    const [updater, setUpdater] = useState(0)

    const [removed, setRemoved] = useState(false)

    useEffect(() => {
        socket.open()

        socket.emit('request-exam-content', examCode.examName)
        socket.emit('request-exam-props', examCode.examName)

        socket.on('exam-content', (questionList) => {
            setQuestions([])
            
            const questionsModel = Qmodel(questionList)

            if(questionsModel.questions.length > 0){
                setQuestions(questionsModel.questions)
            }
            setMaxPoints(questionsModel.points)
        })

        return () => socket.disconnect()
        // eslint-disable-next-line
    }, [updater])

    useEffect(() => {

        socket.on('server-accept', () => {
            setUpdater(count => ++count)
        })

        socket.on('removed-exam', () => {
            setRemoved(true)
        })
    })

    function setDisplay(event){
        event.preventDefault()
        setDisplayQuestion(display => !display)
    }

    function removeExam(event){
        event.preventDefault()
        socket.emit('remove-test', examCode.examName)
    }

    return (
        <div className="container text-center mb-3">
            {removed ? <Redirect from={`/exams/modify/${examCode.examName}`} to='/exams' /> : null}
            <ModifyProps socket={socket} points={maxPoints} exam={examCode}/>
            {questions.length === 0 ? null : <ListManager socket={socket} list={questions} />}

            <div className="container text-center rounded w-75 shadow bg-light p-3 mb-3">
                <h3><p>Általános műveletek</p></h3>

                <AddQuestion socket={socket} display={displayQuestion} />

                <button onClick={setDisplay} className="btn btn-warning m-2">{!displayQuestion ? 'Kérdés hozzáadása' : 'Mégse'}</button>
                <br/>
                <button onClick={removeExam} className="btn btn-warning m-3">A vizsga törlése</button>
            </div>
        </div>
    )
}
