import React, {useEffect, useState} from 'react'

export default function RenderContent(props){

    const questionId = props.questionId
    const list = props.list
    const isAnswer = props.isAnswer

    function createImage(picture){
        const arrayBufferView = new Uint8Array(picture)
        const blob = new Blob([arrayBufferView], {type: 'image/jpeg'}) 
        const urlCreator = window.URL || window.webkitURL

        return urlCreator.createObjectURL(blob)
    }

    return (
        <ul>
            {list.map((question, index) => {
                return question.map((content, innerIndex) => {
                    if(innerIndex === 1){
                        return <li key={innerIndex}><b><span>{index+1}. </span></b> {content} ({question[2]} pont)</li>
                    }else if(innerIndex === 3 && !isAnswer && content != null){
                        return (
                            <li key={innerIndex}>
                                <img className='img-fluid' src={createImage(content)} alt=''/>
                            </li>
                        )
                    }else if(innerIndex === 4){
                        return (
                            <li key={innerIndex} className="my-3">
                               {content.map((text, index) => {
                                   return(
                                    <div className="container" key={index}>
                                        <input type="checkbox" name={index}/>
                                        <label htmlFor={index} className="pl-1"> {text[1]}</label>
                                    </div>
                                   )
                               })}
                            </li>
                        )
                    }
                })
            })}
        </ul>
    )
}