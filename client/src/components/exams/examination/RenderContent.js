import React, {useEffect, useState} from 'react'

export default function RenderContent(props){

    const questionId = props.questionId
    const list = props.list
    const isAnswer = props.isAnswer

    return (
        <ul>
            {list.map((question, index) => {
                return question.map((content, innerIndex) => {
                    if(innerIndex === 1){
                        return <li key={innerIndex}>{content}</li>
                    }else if(innerIndex === 3){
                        return <li key={innerIndex}></li>
                    }else if(innerIndex === 4){
                        return (
                            <div key={innerIndex} className="jumbotron mb-3">
                               {content.map((text, index) => {
                                   return(
                                    <div className="container" key={index}>
                                        <input type="checkbox" name={index}/>
                                        <label htmlFor={index} className="pl-1"> {text[1]}</label>
                                    </div>
                                   )
                               })}
                            </div>
                        )
                    }
                })
            })}
        </ul>
    )
}