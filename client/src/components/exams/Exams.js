import React, {useState, useEffect} from 'react'

import {NavLink} from 'react-router-dom'

import Axios from 'axios'
import API from '../BackendAPI'

export default function Exams(props){

    const [exams, setExams] = useState([])

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
        examCheck(axiosCancel)
        return () => {
            axiosCancel.cancel('ComponentMount')
        }
    },[])

    return(
        <div className="container shadow rounded text-center p-3 mt-5 bg-light">
            <h1><p>Elérhető vizsgák:</p></h1>
            {exams.length === 0 ? <h1>Jelenleg nem találhatóak elérhető vizsgák</h1> : exams.map((exam, index)=>{
                if(props.permission === 'admin'){
                    return(
                        <NavLink key={index} to={`/exams/modify/${exam[1]}`}>
                            <button className="btn btn-outline-primary m-2">
                                {exam[0]}
                            </button>
                        </NavLink>
                        
                    )
                }else{
                    return(
                        <NavLink key={index} to={`/exams/${exam[1]}`}>
                            <button className="btn btn-outline-primary m-2">
                                {exam[0]}
                            </button>
                        </NavLink>
                    )
                }
            })}
        </div>
    )
}