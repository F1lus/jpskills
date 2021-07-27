import React, { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'

export default function Modifier(props) {

    const param = useParams()

    const [type, setType] = useState(null)
    const [index,] = useState(props.index)
    const [value, setValue] = useState(props.value || false)
    const [isAnswer,] = useState(props.isAnswer || false)
    const [disableButton, setDisableButton] = useState(props.disable || false)
    const [toggle, setToggle] = useState(!value)

    const handleUpdate = useCallback(updated => setDisableButton(false), [])

    useEffect(() => {
        props.socket.on('updated', handleUpdate)

        let valueType = typeof props.value
        if (valueType === 'number' || valueType === 'bigint') {
            setType('number')
        } else if (valueType === 'boolean') {
            setType('bool')
        } else if (valueType === 'string') {
            setType('text')
        }

        return () => props.socket.off('updated', handleUpdate)

    }, [props.value, index, props.socket, handleUpdate])

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
                        type: type,
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
    }, [index, isAnswer, param.examName, props.socket, value, type])

    const handleClick = useCallback(event => {
        event.target.classList.toggle("active")

        index && event.target.classList.contains("active") ? setToggle(false) : setToggle(true)

        props.socket.emit('update-answer', {
            examCode: param.examName,
            answerId: index,
            value: toggle
        })

        console.log(index,toggle)
    }, [index, toggle, props.socket, param.examName])

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
                <div className={value ? "container mx-auto mb-3 active" : "container mx-auto mb-3"} id="toggle" onClick={handleClick}>
                    <i className="indicator"></i>
                </div>
            )
        }
    }, [disableButton, handleChange, handleSubmit, handleClick, type, value])

    return (
        <div>
            {renderInput()}
        </div>)
}