import React, {useEffect, useState} from 'react'
import {Redirect, useParams} from 'react-router-dom'

import RenderContent from './RenderContent'
import model from '../models/QuestionsModel'

import manager from '../../GlobalSocket'

export default function Examination(){

    const socket = new manager().socket
    const exam = useParams().examCode

    const [examProps, setExamProps] = useState([])
    const [finished, setFinished] = useState(false)
    const [questions, setQuestions] = useState([])

    useEffect(() => {
        socket.emit('request-exam-content', exam)
        socket.emit('begin-timer')

        return () => {
            socket.emit('cancel-timer')
            socket.disconnect()
        }

        // eslint-disable-next-line
    }, [])

    useEffect(() => {
        socket.on('exam-processed', () => {
            setFinished(true)
        })

        socket.on('exam-content', (examName, questionList, notes, status, points) => {
            setExamProps([examName, notes, status, points])
            
            setQuestions(model(questionList).questions)
        })
    })

    return (
        <div className="container bg-white rounded shadow py-3 mb-3">
            {finished ? <Redirect to={`/exams/result/${exam}`} /> : null}
            <h2><p className="text-center">Vizsga: {examProps[0]}</p></h2>
            <RenderContent socket={socket} list={questions} exam={exam}/>
        </div>
    )
}