import React, { useState, useEffect, useCallback, useContext, useRef } from 'react'
import { NavLink, useParams } from 'react-router-dom'
import { useStore } from 'react-redux'

import { SocketContext } from '../../GlobalSocket'
import { setLoad } from '../../store/ActionHandler'

import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist/es5/build/pdf'

import worker from 'pdfjs-dist/build/pdf.worker.entry'


export default function ExamDocument(props) {

    GlobalWorkerOptions.workerSrc = worker

    const exam = useParams()
    const socket = useContext(SocketContext)
    const canvasRef = useRef()
    const store = useStore()

    const [examDoc, setExamDoc] = useState(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [maxPages, setMaxPages] = useState(1)

    const renderPdf = useCallback(async () => {
        const page = await examDoc.getPage(currentPage)

        const viewport = page.getViewport({scale: 0.7})

        const canvas = canvasRef.current
        canvas.height = viewport.height
        canvas.width = viewport.width

        page.render({
            canvasContext: canvas.getContext('2d'),
            viewport: viewport
        })

    }, [examDoc, currentPage])

    const nextPage = useCallback(e => {
        if(currentPage < maxPages){
            setCurrentPage(page => ++page)
        }
    }, [currentPage, maxPages])

    const prevPage = useCallback(e => {
        if(currentPage > 1){
            setCurrentPage(page => --page)
        }
    }, [currentPage])

    const handleExamDoc = useCallback(async (status, document) => {
        const loadingTask = getDocument(document)
        const pdf = await loadingTask.promise

        setExamDoc(pdf)
        setMaxPages(pdf.numPages)
        setLoad(store, false)

    }, [store])

    useEffect(() => {
        setLoad(store, true)
        socket.emit('examDoc-signal', exam.examCode)

        socket.on('examDoc-emitter', handleExamDoc)

        return () => socket.off('examDoc-emitter', handleExamDoc)
    }, [exam.examCode, socket, handleExamDoc, store])

    useEffect(() => {
        if(examDoc){
            renderPdf()
        }
    }, [examDoc, renderPdf, currentPage])

    return (
        <div className="container text-center bg-light rounded shadow page mt-3">
            <canvas ref={canvasRef}></canvas>
            <br/>
            <button onClick={prevPage}>Hátra</button>
            <NavLink to='/profile'><button>Vissza</button></NavLink>
            <button onClick={nextPage}>Előre</button>
        </div>
    );
}