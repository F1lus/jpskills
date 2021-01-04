import React, {useState, useEffect} from 'react'
import {useParams} from 'react-router-dom'

import {Document, Page, pdfjs} from 'react-pdf'

import API from '../../BackendAPI'

import 'react-pdf/dist/esm/Page/AnnotationLayer.css';

export default function ExamDocument(){

    const [examDoc, setExamDoc] = useState('/')
    const [exam,] = useState(useParams())
    const [pageNum, setPageNum] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);

    pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`

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

    useEffect(() => {
        API.get(`/exams/learn/${exam.examCode}`)
        .then(result => {
            setExamDoc(result.data.document.data)
        }).catch(err => {
            console.log(err)
        })
    },[exam.examCode])

    return (
        <div>
          <Document
            file={{data: examDoc}}
            onLoadSuccess={page => onDocumentLoadSuccess(page.numPages)}
          >
            <Page pageNumber={currentPage} />
          </Document>
          <p>{currentPage} / {pageNum}</p>
          <button onClick={prevPage}>Előző oldal</button>
          <button onClick={nextPage}>Következő oldal</button>
        </div>
      );
}