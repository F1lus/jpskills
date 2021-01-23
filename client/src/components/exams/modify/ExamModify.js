import React, {useState, useEffect} from 'react'
import {useParams, Redirect} from 'react-router-dom'

import ListManager from './ListManager'
import ModalElement from './Modal'

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

    const [removed, setRemoved] = useState(false)

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
            setExamProps([examName, notes === 'null' ? '' : notes, status, points])
        })

        socket.on('exam-content-no-question', (examName, notes, status, points) => {
            setQuestions([])
            setWarning('Nincsenek megjeleníthető kérdések.')
            setStatus(status)
            setMaxPoints(points)
            setExamProps([examName, notes === 'null' ? '' : notes, status, points])
        })

        return () => socket.disconnect()
        // eslint-disable-next-line
    }, [updater, examCode.examName])

    useEffect(() => {
        socket.on('server-accept', () => {
            setUpdater(count => ++count)
        })

        socket.on('removed-exam', () => {
            socket.emit('get-products')
            socket.emit('exams-get-signal')
            setRemoved(true)
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

    function removeExam(event){
        event.preventDefault()
        socket.emit('remove-test', examCode.examName)
    }

    return (
        <div>
            {removed ? <Redirect from={`/exams/modify/${examCode.examName}`} to='/exams' /> : null}
            <div className="container text-center rounded w-75 mb-5 p-3 shadow bg-light">
                <h3>A vizsga jellemzői:</h3>
                <form onSubmit={handleSubmit}>

                    <div className="form-group m-auto">
                        <input type='text' name='examName' value={examProps[0] || ''} onChange={handleChange} required/>
                        <label htmlFor="examName" className="label-name">
                            <span className="content-name">
                                A vizsga neve
                            </span>
                        </label>
                    </div>

                    <div className="form-group m-auto">
                        <input type='text' name='examNotes' value={examProps[1] || ''} onChange={handleChange}/>
                        <label htmlFor="examNotes" className="label-name">
                            <span className="content-name">
                                A vizsga megjegyzése
                            </span>
                        </label>
                    </div>

                    <p>A vizsga jelenlegi állapota: {status ? 'Aktív' : 'Inaktív'}</p>

                    <select name='examStatus' className="rounded pl-2 w-25 mb-3" onChange={handleChange}>
                        <option value={null}>Állapotváltás...</option>
                        <option value={1}>Aktív</option>
                        <option value={0}>Inaktív</option>
                    </select>

                    <div className="form-group m-auto">
                        <input type='number' name='examMinPoints' value={examProps[3] || ''} onChange={handleChange} required/>
                        <label htmlFor="examMinPoints" className="label-name">
                            <span className="content-name">
                                A vizsga elvégzéséhez szükséges pontszám, de maximum {maxPoints}
                            </span>
                        </label>
                    </div>

                    <ModalElement/>

                    <button name='Módosítás' className="btn btn-warning m-2">Módosítás!</button>
                </form>
            </div>

            <div className="container text-center rounded w-75 shadow p-3 bg-light">
                <h3>A vizsgához tartozó kérdések</h3>

                {questions.length === 0 ? warning: <ListManager socket={socket} list={questions} />}

                <button onClick={setDisplay} className="btn btn-warning m-2">{!displayQuestion ? 'Kérdés hozzáadása' : 'Mégse'}</button>

                <AddQuestion socket={socket} display={displayQuestion} />

                <button onClick={removeExam} className="btn btn-warning m-3">A vizsga törlése</button>
            </div>
        </div>
    )
}
