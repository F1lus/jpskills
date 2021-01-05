import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';

import Axios from 'axios'
import API from '../../BackendAPI'

export default function Learn(props) {
    
    const [exams, setExams] = useState([])

    useEffect(() => {
        const axiosCancel = Axios.CancelToken.source()
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

        return () =>{
            axiosCancel.cancel('Unmount')
        }
    },[])

    return (
        <div className="container text-center p-3">
            <div className="container" id="content">
                <div className="row">
                {exams.map((exam,index)=>{
                    return(
                        <div className="card m-2 shadow text-center" key={index}>
                            <div className="card-body">
                                <p className="card-text">{exam[0]}</p>
                                <NavLink to={`/exams/learn/${exam[1]}`}>
                                    <button type="button" className="btn btn-outline-primary">
                                        Megtanulom!
                                    </button>
                                </NavLink>
                            </div>
                        </div>
                    )
                })}
                </div>
            </div>
        </div>
    )
    
}
