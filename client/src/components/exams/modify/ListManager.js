import React, { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import AddAnswer from './AddAnswer'
import ModifyPic from './ModifyPic'
import Modifier from './Modifier'

export default function ListManager(props) {

    const examCode = useParams().examName

    const socket = props.socket
    const questionId = props.questionId

    const [list, setList] = useState([])
    const [display, setDisplay] = useState(false)
    const [disableButton, setDisableButton] = useState(false)

    const modifyDisplay = useCallback(event => {
        event.preventDefault()
        setDisplay(state => !state)
    }, [])

    const remove = useCallback((e, id) => {
        e.preventDefault()
        setDisableButton(true)
        if (props.isAnswer) {
            socket.emit('remove-answer', id, examCode)
        } else {
            socket.emit('remove-question', id, examCode)
        }
    }, [examCode, props.isAnswer, socket])

    const handleServerAccept = useCallback(() => setDisableButton(false), [])
    const handleUpdate = useCallback(update => setDisableButton(false), [])

    useEffect(() => {

        setList(props.list)
        socket.on('server-accept', handleServerAccept)
        socket.on('updated', handleUpdate)

        return () => {
            socket.off('server-accept', handleServerAccept)
            socket.off('updated', handleUpdate)
        }
    }, [props.list, socket, handleServerAccept, handleUpdate])

    const listMapper = useCallback((el, kerdesIndex) => {
        return (
            <ul key={kerdesIndex} className='container wow bounceInLeft text-center border border-warning rounded w-75 shadow bg-light p-3 mb-3'>
                <div className="container">
                    <span className="float-left"><b>{kerdesIndex + 1}.</b></span>
                    <li>
                        <button disabled={disableButton}
                            className="btn btn-danger float-right"
                            onClick={e => { remove(e, el.id) }}>
                            Törlés
                        </button>
                    </li>
                </div>
                {
                    props.isAnswer ?
                        <div>
                            <li>
                                <Modifier socket={socket} index={el.id}
                                    value={el.text} isAnswer={true} />
                            </li>
                            <li><b>{el.correct ? <span className="text-success">Helyes</span> : <span className="text-danger">Helytelen</span>}</b>
                                <Modifier socket={socket} index={el.id}
                                    value={el.correct} isAnswer={true} />
                            </li>
                        </div>
                        :
                        <div>
                            <li>
                                <Modifier socket={socket} index={el.id} value={el.name} />
                            </li>

                            <li>
                                <Modifier socket={socket} index={el.id} value={el.points} />
                            </li>

                            <li>
                                <ModifyPic picture={el.pic} socket={socket} questionId={el.id} exam={examCode} />
                            </li>
                            <div>
                                <hr />
                                <ListManager socket={socket} questionId={el.id}
                                    list={el.answers} isAnswer={true} />
                            </div>
                        </div>
                }
            </ul>
        )
    }, [disableButton, examCode, props.isAnswer, remove, socket])

    return (
        <div className="container">
            {
                !list || list.length === 0 ?
                    <h6 className="alert alert-danger my-2 w-50 ml-auto mr-auto">A kérdéshez még nem tartozik válasz!</h6>
                    :
                    list.map(listMapper)
            }

            <AddAnswer socket={props.socket} questionId={questionId} display={display} />
            {props.isAnswer ?
                <li>
                    <hr />
                    <button onClick={modifyDisplay} className='btn btn-primary'>
                        {!display ? 'Válasz hozzáadása' : 'Mégse'}
                    </button>
                </li> : null}
        </div>
    )
}