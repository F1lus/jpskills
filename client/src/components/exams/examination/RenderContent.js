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
                            <div key={innerIndex} className="jumbotron mb-2">
                                <RenderContent questionId={question[0]} list={content} isAnswer={true}/>
                            </div>
                        )
                    }
                })
            })}
        </ul>
    )
}