import React, { useCallback, useContext, useEffect, useState } from 'react'
import { Redirect, useParams } from 'react-router-dom'
import { useStore } from 'react-redux'

import RenderContent from './RenderContent'
import model from '../models/QuestionsModel'
import { setLoad } from '../../store/ActionHandler'

import { SocketContext } from '../../GlobalSocket'

export default function Examination() {

    const socket = useContext(SocketContext)
    const exam = useParams().examCode
    const store = useStore()

    const [examProps, setExamProps] = useState([])
    const [questions, setQuestions] = useState([])

    const handleContent = useCallback(questionList => {
        setQuestions(model(questionList).questions)
        setLoad(store, false)
    }, [store])

    const handleProps = useCallback(examProps => setExamProps(examProps), [])

    useEffect(() => {
        setLoad(store, true)

        socket.emit('request-exam-content', exam)
        socket.emit('request-exam-props', exam)
        socket.emit('begin-timer')

        socket.on('exam-content', handleContent)

        socket.on('exam-props', handleProps)

        return () => {
            socket.off('exam-content', handleContent)

            socket.off('exam-props', handleProps)
        }
    }, [exam, handleContent, handleProps, socket, store])

    return (
        <div className="page mt-2">
            {examProps[2] === 0 ? <Redirect to='/exams' /> : null}
            <div className='container bg-white rounded shadow py-3 mb-2 text-center'>
                <h2>
                    <p>Vizsga: {examProps[0]}</p>
                </h2>
                <h3>
                    <p>{examProps[1] === 'null' ? null : `Megjegyzés: ${examProps[1]}`}</p>
                </h3>
            </div>
            <RenderContent socket={socket} store={store} list={questions} exam={exam} />
        </div>
    )
}