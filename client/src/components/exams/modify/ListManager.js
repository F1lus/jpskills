import React, {useCallback, useEffect, useState} from 'react'
import {useParams} from 'react-router-dom'

import AddAnswer from './AddAnswer'
import ModifyPic from './ModifyPic'
import Modifier from './Modifier'

export default function ListManager(props){

    const examCode = useParams().examName
    const socket = props.socket
    const questionId = props.questionId

    const [list, setList] = useState([])
    const [display, setDisplay] = useState(false)
    const [disableButton, setDisableButton] = useState(props.disable || false)

    const modifyDisplay = useCallback(event => {
        event.preventDefault()
        setDisplay(state => !state)
    }, [])

    const remove = useCallback((e, id) =>{
        e.preventDefault()
        setDisableButton(true)
        if(props.isAnswer){
            socket.emit('remove-answer', id, examCode)
        }else{
            socket.emit('remove-question', id, examCode)
        }
    }, [examCode, props.isAnswer, socket])

    const handleServerAccept = useCallback(() => setDisableButton(false), [])
    const handleUpdate = useCallback(update => setDisableButton(false), [])

    useEffect(() =>{
        setList(props.list)
        socket.on('server-accept', handleServerAccept)
        socket.on('updated', handleUpdate)

        return () => {
            socket.off('server-accept', handleServerAccept)
            socket.off('updated', handleUpdate)
        }
    }, [props.list, socket, handleServerAccept, handleUpdate])

    return (
        <div className="container">
            {
                list.length === 0 ? <li className="alert alert-danger my-2 w-50 ml-auto mr-auto">Nincs megjeleníthető tartalom!</li> :
                list.map((el,kerdesIndex) => {
                    return <ul key={kerdesIndex} className='container text-center border border-warning rounded w-75 shadow bg-light p-3 mb-3'>{
                        el.map((inner, index) => { //inner - belső tömb eleme
                        if(index === 0){
                            return (
                                <div className="container" key={index}>
                                    <span className="float-left"><b>{kerdesIndex+1}.</b></span>
                                    <li>
                                        <button disabled={disableButton}
                                            className="btn btn-danger float-right" 
                                            onClick={e =>{remove(e, inner)}}>
                                                Törlés
                                        </button>
                                    </li>
                                </div>)
                        }else if(index === 2){
                            /*
                            Itt jelennek meg a kérdések és a válaszok értékei
                            Ha boolean típusú az aktuális elem, akkor válasz, ha nem akkor kérdés
                            */
                            if(typeof inner === 'boolean'){
                                return (
                                <li key={index}><b>{inner ? <span className="text-success">Helyes</span> : <span className="text-danger">Helytelen</span>}</b>
                                    <Modifier socket={socket} index={el[0]} 
                                        value={inner} isAnswer={true} disable={disableButton}/>
                                </li>)
                            }else{
                                return <li key={index}>
                                    <Modifier socket={socket} index={el[0]} value={inner} disable={disableButton}/>
                                    </li>
                            }
                        }else if(index === 4){
                            /*
                            Ilyenkor a lista újra meghívásra kerül, mivel akkor már a válaszokat
                            jeleníti meg
                            */
                            return (
                            <div key={index}>
                                <hr/>
                                <ListManager socket={socket} questionId={el[0]} 
                                    list={inner} isAnswer={true} disable={disableButton}/>
                            </div>)

                        }else if(index === 3){
                            return (
                                <li key={index}>
                                    <ModifyPic picture={inner} socket={socket} questionId={el[0]} exam={examCode}/>
                                </li>
                            )
                        }else{
                            //Itt jelennek meg a kérdések és a válaszok (a konkrét szöveg)
                            if(props.isAnswer){
                                return <li key={index}>
                                    <Modifier socket={socket} index={el[0]} 
                                        value={inner} isAnswer={true} disable={disableButton}/>
                                    </li>
                            }else{
                                return <li key={index}>
                                        <Modifier socket={socket} index={el[0]} value={inner} disable={disableButton}/>
                                    </li>
                            }
                        }
                    })}</ul>
                })    
            }
            
            <AddAnswer socket={props.socket} questionId={questionId} display={display}  disable={disableButton}/>
            {props.isAnswer ? 
                <li>
                    <hr/>
                    <button onClick={modifyDisplay} className="btn btn-warning">
                        {!display ? 'Válasz hozzáadása' : 'Mégse'}
                    </button>
                </li> : null}
        </div>
    )
}