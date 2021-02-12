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
        <div className="container bg-white text-center rounded shadow">
            {redirect ? <Redirect to='/exams'/> : null}

            <h2><p>Vizsga: {result.examName}</p></h2>
            <hr/>
            <h1>Vizsgaidő: {result.time}</h1>
            <br/>
            <h2><b>A sikeres vizsga feltétele minimum {Math.floor(result.maxPoints*result.minPercent)} pont ({result.minPercent*100}%)</b></h2>
            <br/>
            <h2><b>Az Ön eredménye: <span className={result.completed ? 'text-success':'text-danger'}>
                {result.userScore}/{result.maxPoints}
            </span></b></h2>
            <hr/>
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