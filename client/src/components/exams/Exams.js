import React, {useState, useEffect, useRef} from 'react'

import {NavLink} from 'react-router-dom'

import Axios from 'axios'
import API from '../BackendAPI'

export default function Exams(props){

    const [exams, setExams] = useState([])
    const examCheckInterval = useRef()

    function examCheck(axiosCancel){
        API.get('/exams', {cancelToken: axiosCancel.token})
            .then(res => {
                if(!res.data.names || !res.data.codes){
                    setExams([])
                }else{
                    let examList = []
                    for(let i = 0; i<res.data.names.length; i++){
                        let exam = []
                        exam.push(res.data.names[i], res.data.codes[i])
                        examList.push(exam)
                    }
                    setExams(examList) 
                }
            })
            .catch(err => console.log(err))
    }

    useEffect(() => {
        const axiosCancel = Axios.CancelToken.source()
        const id = setInterval(examCheck(axiosCancel), 10000)

        examCheckInterval.current = id

        return () => {
            axiosCancel.cancel('ComponentMount')
            clearInterval(examCheckInterval.current)
        }
    })

    return(
        <div className="container shadow rounded text-center p-3 mt-5">
            <h1><p>Elérhető vizsgák:</p></h1>
            {exams.length === 0 ? <h1>Jelenleg nem találhatóak elérhető vizsgák</h1> : exams.map((exam, index)=>{
                if(props.permission === 'admin'){
                    return(
                        <NavLink key={index} to={`/exams/modify/${exam[1]}`}>
                            <button className="btn btn-danger m-2">
                                {exam[0]}
                            </button>
                        </NavLink>
                        
                    )
                }else{
                    return(
                        <NavLink key={index} to={`/exams/${exam[1]}`}>
                            <button className="btn btn-danger m-2">
                                {exam[0]}
                            </button>
                        </NavLink>
                    )
                }
            })}
        </div>
    )
}