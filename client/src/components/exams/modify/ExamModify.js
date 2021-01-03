import React, {useState, useEffect} from 'react'
import {useParams} from 'react-router-dom'

import API from '../../BackendAPI'

export default function ExamModify(){

    // eslint-disable-next-line
    const [examCode, setExamCode] = useState(useParams())

    const [warning, setWarning] = useState(null)
    const [examName, setExamName] = useState(null)
    const [questions, setQuestions] = useState([])
    const [modifyIndex, setModifyIndex] = useState(null)

    function renderQuestions(){
        return questions.map((question, qIndex) => {
            if(modifyIndex && modifyIndex === qIndex){
                return <form key={qIndex}>
                    <input type='number' name='id' value={modifyIndex} disabled={true} />
                    <input type='text' name='name' value={question.name} />
                    <input type='number' name='points' value={question.points} />
                    {renderAnswers(question.answers, qIndex)}
                </form>
            }else{
                return <div key={qIndex}>
                    <h3>{question.name}</h3>
                    <ul>
                        <li>Azonosító: {question.id}</li>
                        <li>Pontszám: {question.points}</li>
                        <li>A kérdéshez tartozó válaszok</li>
                        <li>{renderAnswers(question.answers, qIndex)}</li>
                    </ul>
                    <form onSubmit={e => {
                        e.preventDefault()
                        setModifyIndex(qIndex) 
                    }}>
                        <button>Kérdés módosítása</button>
                    </form>
                    <button>Kérdés törlése</button>
                </div>
            }
        })
    }

    function renderAnswers(answers, qIndex){
        if(answers.length !== 0){
            return answers.map((answer, aIndex) => {
                if(modifyIndex && modifyIndex === qIndex){
                    console.log('h')
                    return <div key={aIndex}>
                        <input type='number' name='answerId' value={answer.id} disabled={true} />
                        <input type='text' name='answerText' value={answer.text} />
                        <input type='text' name='correct' value={answer.correct} />
                    </div>
                }else{
                    return <div key={aIndex}>
                        <ul>
                            <li>Válasz azonosító: {answer.id}</li>
                            <li>{answer.text}</li>
                            <li>{answer.correct ? "Helyes" : "Nem helyes"}</li>
                        </ul>
                        <button>Válasz törlése</button>
                    </div>
                }
            })
        }else{
            return <button>Válasz hozzáadása</button>
        }
    }

    useEffect(() => {
        API.get(`/exams/${examCode.examName}`)
            .then(result => {
                if(result){
                    setExamName(result.data.name)
                    if(result.data.questions){
                        setQuestions(result.data.questions)
                    }else{
                        setWarning('Nincsenek megjeleníthető kérdések.')
                    }
                }
            }).catch(err => console.log(err))
    }, [])

    return (
        <div>
            <h1>{examName}</h1>
            
            {questions.length !== 0 ? renderQuestions() : <p>{warning}</p>}

            <button>Kérdés hozzáadása</button>
        </div>
    )
}
