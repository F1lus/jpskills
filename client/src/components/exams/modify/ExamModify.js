import React, {useState, useEffect} from 'react'
import {useParams} from 'react-router-dom'

import API from '../../BackendAPI'

export default function ExamModify(){

    const examCode = useParams()

    const [warning, setWarning] = useState(null)
    const [examName, setExamName] = useState(null)
    const [questions, setQuestions] = useState([])

    function fetchData(){
        API.get(`/exams/${examCode.examName}`)
            .then(result => {
                if(result){
                    setExamName(result.data.name)
                    setQuestions(result.data.questions)
                }
            }).catch(err => console.log(err))
    }

    function renderQuestions(){
        return questions.map((question, index) => {
            return <div key={index}>
                <h3>{question.name}</h3>
                <ul>
                    <li>Azonosító: {question.id}</li>
                    <li>Pontszám: {question.points}</li>
                    <li>A kérdéshez tartozó válaszok</li>
                    <li>{question.answers.map((answer, index) => {
                        return <ul key={index}>
                            <li>Kérdés azonosító: {answer.id}</li>
                            <li>{answer.text}</li>
                            <li>{answer.correct ? "Helyes" : "Nem helyes"}</li>
                        </ul>
                    })}</li>
                </ul>
            </div>
        })
    }

    useEffect(() => {
        setTimeout(fetchData())
    },[])

    return (
        <div>
            <h1>{examName}</h1>
            
            {renderQuestions()}
        </div>
    )
}
