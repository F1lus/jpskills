import React, { useEffect, useState } from 'react'
import { Redirect, useParams } from 'react-router-dom'

import RenderContent from './RenderContent'
import model from '../models/QuestionsModel'

import manager from '../../GlobalSocket'

export default function Examination() {

    const socket = new manager().socket
    const exam = useParams().examCode

    const [examProps, setExamProps] = useState([])
    const [questions, setQuestions] = useState([])

    useEffect(() => {
        socket.open()
        socket.emit('request-exam-content', exam)
        socket.emit('request-exam-props', exam)
        socket.emit('begin-timer')

        return () => {
            socket.disconnect()
        }

        // eslint-disable-next-line
    }, [])

    useEffect(() => {
        socket.on('exam-content', (questionList) => {
            setQuestions(model(questionList).questions)
        })

        socket.on('exam-props', examProps => {
            setExamProps(examProps)
        })
    })

    return (
        <div>
            {examProps[2] === 0 ? <Redirect to='/exams' /> : null}
            <div className='container bg-white rounded shadow py-3 mb-3 text-center'>
                <h2>
                    <p>Vizsga: {examProps[0]}</p>
                </h2>
                <h3>
                    <p>{examProps[1] === 'null' ? null : `Megjegyzés: ${examProps[1]}`}</p>
                </h3>
            </div>
            <RenderContent socket={socket} list={questions} exam={exam} />
        </div>
    )
}