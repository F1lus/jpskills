import React, { useState, useEffect } from 'react'
import Modal from 'react-modal'
import {Document, Page, pdfjs} from 'react-pdf'

import manager from '../../GlobalSocket'

import 'react-pdf/dist/esm/Page/AnnotationLayer.css';

import { ArrowLeftIcon, ArrowRightIcon } from '@primer/octicons-react';

Modal.setAppElement('#root')
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`

export default function ModalElement(props) {

    const socket = new manager().socket
    const exam = props.exam

    const [show, setShow] = useState(false)
    const [doc, setDoc] = useState(null)
    const [pageNum, setPageNum] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [newDoc, setNewDoc] = useState(null)
    const [forceUpdate, setForceUpdate] = useState(1)

    const open = () => setShow(true)
    const close = () => setShow(false)


    useEffect(() => {

        socket.emit('examDoc-signal', exam)

        socket.on('examDoc-emitter', document => {
            if(document){
                setDoc(document)
            }
        })

        return () => {
            socket.off()
            socket.close()
        }
        // eslint-disable-next-line
    }, [])

    function onDocumentLoadSuccess(numPages) {
        setPageNum(numPages)
    }

    function nextPage(event){
        event.preventDefault()
        if(pageNum){
            setCurrentPage(page => {
                if(page+1 > pageNum){
                    return page
                }else{
                    return page+1
                }
            })
        }
    }
    function prevPage(event){
        event.preventDefault()
        if(pageNum){
            setCurrentPage(page => {
                if(page-1 < 1){
                    return page
                }else{
                    return page-1
                }
            })
        }
    }

    function handleChange(event){
        setNewDoc(event.target.files[0])
    }

    function handleSubmit(event){
        event.preventDefault()
        if(newDoc){
            
        }
    }

    return (
        <div className="container">
            <button className="btn btn-warning m-3" onClick={open}>
                PDF módosítás
            </button>

            <Modal isOpen={show} onRequestClose={close}
            style={
                {
                    overlay: {
                        marginTop: "30px",
                        backgroundColor: "rgba(0,0,0,0.3)",
                        backdropFilter: "blur(6px)"
                    },
                    content: {
                        textAlign: "center"
                    }
                }
            }>
                <div>
                    <h1>A vizsgához tartozó tananyag</h1>
                    <hr className="w-75"/>
                    <div className="container">
                        
                        <div>
                            <Document
                                loading='A virtuális dokumentum betöltése...'
                                file={{data: doc}}
                                onLoadSuccess={page => onDocumentLoadSuccess(page.numPages)}
                            >
                                <Page scale={0.5} pageNumber={currentPage} />
                            </Document>
                            <p>{currentPage} / {pageNum}</p>

                            <button className="btn btn-outline-primary m-2" onClick={prevPage}>
                                <i>
                                    <ArrowLeftIcon/>
                                </i>
                            </button>

                            <button className="btn btn-outline-primary m-2" onClick={nextPage}>
                                <i>
                                    <ArrowRightIcon/>
                                </i>
                            </button>
                        </div>
                    
                        <form onSubmit={handleSubmit}>
                            <div className="container">
                                <input type="file" onChange={handleChange} name="examDoc"/>
                            </div>
                            <div className="container text-center">
                                <button type="submit" className="btn btn-warning mt-3" value="Létrehozás">Feltöltés!</button>
                            </div>
                        </form>
                    </div>
                    <hr className="w-75"/>
                    <button className="btn btn-warning m-2" onClick={close}>Bezár!</button>
                </div>
            </Modal>
        </div>
    )
}
