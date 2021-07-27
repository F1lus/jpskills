import React, { useCallback, useEffect, useState } from 'react'

export default function ModifyProps(props) {

    const socket = props.socket
    const examCode = props.exam
    const maxPoints = props.points

    const [examProps, setExamProps] = useState([])
    const [status, setStatus] = useState(null)
    const [disable, setDisable] = useState(false)
    const [toggle, setToggle] = useState(0)

    const handleProps = useCallback(examProps => {
        setExamProps([examProps[0], examProps[1] === 'null' ? '' : examProps[1], examProps[2], examProps[3] * 100])

        setStatus(examProps[2])
    }, [])

    const handleUpdate = useCallback(updated => setDisable(false), [])

    useEffect(() => {
        socket.on('exam-props', handleProps)
        socket.on('updated', handleUpdate)

        

        return () => {
            socket.off('exam-props', handleProps)
            socket.off('updated', handleUpdate)
        }
    })

    const handleChange = useCallback(event => {
        const list = examProps.slice()
        switch (event.target.name) {
            case 'examName':
                if (list[0].length < 100) {
                    list[0] = event.target.value
                    setExamProps(list)
                }
                break
            case 'examNotes':
                if (list[1].length < 200) {
                    list[1] = event.target.value
                    setExamProps(list)
                }
                break
            case 'examMinPoints':
                if (event.target.value > 100) {
                    list[3] = 100
                } else if (event.target.value < 0) {
                    list[3] = 0
                } else {
                    list[3] = event.target.value
                }
                setExamProps(list)
                break
            default:
                break
        }
    }, [examProps])

    const statusChange = useCallback(event => {
        event.preventDefault()
        setDisable(true)

        socket.emit('update-status', { examCode: examCode.examName, status: examProps[2] })

    }, [examCode.examName, examProps, socket])

    const handleSubmit = useCallback(event => {
        event.preventDefault()
        setDisable(true)

        if (examProps != null) {
            socket.emit('update-exam-props',
                {
                    examCode: examCode.examName,
                    examName: examProps[0],
                    notes: examProps[1],
                    points: (examProps[3] / 100)
                })
        }
    }, [examCode.examName, examProps, socket])

    const handleClick = useCallback(event => {
        event.target.classList.toggle("active")

        statusChange(event)
    },[statusChange])

    useEffect(() => {
        const switcher = document.getElementById("toggle")
        const propsCopy = examProps

        switcher.classList.contains("active") ? setToggle(0) : setToggle(1)
        
        propsCopy[2] = toggle

        setExamProps(propsCopy)

    }, [examProps, toggle, status])

    return (
        <div className="container text-center rounded w-75 mb-3 p-3 shadow bg-light">
            <h3><p>A vizsga jellemzői:</p></h3>

            <form onSubmit={handleSubmit}>
                <div className="form-group m-auto">
                    <input type='text' name='examName' value={examProps[0] || ''} onChange={handleChange} required autoComplete="off" />
                    <label htmlFor="examName" className="label-name">
                        <span className="content-name">
                            A vizsga neve
                        </span>
                    </label>
                </div>

                <div className="form-group m-auto">
                    <input type='text' name='examNotes' value={examProps[1] || ''} onChange={handleChange} autoComplete="off" />
                    <label htmlFor="examNotes" className="label-name">
                        <span className="content-name">
                            A vizsga megjegyzése (ha van)
                        </span>
                    </label>
                </div>

                <div className="form-group m-auto">
                    <input type='number' name='examMinPoints' value={examProps[3] || ''} onChange={handleChange} required />
                    <label htmlFor="examMinPoints" className="label-name">
                        <span className="content-name">
                            A vizsga elvégzéséhez szükséges százalék
                        </span>
                    </label>
                </div>
                <p>A jelenlegi maximális pontszám {maxPoints}, az elvégzéshez pedig {Math.round(maxPoints * (examProps[3] / 100))} pont szükséges</p>
                <button name='Módosítás' className="btn btn-warning m-2" disabled={disable}>Módosítás!</button>
            </form>
            <hr />
            <p>A vizsga jelenleg {status ?
                <span className="text-success">Aktív</span> : <span className="text-danger">Inaktív</span>
            }</p>
            <div className={status ? "container mx-auto mb-3 active" : "container mx-auto mb-3"} id="toggle" onClick={handleClick}>
                <i className="indicator"></i>
            </div>
        </div>
    )
}