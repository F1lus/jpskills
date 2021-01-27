import React, {useState} from 'react'
import {useParams} from 'react-router-dom'

import API from '../../BackendAPI'

export default function AddQuestion(props){

    const examCode = useParams().examName

    const [question, setQuestion] = useState(null)
    const [points, setPoints] = useState(null)
    const [pic, setPic] = useState(null)

    function handleChange(event){
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
    }

    function handleSubmit(event){
        event.preventDefault()
        if(question && points){
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
                    props.socket.emit('exam-modified')
                }
            }).catch(err => console.log(err))
        }
    }

    return (
        <div className="container text-center rounded">
           { props.display ? 
                <form onSubmit={handleSubmit}>
                    <div className="form-group m-auto mb-3">
                        <input type='text' name='question' value={question || ''} onChange={handleChange} required/>
                        <label htmlFor="question" className="label-name">
                            <span className="content-name">
                                A kérdés szövege
                            </span>
                        </label>
                    </div>

                    <div className="form-group m-auto">
                        <input type='number' name='points' value={points || ''} onChange={handleChange} required/>
                        <label htmlFor="points" className="label-name">
                            <span className="content-name">
                                Pontszám
                            </span>
                        </label>
                    </div>

                    <input type="file" name='pic' onChange={handleChange} />

                    <div className="container text-center">
                        <button className="btn btn-warning my-3">Feltöltés</button>
                    </div>
                </form>
            : null} 
        </div>
    )
}