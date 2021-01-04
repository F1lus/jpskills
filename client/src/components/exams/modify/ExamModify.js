import React, {useState, useEffect} from 'react'
import {useParams} from 'react-router-dom'

import ListManager from './ListManager'

import API from '../../BackendAPI'

export default function ExamModify(){

    const [examCode,] = useState(useParams())

    const [warning, setWarning] = useState(null)
    const [examName, setExamName] = useState(null)
    const [questions, setQuestions] = useState([])

    useEffect(() => {
        API.get(`/exams/${examCode.examName}`)
            .then(result => {
                if(result){
                    if(result.data.questions){
                        let list = []
                        result.data.questions.forEach((question, index) => {
                            let answers = []
                            question.answers.forEach(answer => {
                                answers.push([answer.id, answer.text, answer.correct])
                            })
                            list.push([question.id, question.name, question.points, answers])
                        })
                        setExamName(result.data.name)
                        setQuestions(list)
                    }else{
                        setExamName(result.data.name)
                        setQuestions([])
                        setWarning('Nincsenek megjeleníthető kérdések.')
                    }
                }
            }).catch(err => console.log(err))
    },[examCode.examName])

    return (
        <div>
            <h1>{examName}</h1>

            {questions.length === 0 ? warning: <ListManager list={questions} />}

            <button>Kérdés hozzáadása</button>
        </div>
    )
}
