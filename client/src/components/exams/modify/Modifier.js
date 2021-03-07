import React, { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'

export default function Modifier(props) {

    const param = useParams()

    const [type, setType] = useState(null)
    const [index,] = useState(props.index)
    const [value, setValue] = useState(props.value || false)
    const [isAnswer,] = useState(props.isAnswer || false)
    const [disableButton, setDisableButton] = useState(props.disable || false)

    useEffect(() => {
        let valueType = typeof props.value
        if (valueType === 'number' || valueType === 'bigint') {
            setType('number')
        } else if (valueType === 'boolean') {
            setType('bool')
        } else if (valueType === 'string') {
            setType('text')
        }
    }, [props.value, index])

    const handleChange = useCallback(event => {
        if (event.target.value === 'Állapotváltás...') {
            return
        }
        setValue(event.target.value)
    }, [])

    const handleSubmit = useCallback(event => {
        event.preventDefault()
        try {
            if (index && value) {
                setDisableButton(true)
                if (!isAnswer) {
                    props.socket.emit('update-question', {
                        examCode: param.examName,
                        questionId: index,
                        value: value
                    })
                } else {
                    props.socket.emit('update-answer', {
                        examCode: param.examName,
                        answerId: index,
                        value: value
                    })
                }
            }
        } catch (error) {
            setDisableButton(false)
            console.log(error.message)
        }
    }, [index, isAnswer, param.examName, props.socket, value])

    const renderInput = useCallback(() => {
        if (type === 'number' || type === 'text') {
            return (
                <form onSubmit={handleSubmit}>
                    <div className="form-group m-auto">
                        <input name='modify' type={type || 'text'} value={value || ''} onChange={handleChange} required autoComplete="off" />
                        <label htmlFor="modify" className="label-name">
                            <span className="content-name">
                                {type === 'number' ? "Helyes válaszonként adható egész pontszám" : "A szöveg megadása"}
                            </span>
                        </label>
                    </div>
                    <button disabled={disableButton} className="btn btn-warning m-2">Módosítás!</button>
                </form>)
        } else if (type === 'bool') {
            return (
                <form onSubmit={handleSubmit}>
                    <select name='modify' className="rounded pl-3 w-25" onChange={handleChange}>
                        <option value={null}>Állapotváltás...</option>
                        <option value={1}>Helyes</option>
                        <option value={0}>Helytelen</option>
                    </select>
                    <button disabled={disableButton} className="btn btn-warning m-2">Módosítás!</button>
                </form>
            )
        }
    }, [disableButton, handleChange, handleSubmit, type, value])

    return (
        <div>
            {renderInput()}
        </div>)
}