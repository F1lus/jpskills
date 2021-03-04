import React, { useState, useEffect, useContext, useCallback } from 'react'
import { useParams, Redirect } from 'react-router-dom'

import model from '../models/ResultModel'

import {SocketContext} from '../../GlobalSocket'

export default function ExamResults() {

    const exam = useParams().examCode
    const socket = useContext(SocketContext)

    const [result, setResult] = useState({})
    const [redirect, setRedirect] = useState(false)

    function handleClick(event) {
        event.preventDefault()
        setRedirect(true)
    }

    const handleExamFinalized = useCallback(skill => setResult(model(skill)), [])

    useEffect(() => {

        socket.emit('request-results', exam)

        socket.on('exam-finalized', handleExamFinalized)

        return () => socket.off('exam-finalized', handleExamFinalized)
        
    }, [exam, handleExamFinalized, socket])

    return (
        <div className="container bg-white text-center rounded shadow p-3 mt-3 page">
            {redirect ? <Redirect to='/exams' /> : null}

            <h2><p>Vizsga: {result.examName}</p></h2>
            <hr className="w-75" />
            <h1>Vizsgaidő: {result.time}</h1>
            <br />
            <h2><b>A sikeres vizsga feltétele minimum {Math.floor(result.maxPoints * result.minPercent)} pont ({result.minPercent * 100}%)</b></h2>
            <br />
            <h2><b>Az Ön eredménye: <span className={result.completed ? 'text-success' : 'text-danger'}>
                {result.userScore}/{result.maxPoints}
            </span></b></h2>
            <hr className="w-75" />
            <h1>A vizsga ezáltal {
                result.completed ?
                    <span className='text-success'>SIKERES</span>
                    :
                    <span className='text-danger'>SIKERTELEN</span>
            }</h1>

            <div className="container text-center">
                <button className="btn btn-warning m-2" onClick={handleClick}>Tovább</button>
            </div>
        </div>
    )
}