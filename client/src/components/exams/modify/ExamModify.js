import React, {useState, useEffect} from 'react'
import {useParams} from 'react-router-dom'

import ListManager from './ListManager'

import API from '../../BackendAPI'
import AddQuestion from './AddQuestion'

export default function ExamModify(){

    const [examCode,] = useState(useParams())

    const [warning, setWarning] = useState(null)
    const [examName, setExamName] = useState(null)
    const [questions, setQuestions] = useState([])
    const [newQuestionCount, setNewQuestionCount] = useState(0)

    useEffect(() => {
        API.get(`/exams/${examCode.examName}`)
            .then(result => {
                if(result){
                    if(result.data.questions){
                        let list = []
                        result.data.questions.forEach((question) => {
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

    function handleSubmit(event){
        event.preventDefault()
    }

    function increateCount(event){
        event.preventDefault()
        setNewQuestionCount(count => count+1)
    }

    return (
        <div className="container bg-light">
            <h3>A vizsga megnevezése:</h3>
            <form onSubmit={handleSubmit}>
                <input type='text' name='examName' 
                    value={examName || ''} placeholder={examName || ''}
                    onChange={e => setExamName(e.target.value)}
                />
                <input type='submit' name='Módosítás' />
            </form>

            <h3>A vizsgához tartozó kérdések</h3>

            {questions.length === 0 ? warning: <ListManager list={questions} />}

            <button onClick={increateCount}>Kérdés hozzáadása</button>

            <AddQuestion count={newQuestionCount} />
        </div>
    )
}
