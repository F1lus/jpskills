import React, {useState, useEffect} from 'react'
import {useParams, Redirect} from 'react-router-dom'

import ListManager from './ListManager'
import AddQuestion from './AddQuestion'
import Qmodel from '../models/QuestionsModel'

import manager from '../../GlobalSocket'
import API from '../../BackendAPI'

export default function ExamModify(){

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
            setQuestions([])
            
            const questionsModel = Qmodel(questionList)

            if(questionsModel.questions.length > 0){
                setQuestions(questionsModel.questions)
            }else{
                setWarning('Nincsenek megjeleníthető kérdések.')
            }
            setStatus(status)
            if(points > questionsModel.points){
                socket.emit('examPoints-mislead', examCode.examName, questionsModel.points)
            }else{
                setMaxPoints(questionsModel.points)
            }
            setExamProps([examName, notes === 'null' ? '' : notes, status, Math.round(points*100)])
        })

        return () => socket.disconnect()
        // eslint-disable-next-line
    }, [updater, examCode.examName])

    useEffect(() => {
        socket.on('server-accept', () => {
            setUpdater(count => ++count)
        })

        socket.on('removed-exam', () => {
            setRemoved(true)
        })
    })

    function handleSubmit(event){
        event.preventDefault()
        if(examProps != null){
            API.post(`/exams/modify/${examCode.examName}`, 
                {examName: examProps[0], notes: examProps[1], points: (examProps[3]/100)})
            .then(response => {
                if(response.data.updated){
                    socket.emit('exam-modified')
                }
            }).catch(err => console.log(err))
        }
    }

    function statusChange(event){
        event.preventDefault()
        if(examProps[2] != null){
            API.post(`/exams/modify/${examCode.examName}`, {status: examProps[2]})
            .then(response => {
                if(response.data.updated){
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
                if(event.target.value > 100){
                    list[3] = 100
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
        <div className="container text-center mb-3">
            {removed ? <Redirect from={`/exams/modify/${examCode.examName}`} to='/exams' /> : null}
            <div className="container text-center rounded w-75 mb-5 p-3 shadow bg-light">
                <h3><p>A vizsga jellemzői:</p></h3>

                <form onSubmit={handleSubmit}>
                    <div className="form-group m-auto">
                        <input type='text' name='examName' value={examProps[0] || ''} onChange={handleChange} required autoComplete="off"/>
                        <label htmlFor="examName" className="label-name">
                            <span className="content-name">
                                A vizsga neve
                            </span>
                        </label>
                    </div>

                    <div className="form-group m-auto">
                        <input type='text' name='examNotes' value={examProps[1] || ''} onChange={handleChange} autoComplete="off"/>
                        <label htmlFor="examNotes" className="label-name">
                            <span className="content-name">
                                A vizsga megjegyzése
                            </span>
                        </label>
                    </div>

                    <div className="form-group m-auto">
                        <input type='number' name='examMinPoints' value={examProps[3] || ''} onChange={handleChange} required/>
                        <label htmlFor="examMinPoints" className="label-name">
                            <span className="content-name">
                                A vizsga elvégzéséhez szükséges százalék
                            </span>
                        </label>
                    </div>
                    <p>A jelenlegi maximális pontszám {maxPoints}, az elvégzéshez pedig {Math.round(maxPoints*(examProps[3]/100))} pont szükséges</p>
                    <button name='Módosítás' className="btn btn-warning m-2">Módosítás!</button>
                </form>

                <form onSubmit={statusChange}>
                    <p>A vizsga jelenleg {status ? 
                        <span className="text-success">Aktív</span> : <span className="text-danger">Inaktív</span>
                    }</p>

                    <select name='examStatus' className="rounded pl-2 w-25 mb-3" onChange={handleChange}>
                        <option value={null}>Állapotváltás...</option>
                        <option value={1}>Aktív</option>
                        <option value={0}>Inaktív</option>
                    </select>
                    
                    <button name='Módosítás' className="btn btn-warning m-2">Módosítás!</button>
                </form>
            </div>

            {questions.length === 0 ? warning: <ListManager socket={socket} list={questions} />}

            <div className="container text-center rounded w-75 shadow bg-light p-3 mb-3">
                <h3><p>Általános műveletek</p></h3>

                <AddQuestion socket={socket} display={displayQuestion} />

                <button onClick={setDisplay} className="btn btn-warning m-2">{!displayQuestion ? 'Kérdés hozzáadása' : 'Mégse'}</button>
                <br/>
                <button onClick={removeExam} className="btn btn-warning m-3">A vizsga törlése</button>
            </div>
        </div>
    )
}
