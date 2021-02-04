import React, {useEffect, useState} from 'react'
import {Redirect, useParams} from 'react-router-dom'

import RenderContent from './RenderContent'

import manager from '../../GlobalSocket'

export default function Examination(){

    const socket = new manager().socket
    const exam = useParams().examCode

    const [examProps, setExamProps] = useState([])
    const [finished, setFinished] = useState(false)
    const [questions, setQuestions] = useState([])

    useEffect(() => {
        socket.emit('request-exam-content', exam)

        socket.on('exam-content', (examName, questionList, notes, status, points) => {
            setExamProps([examName, notes, status, points])
            let qList = []
            questionList.forEach(question => {
                let answers = []
                question.answers.forEach(answer => {
                    answers.push([answer.id, answer.text])
                })
                answers.sort((a, b) => a[0] - b[0])

                qList.push([question.id, question.name, question.points, question.pic, answers])
            })
            qList.sort((a, b) => a[0] - b[0])
            setQuestions(qList)
        })

        return () => socket.disconnect()

        // eslint-disable-next-line
    }, [])

    useEffect(() => {
        socket.on('exam-processed', () => {
            setFinished(true)
        })
    })

    return (
        <div className="container bg-white rounded shadow py-3 mb-3">
            {finished ? <Redirect to='/exams/:examCode/results' /> : null}
            <h2><p className="text-center">Vizsga: {examProps[0]}</p></h2>
            <RenderContent socket={socket} list={questions} exam={exam}/>
        </div>
    )
}