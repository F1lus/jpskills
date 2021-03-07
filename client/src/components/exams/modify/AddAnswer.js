import React, { useCallback, useState } from 'react'
import { useParams } from 'react-router-dom'

export default function AddAnswer(props) {

    const param = useParams()

    const [disableButton, setDisableButton] = useState(props.disable || false)
    const [answer, setAnswer] = useState(null)
    const [isCorrect, setCorrect] = useState(1)


    const handleChange = useCallback(event => {
        switch (event.target.name) {
            case 'answer':
                setAnswer(event.target.value)
                break
            case 'value':
                setCorrect(event.target.value)
                break
            default:
                return
        }
    },[])

    const handleSubmit = useCallback(event => {
        event.preventDefault()
        if (props.questionId && answer && isCorrect) {
            setDisableButton(true)
            props.socket.emit('insert-answer', {
                examCode: param.examName,
                questionId: props.questionId,
                answerText: answer,
                value: isCorrect
            })
            setAnswer(null)
        }
    },[answer, isCorrect, param.examName, props.questionId, props.socket])

    return (
        <div>
            { props.display ?
                <div className="container shadow-lg w-75 mt-4 py-2 mb-2 rounded">
                    <form onSubmit={handleSubmit}>
                        <div className="form-group m-autot">
                            <input type='text' name='answer' value={answer || ''} onChange={handleChange} autoComplete="off" />
                            <label htmlFor="answer" className="label-name">
                                <span className="content-name">
                                    A válasz szövege
                            </span>
                            </label>
                        </div>

                        <select name='value' className="rounded pl-2 w-25" onChange={handleChange}>
                            <option value={1}>Helyes</option>
                            <option value={0}>Helytelen</option>
                        </select>
                        <br />
                        <button disabled={disableButton} className="btn btn-warning m-2">Hozzáadás!</button>
                    </form>
                </div>
                : null
            }
        </div>
    )
}