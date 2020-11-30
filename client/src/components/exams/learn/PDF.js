import React, { useState, useRef, useEffect } from 'react'
import {useParams} from 'react-router-dom'

import WebViewer from '@pdftron/webviewer'
import { XIcon } from '@primer/octicons-react'

import API from '../../BackendAPI'

export default function PDF() {

    const viewerDiv = useRef(null)
    const examCode = useParams()

    const [document, setDocument] = useState(null)

    useEffect(() => {
        WebViewer({ 
            path: '/webviewer/lib',
            initialDoc: '/base.pdf'
            },
            viewerDiv.current)
            
            .catch(err => console.log(err))
    })
    
    return (
        <div className="container text-center rounded shadow m-auto p-3" id="pdf">
                <div className="container-fluid">
                    <button className="btn btn-danger btn-block mb-3" id="close">
                        <XIcon size={24} />
                    </button>
                </div>
                <div className="webviewer container text-center rounded" ref={viewerDiv}/>
        </div>
    )
}