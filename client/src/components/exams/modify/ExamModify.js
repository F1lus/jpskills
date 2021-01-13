import React, {useState, useEffect} from 'react'
import {useParams} from 'react-router-dom'

import ListManager from './ListManager'

import API from '../../BackendAPI'
import AddQuestion from './AddQuestion'

export default function ExamModify(props){

    const [examCode,] = useState(useParams())

    const [warning, setWarning] = useState(null)
    const [examProps, setExamProps] = useState([])
    const [questions, setQuestions] = useState([])
    const [maxPoints, setMaxPoints] = useState(0)
    const [displayQuestion, setDisplayQuestion] = useState(false)
    const [modifyResult, setModifyResult] = useState(null)

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
                            setMaxPoints(points => points + question.points)
                            list.push([question.id, question.name, question.points, answers])
                        })
                        setQuestions(list)
                    }else{
                        setQuestions([])
                        setWarning('Nincsenek megjeleníthető kérdések.')
                    }
                    setExamProps([result.data.name, result.data.notes, result.data.active, result.data.points])
                }
            }).catch(err => console.log(err))
    }, [examCode.examName])

    function handleSubmit(event){
        event.preventDefault()
        if(examProps != null && examProps.length === 4){
            API.post(`/exams/modify/${examCode.examName}`, 
                {examName: examProps[0], notes: examProps[1], status: examProps[2], points: examProps[3]})
            .then(response => {
                if(response){
                    setModifyResult(response.data.updated)
                }
            }).catch(err => console.log(err))
        }
    }

    function handleChange(event){
        const list = examProps.slice()
        switch(event.target.name){
            case 'examName':
                list[0] = event.target.value
                setExamProps(list)
                break
            case 'examNotes':
                list[1] = event.target.value
                setExamProps(list)
                break
            case 'examStatus':
                list[2] = (event.target.value === 'Aktív')
                setExamProps(list)
                break
            case 'examMinPoints':
                if(event.target.value > maxPoints){
                    list[3] = maxPoints
                }else if(event.target.value < 0){
                    list[3] = 0
                }else{
                    list[3] = event.target.value
                }
                setExamProps(list)
                break
            default:
                break
        }
    }

    function setDisplay(event){
        event.preventDefault()
        setDisplayQuestion(display => !display)
    }

    return (
        <div className="container bg-light">
            <h3>A vizsga jellemzői:</h3>
            <form onSubmit={handleSubmit}>
                <input type='text' name='examName' 
                    value={examProps[0] || ''} placeholder='A vizsga neve' onChange={handleChange}
                />
                <input type='text' name='examNotes' 
                    value={examProps[1] || ''} placeholder='A vizsga megjegyzése' onChange={handleChange}
                />
                <select name='examStatus' className="rounded pl-2 w-25" onChange={handleChange}>
                    <option defaultValue={examProps[2]}>{examProps[2] ? 'Aktív':'Inaktív'}</option>
                    <option value={!examProps[2]}>{!examProps[2] ? 'Aktív':'Inaktív'}</option>
                </select>
                <h5>Maximum: {maxPoints}</h5>
                <input type='number' name='examMinPoints' 
                    value={examProps[3] || ''} placeholder='A vizsga elvégzéséhez szükséges pontszám' onChange={handleChange}
                />
                <input type='submit' name='Módosítás' />
            </form>

            <h3>A vizsgához tartozó kérdések</h3>

            {questions.length === 0 ? warning: <ListManager list={questions} />}

            <button onClick={setDisplay}>{!displayQuestion ? 'Kérdés hozzáadása' : 'Mégse'}</button>

            <AddQuestion display={displayQuestion} />

            <button>A vizsga törlése</button>
        </div>
    )
}
