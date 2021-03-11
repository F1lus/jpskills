import React, {useCallback, useEffect, useState} from 'react'
import {useParams} from 'react-router-dom'

import API from '../../BackendAPI'

export default function AddQuestion(props){

    const examCode = useParams().examName

    const [question, setQuestion] = useState(null)
    const [disable, setDisable] = useState(false)
    const [points, setPoints] = useState(null)
    const [pic, setPic] = useState(null)

    const handleChange = useCallback(event => {
        switch(event.target.name){
            case 'question':
                setQuestion(event.target.value)
                break
            case 'points':
                setPoints(event.target.value)
                break
            case 'pic':
                setPic(event.target.files[0])
                break
            default:
                return
        }
    }, [])

    const handleSubmit = useCallback(event => {
        event.preventDefault()
        if(question && points){
            setDisable(true)
            const data = new FormData()
            data.append('questionName', question)
            data.append('questionPoints', points)
            data.append('picture', pic)
            
            API.post(`/exams/modify/${examCode}`, data, {headers: {'Content-Type': `multipart/form-data; boundary=${data._boundary}`}})
            .then(result => {
                if(result){
                    setQuestion(null)
                    setPoints(null)
                    setPic(null)
                    setDisable(false)
                    props.socket.emit('exam-modified')
                }
            }).catch(err => {
                console.log(err.message)
                setDisable(false)
            })
        }
    },[examCode, pic, points, props.socket, question])

    const handleUpdate = useCallback(() => setDisable(false), [])

    useEffect(() => {
        props.socket.on('server-accept', handleUpdate)

        return () => props.socket.off('server-accept', handleUpdate)
    }, [props.socket, handleUpdate])

    return (
        <div className="container text-center rounded mb-3">
           { props.display ? 
                <form onSubmit={handleSubmit}>
                    <div className="form-group m-auto mb-3">
                        <input type='text' name='question' value={question || ''} onChange={handleChange} required autoComplete="off"/>
                        <label htmlFor="question" className="label-name">
                            <span className="content-name">
                                A kérdés szövege
                            </span>
                        </label>
                    </div>

                    <div className="form-group m-auto">
                        <input type='number' name='points' value={points || ''} onChange={handleChange} required autoComplete="off"/>
                        <label htmlFor="points" className="label-name">
                            <span className="content-name">
                                Pontszám
                            </span>
                        </label>
                    </div>

                    <div className="container float-center">
                        <input type="file" name='pic' onChange={handleChange} accept="image/jpeg, image/jpg, image/png"/>
                    </div>

                    <div className="container text-center">
                        <button className="btn btn-warning my-3" disabled={disable}>Feltöltés</button>
                    </div>
                </form>
            : null} 
        </div>
    )
}