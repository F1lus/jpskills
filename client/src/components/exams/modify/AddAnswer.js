import React, { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

export default function AddAnswer(props) {

    const param = useParams()

    const [disableButton, setDisableButton] = useState(false)
    const [answer, setAnswer] = useState(null)
    const [isCorrect, setCorrect] = useState(0)


    const handleChange = useCallback(event => {
        switch (event.target.name) {
            case 'answer':
                setAnswer(event.target.value)
                break
            default:
                return
        }
    }, [])

    const handleSubmit = useCallback(event => {
        event.preventDefault()
        if (props.questionId && answer) {
            setDisableButton(true)
            props.socket.emit('insert-answer', {
                examCode: param.examName,
                questionId: props.questionId,
                answerText: answer,
                value: isCorrect
            })
            setAnswer(null)
        }
    }, [answer, isCorrect, param.examName, props.questionId, props.socket])

    const handleUpdate = useCallback(updated => setDisableButton(false), [])

    useEffect(() => {
        props.socket.on('updated', handleUpdate)

        return () => props.socket.off('updated', handleUpdate)

    }, [props.socket, handleUpdate])

    const handleClick = useCallback(event => {
        event.target.classList.toggle("active")
        event.target.classList.contains("active") ? setCorrect(1) : setCorrect(0)
    }, [])

    return (
        <div>
            { props.display ?
                <div className="container shadow-lg w-75 mt-4 p-3 mb-2 rounded">
                    <form onSubmit={handleSubmit}>
                        <div className="form-group m-auto">
                            <input type='text' name='answer' value={answer || ''} onChange={handleChange} autoComplete="off" required />
                            <label htmlFor="answer" className="label-name">
                                <span className="content-name">
                                    A válasz szövege
                                </span>
                            </label>
                        </div>

                        {isCorrect ?
                            <span className="text-success font-weight-bold">Helyes</span> : <span className="text-danger font-weight-bold">Helytelen</span>
                        }
                        <div className={isCorrect ? "container mx-auto mb-3 active" : "container mx-auto mb-3"} id="toggle" onClick={handleClick}>
                            <i className="indicator"></i>
                        </div>
                        <button disabled={disableButton} className="btn btn-warning m-2">Hozzáadás!</button>
                    </form>
                </div>
                : null
            }
        </div>
    )
}