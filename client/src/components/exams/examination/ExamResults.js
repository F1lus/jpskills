import React, {useState, useEffect} from 'react'
import {useParams, Redirect} from 'react-router-dom'

import manager from '../../GlobalSocket'

export default function ExamResults(){
    
    const exam = useParams().examCode
    const socket = new manager().socket

    const [results, setResults] = useState([])

    useEffect(() => {
        socket.emit('request-results', exam)

        
    })
}