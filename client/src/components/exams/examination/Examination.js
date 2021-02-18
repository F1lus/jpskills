import React, { useEffect, useState } from 'react'
import { Redirect, useParams } from 'react-router-dom'

import RenderContent from './RenderContent'
import model from '../models/QuestionsModel'

import manager from '../../GlobalSocket'

export default function Examination() {

    const socket = new manager().socket
    const exam = useParams().examCode

    const [examProps, setExamProps] = useState([])
    const [finished, setFinished] = useState(false)
    const [questions, setQuestions] = useState([])

    useEffect(() => {
        socket.open()
        socket.emit('request-exam-content', exam)
        socket.emit('request-exam-props', exam)
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

        socket.on('exam-content', (questionList) => {
            setQuestions(model(questionList).questions)
        })

        socket.on('exam-props', examProps => {
            setExamProps(examProps)
        })
    })

    return (
        <div>
            {finished ? <Redirect to={`/exams/result/${exam}`} /> : null}
            <div>
                <h2 className='container bg-white rounded shadow py-3 mb-3'><p className="text-center">Vizsga: {examProps[0]}</p></h2>
            </div>
            <RenderContent socket={socket} list={questions} exam={exam} />
        </div>
    )
}