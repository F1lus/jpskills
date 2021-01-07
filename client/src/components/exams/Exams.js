import React, {useState, useEffect} from 'react'

import {NavLink} from 'react-router-dom'

import Axios from 'axios'
import API from '../BackendAPI'

export default function Exams(props){

    const [exams, setExams] = useState([])

    function examCheck(axiosCancel){
        API.get('/exams', {cancelToken: axiosCancel.token})
            .then(res => {
                if(!res.data.examInfo){
                    setExams([])
                }else{
                    let examList = []
                    res.data.examInfo.forEach((exam) => {
                        examList.push([exam[0], exam[1], exam[2], exam[3], exam[4]])
                    })
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
        <div className="container shadow rounded text-center p-3 mt-5 mb-3 bg-light">
            <h1><p>Elérhető vizsgák:</p></h1>
            {exams.length === 0 ? <h1>Jelenleg nem találhatóak elérhető vizsgák</h1> : exams.map((exam, index)=>{
                if(props.permission === 'admin'){
                    return(
                        <div key={index}>
                            <NavLink to={`/exams/modify/${exam[1]}`}>
                                <button className="btn btn-outline-primary m-2">
                                    {exam[0]}
                                </button>
                            </NavLink>
                            {exam[2] !== 'null' ? (
                            <div>
                                Megjegyzés: {exam[2]}
                            </div>) : null}
                            <p>Készült: {exam[4]}</p>
                        </div>
                    )
                }else{
                    return(
                        <div>
                            <NavLink key={index} to={`/exams/${exam[1]}`}>
                                <button className="btn btn-outline-primary m-2">
                                    {exam[0]}
                                </button>
                            </NavLink>
                            {exam[2] !== 'null' ? (
                            <div>
                                Megjegyzés: {exam[2]}
                            </div>) : null}
                        </div>
                    )
                }
            })}
        </div>
    )
}