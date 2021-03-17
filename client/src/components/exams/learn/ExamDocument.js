import React, { useState, useEffect, useCallback, useContext } from 'react'
import { useParams } from 'react-router-dom'
import {useStore} from 'react-redux'

import { Document, Page } from 'react-pdf/dist/esm/entry.webpack'

import { SocketContext } from '../../GlobalSocket'
import {setLoad} from '../../store/ActionHandler'

import 'react-pdf/dist/esm/Page/AnnotationLayer.css';

import { ArrowLeftIcon, ArrowRightIcon } from '@primer/octicons-react';
import { NavLink } from 'react-router-dom';

export default function ExamDocument(props) {

    const exam = useParams()
    const socket = useContext(SocketContext)
    const store = useStore()

    const [examDoc, setExamDoc] = useState('/')
    const [pageNum, setPageNum] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [status, setStatus] = useState(false)


    const onDocumentLoadSuccess = useCallback(numPages => {
        setPageNum(numPages)
    }, [])

    const nextPage = useCallback(event => {
        event.preventDefault()
        if (pageNum) {
            setCurrentPage(page => {
                if (page + 1 > pageNum) {
                    return page
                } else {
                    return page + 1
                }
            })
        }
    }, [pageNum])

    const prevPage = useCallback(event => {
        event.preventDefault()
        if (pageNum) {
            setCurrentPage(page => {
                if (page - 1 < 1) {
                    return page
                } else {
                    return page - 1
                }
            })
        }
    }, [pageNum])

    const handleExamDoc = useCallback((status, document) => {
        setExamDoc(document)
        setStatus(status === 0)
        setLoad(store, false)
    }, [store])

    useEffect(() => {
        setLoad(store, true)
        socket.emit('examDoc-signal', exam.examCode)

        socket.on('examDoc-emitter', handleExamDoc)

        return () => socket.off('examDoc-emitter', handleExamDoc)
    }, [exam.examCode, socket, handleExamDoc, store])

    return (
        <div className="container text-center bg-light rounded shadow page mt-3">
            <Document
                loading='A virtuális tananyag betöltése...'
                file={{ data: examDoc }}
                onLoadSuccess={page => onDocumentLoadSuccess(page.numPages)}
                error='A virtuális tananyag betöltése nem sikerült. Kérjük próbálja újra!'
            >
                <Page pageNumber={currentPage} />
            </Document>

            <p>{currentPage} / {pageNum}</p>

            <button className="btn btn-outline-blue m-2" onClick={prevPage}>
                <i>
                    <ArrowLeftIcon />
                </i>
            </button>

            <NavLink to="/profile">
                <button className="btn btn-outline-blue m-2">
                    Vissza!
                </button>
            </NavLink>

            <NavLink to={`/exams/${exam.examCode}`}>
                <button disabled={
                    (props.permission === 'admin' ? true : status)
                } className="btn btn-outline-blue m-2">
                    Levizsgázom!
                </button>
            </NavLink>

            <button className="btn btn-outline-blue m-2" onClick={nextPage}>
                <i>
                    <ArrowRightIcon />
                </i>
            </button>
        </div>
    );
}