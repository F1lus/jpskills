import React, {useEffect, useState} from 'react'

import API from '../../BackendAPI'

export default function ModifyProps(props){

    const socket = props.socket
    const examCode = props.exam
    const maxPoints = props.points

    const [examProps, setExamProps] = useState([])
    const [status, setStatus] = useState(null)

    useEffect(() => {
        socket.on('exam-props', examProps => {
            setExamProps([examProps[0], examProps[1], examProps[2], examProps[3]*100])
            setStatus(examProps[2])
        })
    })

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


    return (
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
    )
}