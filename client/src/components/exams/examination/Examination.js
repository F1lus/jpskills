import React, { useCallback, useContext, useEffect, useState } from 'react'
import { Redirect, useParams } from 'react-router-dom'

import RenderContent from './RenderContent'
import model from '../models/QuestionsModel'

import { SocketContext } from '../../GlobalSocket'

export default function Examination() {

    const socket = useContext(SocketContext)
    const exam = useParams().examCode

    const [examProps, setExamProps] = useState([])
    const [questions, setQuestions] = useState([])

    const handleContent = useCallback(questionList => setQuestions(model(questionList).questions), [])

    const handleProps = useCallback(examProps => setExamProps(examProps), [])

    useEffect(() => {
        socket.emit('request-exam-content', exam)
        socket.emit('request-exam-props', exam)
        socket.emit('begin-timer')

        socket.on('exam-content', handleContent)

        socket.on('exam-props', handleProps)

        return () => {
            socket.off('exam-content', handleContent)

            socket.off('exam-props', handleProps)
        }
    }, [exam, handleContent, handleProps, socket])

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