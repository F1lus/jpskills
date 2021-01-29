import React, {useEffect, useState} from 'react'
import {useParams} from 'react-router-dom'

import AddAnswer from './AddAnswer'

import Modifier from './Modifier'

export default function ListManager(props){

    const examCode = useParams().examName
    const socket = props.socket
    const questionId = props.questionId

    const [list, setList] = useState([])
    const [display, setDisplay] = useState(false)
    const [disableButton, setDisableButton] = useState(props.disable || false)

    function modifyDisplay(event){
        event.preventDefault()
        setDisplay(state => !state)
    }

    function remove(e, id){
        e.preventDefault()
        setDisableButton(true)
        if(props.isAnswer){
            socket.emit('remove-answer', id, examCode)
        }else{
            socket.emit('remove-question', id, examCode)
        }
    }

    useEffect(() =>{
        setList(props.list)
    }, [props.list])

    useEffect(() => {
        socket.on('server-accept', () => {
            setDisableButton(false)
        })
    })

    return (
        <ul>
            {
                list.length === 0 ? <li className="alert alert-danger my-2">Nincs megjeleníthető tartalom!</li> :
                list.map((el,kerdesIndex) => {
                    return el.map((inner, index) => { //inner - belső tömb eleme
                        if(index === 0){
                            return (
                                <div className="container" key={index}>
                                    <span className="float-left"><b>{kerdesIndex+1}.</b></span>
                                    <li>
                                        <button disabled={disableButton}
                                            className="btn btn-warning float-right" 
                                            onClick={e =>{remove(e, inner)}}
                                        >
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
                        }else if(index === 3){
                            /*
                            Ilyenkor a lista újra meghívásra kerül, mivel akkor már a válaszokat
                            jeleníti meg
                            */
                            return (
                            <div key={index} className="jumbotron mb-2">
                                <h3><p>A kérdéshez tartozó válaszok:</p></h3>
                                <ListManager socket={socket} questionId={el[0]} 
                                    list={inner} isAnswer={true} disable={disableButton}/>
                            </div>)

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
                    })
                })    
            }
            <AddAnswer socket={props.socket} questionId={questionId} display={display}  disable={disableButton}/>
            {props.isAnswer ? 
                <li>
                    <button onClick={modifyDisplay} className="btn btn-warning">
                        {!display ? 'Válasz hozzáadása' : 'Mégse'}
                    </button>
                </li> : null}       
        </ul>
    )
}