import React, {useState, useEffect} from 'react'
import {useParams, Redirect} from 'react-router-dom'

import model from '../models/ResultModel'

import manager from '../../GlobalSocket'

export default function ExamResults(){
    
    const exam = useParams().examCode
    const socket = new manager().socket

    const [result, setResult] = useState({})
    const [redirect, setRedirect] = useState(false)

    function handleClick(event){
        event.preventDefault()
        setRedirect(true)
    }

    useEffect(() => {
        socket.emit('request-results', exam)

        return () => socket.disconnect()
        // eslint-disable-next-line
    }, [])

    useEffect(() => {
        socket.on('exam-finalized', skill => {
            setResult(model(skill))
        })
    })

    return (
        <div className="container bg-white text-center">
            {redirect ? <Redirect to='/exams'/> : null}

            <h2><p>Vizsga: {result.examName}</p></h2>

            <p>A teljesítés ideje: {result.time}</p>
            <p>A vizsga teljesítéséhez szükséges pontszám: {result.minPoints}</p>
            <p>Az Ön által elért pontszám: {result.userScore}</p>

            <p>A vizsga ezáltal {
                result.completed ? 
                    <span className='text-success'>SIKERES</span>
                :
                    <span className='text-danger'>SIKERTELEN</span>
            }</p>

            <button onClick={handleClick}>Tovább</button>
        </div>
    )
}