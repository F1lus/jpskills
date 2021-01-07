import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';

import { Bounce } from 'react-reveal';

import Axios from 'axios'
import API from '../../BackendAPI'

export default function Learn(props) {
    
    const [exams, setExams] = useState([])

    useEffect(() => {
        const axiosCancel = Axios.CancelToken.source()
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

        return () =>{
            axiosCancel.cancel('Unmount')
        }
    },[])

    return (
        <div className="container text-center p-3 mb-3">
            <div className="container" id="content">
                <div className="row">
                {exams.map((exam,index)=>{
                    return(
                        <Bounce left>
                        <div className="card m-2 shadow text-center" key={index}>
                            <div className="card-body">
                                <p className="card-text">{exam[0]}</p>
                                <p className="card-text">Megjegyzés: {exam[2] !== 'null' ? exam[2] : ' - '}</p>
                                <p className="card-text">Készült: {exam[4]}</p>
                                <NavLink to={`/exams/learn/${exam[1]}`}>
                                    <button type="button" className="btn btn-outline-primary">
                                        Megtanulom!
                                    </button>
                                </NavLink>
                            </div>
                        </div>
                        </Bounce>
                    )
                })}
                </div>
            </div>
        </div>
    )
    
}
