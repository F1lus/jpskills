import React, { useState } from 'react'
import Modal from 'react-modal'

import API from '../../BackendAPI'

import 'react-pdf/dist/esm/Page/AnnotationLayer.css';

Modal.setAppElement('#root')

export default function ModifyPic(props) {

    const exam = props.exam
    const picture = props.picture
    const questionId = props.questionId

    const [show, setShow] = useState(false)
    const[img, setImg] = useState(null)
    const [alert, setAlert] = useState(null)

    const open = () => setShow(true)
    const close = () => setShow(false)

    function handleChange(event){
        setImg(event.target.files[0])
        console.log(event.target.files[0])
    }

    function handleSubmit(event){
        event.preventDefault()
        if(img){

            const data = new FormData()
            data.append('questionModifyId', questionId)
            data.append('newPic', img)

            API.post(`/exams/modify/${exam}`, data, {headers: {'Content-Type': `multipart/form-data; boundary=${data._boundary}`}})
            .then(response => {
                if(response.data.error){
                    if(response.data.error === 'invalid_mime'){
                        setAlert('A kép kiterjesztése nem megfelelő! (Szükséges: JPEG/PNG)')
                    }else if(response.data.error === 'oversize'){
                        setAlert('A kép mérete túl nagy!')
                    }
                }else if(!response.data.updated){
                    setAlert('Hiba történt a feltöltéskor, kérjük próbálja újra!')
                }else{
                    props.socket.emit('exam-modified')
                    setAlert(null)
                }
            })
        }
    }

    function createImage(){
        const arrayBufferView = new Uint8Array(picture)
        const blob = new Blob([arrayBufferView], {type: 'image/jpeg'}) 
        const urlCreator = window.URL || window.webkitURL

        return urlCreator.createObjectURL(blob)
    }

    return (
        <div className="container">
            <button className="btn btn-warning m-3" onClick={open}>
                Kép módosítása
            </button>

            <Modal isOpen={show} onRequestClose={close}
            style={
                {
                    overlay: {
                        marginTop: "30px",
                        backgroundColor: "rgba(0,0,0,0.3)",
                        backdropFilter: "blur(6px)",
                    },
                    content: {
                        textAlign: "center"
                    }
                }
            }>
                <button type="button" className="close" aria-label="Close" onClick={close}>
                    <span aria-hidden="true">&times;</span>
                </button>
                {picture == null ? 'Nincs feltöltött kép' : <img className='img-fluid' src={createImage()} alt=''/>}
                <form onSubmit={handleSubmit}>
                    <div className="container">
                        <input type="file" onChange={handleChange}/>
                    </div>
                    <div className="container text-center">
                        <button type="submit" className="btn btn-warning mt-3" value="Létrehozás">Módosítás</button>
                    </div>
                </form>

                {alert && (<h3 className="alert alert-secondary mt-3 text-center" role="alert">{alert}</h3>)}

            </Modal>
        </div>
    )
}
