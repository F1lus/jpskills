import React from 'react'
import Exams from './Exams'
import CreateTest from './create/CreateTest'

export default function ExamWrapper(props){

    return (
        <div>
            {props.permission === 'admin' ? <CreateTest permission={props.permission}/> : null}
            <Exams permission={props.permission}/>
        </div>
    )
}