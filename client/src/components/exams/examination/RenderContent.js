import React, { useState, useEffect } from 'react'
import { Redirect, Prompt } from 'react-router-dom'

export default function RenderContent(props) {

    const list = props.list
    const socket = props.socket

    const [answers, setAnswers] = useState([])
    const [disable, setDisable] = useState(false)
    const [finished, setFinished] = useState(false)

    function createImage(picture) {
        const arrayBufferView = new Uint8Array(picture)
        const blob = new Blob([arrayBufferView], { type: 'image/jpeg' })
        const urlCreator = window.URL || window.webkitURL

        return urlCreator.createObjectURL(blob)
    }

    function handleChange(event, qId, aId) {
        const answersCopy = answers.slice()
        if (event.target.checked) {
            const index = answersCopy.findIndex(value => value.id === qId)
            if (answersCopy[index].answers.findIndex(value => value === aId) === -1) {
                answersCopy[index].answers.push(aId)
            }
        } else {
            const index = answersCopy.findIndex(value => value.id === qId)
            if (index !== -1) {
                const answerIndex = answersCopy[index].answers.findIndex(value => value === aId)
                if (answerIndex !== -1) {
                    answersCopy[index].answers.splice(answerIndex, 1)
                }
            }
        }
        setAnswers(answersCopy)
    }

    function handleSubmit(event) {
        event.preventDefault()
        socket.emit('exam-finished', answers, props.exam)
        setDisable(true)
    }

    useEffect(() => {
        const temp = []
        list.forEach(question => {
            const answerObj = { id: question[0], answers: [] }
            temp.push(answerObj)
        })
        setAnswers(temp)
        // eslint-disable-next-line
    }, [list])

    useEffect(() => {
        window.addEventListener('beforeunload', warnUser)
        window.addEventListener('unload', submitExam)

        if(disable){
            socket.on('exam-processed', () => {
                setFinished(true)
            })
        }

        return () => {
            window.removeEventListener('beforeunload', warnUser)
            window.removeEventListener('unload', submitExam)
        }
    })

    const warnUser = (event) => {
        event.preventDefault()
        event.returnValue = 'Biztosan el akarja hagyni az oldalt? A vizsga a jelenlegi állapotában le lesz adva.'
    }

    const submitExam = () => {
        if(!disable){
            socket.emit('exam-finished', answers, props.exam)
        }
    }

    return (
        <div>
            {finished ? <Redirect to={`/exams/result/${props.exam}`} /> : null}
            {list.map((question, qId) => {
                return <ul key={qId} className="container bg-white rounded shadow py-3 mb-3 text-center">
                    {question.map((content, innerIndex) => {
                        if (innerIndex === 1) {
                            return (
                                <li key={innerIndex} className="container-fluid mb-2 mt-3">
                                    <b><span>{qId + 1}. </span> {content} ({question[2]} pont)</b>
                                </li>)
                        } else if (innerIndex === 3 && content != null) {
                            return (
                                <li key={innerIndex}>
                                    <img className='rounded img-fluid' src={createImage(content)} alt='' />
                                </li>
                            )
                        } else if (innerIndex === 4) {
                            return (
                                <li key={innerIndex}>
                                    {content.map((text, index) => {
                                        return (
                                            <div className="my-2" key={index}>
                                                <label htmlFor={index} className="checkbox-label"> 
                                                    <input type="checkbox" className="m-2" name={index} onChange={e => {handleChange(e, question[0], text[0])}} />
                                                    {text[1]}
                                                </label>
                                            </div>
                                        )
                                    })}
                                </li>
                            )
                        } else {
                            return null
                        }
                    })}</ul>
            })}
            <div className="container text-center rounded bg-light shadow p-3">
                <button className="btn btn-warning" onClick={handleSubmit} disabled={disable}>Leadás</button>
            </div>

            <React.Fragment>

                <Prompt message={() => {
                    const confirm = window.confirm('Biztosan el akarja hagyni az oldalt? A vizsga a jelenlegi állapotában le lesz adva, és ez a művelet visszafordíthatatlan!')
                    if (confirm) {
                        submitExam()
                    }else{
                        setDisable(false)
                    }
                    return confirm
                }}/>
                
            </React.Fragment>
            
        </div>
    )
}