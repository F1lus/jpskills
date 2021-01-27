import React, {useEffect, useState} from 'react'

export default function Examination(props){

    const user = props.user
    const socket = props.socket

    const [questions, setQuestions] = useState([])
    const [maxPoints, setMaxPoints] = useState(0)
    const [points, setPoints] = useState(0)

    useEffect(() => {

    })

    return (
        <div>

        </div>
    )
}