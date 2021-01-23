import React, { useState } from 'react'
import Modal from 'react-modal'

export default function ModalElement() {
    const [show, setShow] = useState(false)

    const open = () => setShow(true)
    const close = () => setShow(false)

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
                <h1>Modal</h1>
                <hr className="w-75"/>
                <div className="container">
                    Tartalom
                </div>
                <hr className="w-75"/>
                <button className="btn btn-warning m-2" onClick={close}>Bezár!</button>
            </Modal>
        </div>
    )
}
