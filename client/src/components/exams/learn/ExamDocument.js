import React, { useState, useEffect, useCallback, useContext, useRef } from 'react'
import { NavLink, useParams } from 'react-router-dom'
import { useStore } from 'react-redux'

import { SocketContext } from '../../GlobalSocket'
import { setLoad } from '../../store/ActionHandler'

import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist/es5/build/pdf'

import worker from 'pdfjs-dist/es5/build/pdf.worker.entry'


export default function ExamDocument() {

    GlobalWorkerOptions.workerSrc = worker

    const exam = useParams()
    const socket = useContext(SocketContext)
    const canvasRef = useRef()
    const store = useStore()

    const [cardnum, setCardnum] = useState(null)
    const [examDoc, setExamDoc] = useState(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [maxPages, setMaxPages] = useState(1)

    const handleCardnum = useCallback(cardnum => setCardnum(cardnum), [])

    const renderPdf = useCallback(async () => {
        const page = await examDoc.getPage(currentPage)

        const viewport = page.getViewport({ scale: 1 })

        const canvas = canvasRef.current
        canvas.height = viewport.height
        canvas.width = viewport.width

        page.render({
            canvasContext: canvas.getContext('2d'),
            viewport: viewport
        })

        setLoad(store, false)

    }, [examDoc, currentPage, store])

    const nextPage = useCallback(e => {
        if (currentPage < maxPages) {
            setCurrentPage(page => ++page)
        }
    }, [currentPage, maxPages])

    const prevPage = useCallback(e => {
        if (currentPage > 1) {
            setCurrentPage(page => --page)
        }
    }, [currentPage])

    const handleExamDoc = useCallback(async (status, document) => {
        const loadingTask = getDocument(document)
        const pdf = await loadingTask.promise

        setExamDoc(pdf)
        setMaxPages(pdf.numPages)

    }, [])

    useEffect(() => {
        setLoad(store, true)
        socket.emit('examDoc-signal', exam.examCode)
        socket.emit('req-cardnum')

        socket.on('examDoc-emitter', handleExamDoc)
        socket.on('res-cardnum', handleCardnum)

        return () => {
            socket.off('examDoc-emitter', handleExamDoc)
            socket.off('res-cardnum', handleCardnum)
        }
    }, [exam.examCode, socket, handleExamDoc, handleCardnum, store])

    useEffect(() => {
        if (examDoc) {
            renderPdf()
        }
    }, [examDoc, renderPdf, currentPage])

    return (
        <div className="container text-center bg-light rounded shadow page mt-3">
            <div className='py-2'>
                <canvas ref={canvasRef}></canvas>
                <br />
                <h5>{`${currentPage} / ${maxPages}`}</h5>
                <button className='btn btn-outline-primary' onClick={prevPage}>Hátra</button>
                <NavLink to={`/profile/${cardnum}`}><button className='btn btn-outline-danger mx-4'>Befejezés</button></NavLink>
                <button className='btn btn-outline-primary' onClick={nextPage}>Előre</button>
            </div>
        </div>
    );
}