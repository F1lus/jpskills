import React, {useState, useEffect} from 'react'
import {useParams} from 'react-router-dom'

import ListManager from './ListManager'

import manager from '../../GlobalSocket'

import API from '../../BackendAPI'
import AddQuestion from './AddQuestion'

export default function ExamModify(props){

    const examCode = useParams()
    const socket = new manager().socket

    const [warning, setWarning] = useState(null)
    const [examProps, setExamProps] = useState([])
    const [status, setStatus] = useState(null)
    const [questions, setQuestions] = useState([])
    const [maxPoints, setMaxPoints] = useState(0)
    const [displayQuestion, setDisplayQuestion] = useState(false)
    const [updater, setUpdater] = useState(0)

    useEffect(() => {
        socket.emit('request-exam-content', examCode.examName)

        socket.on('exam-content', (examName, questionList, notes, status, points) => {
            let list = []
            let examPoints = 0
            questionList.forEach((question) => {
                let answers = []
                question.answers.forEach(answer => {
                    answers.push([answer.id, answer.text, answer.correct])
                })
                examPoints += question.points
                list.push([question.id, question.name, question.points, answers])
            })
            setQuestions(list)
            setStatus(status)
            setMaxPoints(examPoints)
            setExamProps([examName, notes, status, points])
        })

        socket.on('exam-content-no-question', (examName, notes, status, points) => {
            setQuestions([])
            setWarning('Nincsenek megjeleníthető kérdések.')
            setStatus(status)
            setExamProps([examName, notes, status, points])
        })

        return () => socket.disconnect()
    }, [updater])

    useEffect(() => {
        socket.on('server-accept', () => {
            setUpdater(count => ++count)
        })
    })

    function handleSubmit(event){
        event.preventDefault()
        if(examProps != null){
            API.post(`/exams/modify/${examCode.examName}`, 
                {examName: examProps[0], notes: examProps[1], status: examProps[2], points: examProps[3]})
            .then(response => {
                if(response){
                    socket.emit('exam-modified')
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
                if(event.target.value === 'Állapotváltás...'){
                    break
                }
                list[2] = event.target.value
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
                <p>A vizsga jelenlegi állapota: {status ? 'Aktív' : 'Inaktív'}</p>
                <select name='examStatus' className="rounded pl-2 w-25" onChange={handleChange}>
                    <option value={null}>Állapotváltás...</option>
                    <option value={1}>Aktív</option>
                    <option value={0}>Inaktív</option>
                </select>
                <h5>Maximum: {maxPoints}</h5>
                <input type='number' name='examMinPoints' 
                    value={examProps[3] || 0} placeholder='A vizsga elvégzéséhez szükséges pontszám' onChange={handleChange}
                />
                <input type='submit' name='Módosítás' />
            </form>

            <h3>A vizsgához tartozó kérdések</h3>

            {questions.length === 0 ? warning: <ListManager socket={socket} list={questions} />}

            <button onClick={setDisplay}>{!displayQuestion ? 'Kérdés hozzáadása' : 'Mégse'}</button>

            <AddQuestion display={displayQuestion} />

            <button>A vizsga törlése</button>
        </div>
    )
}
