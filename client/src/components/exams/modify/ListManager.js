import React, {useEffect, useState} from 'react'
import {useParams} from 'react-router-dom'

import AddAnswer from './AddAnswer'

import Modifier from './Modifier'

export default function ListManager(props){

    const examCode = useParams().examName
    const socket = props.socket

    const [list, setList] = useState([])
    const [display, setDisplay] = useState(false)
    const [questionId,] = useState(props.questionId)
    var updated = false

    function modifyDisplay(event){
        event.preventDefault()
        setDisplay(state => !state)
    }

    function remove(e, id){
        e.preventDefault()
        if(props.isAnswer){
            socket.emit('remove-answer', id, examCode)
        }else{
            socket.emit('remove-question', id, examCode)
        }
    }

    useEffect(() =>{
        setList(props.list)
    }, [props.list, updated])

    return (
        <ul>
            {
                list.length === 0 ? <li>Nincs megjeleníthető tartalom</li> :
                list.map((el) => {
                    return el.map((inner, index) => {
                        if(index === 3){
                            return (
                            <div key={index}>
                                <div>A kérdéshez tartozó válaszok:</div>
                                <ListManager socket={socket} questionId={el[0]} list={inner} isAnswer={true}/>
                            </div>)
                        }else if(index === 0){
                            return (<li key={index}>Azonosító: {inner} <button onClick={e =>{
                                remove(e, inner)
                            }}>Törlés</button></li>)
                        }else if(index === 2){
                            if(typeof inner === 'boolean'){
                                return (
                                <li key={index}>Jelenlegi érték: {inner ? 'Helyes' : 'Helytelen'}
                                    <Modifier socket={socket} index={el[0]} value={inner} isAnswer={true}/>
                                </li>)
                            }else{
                                return <li key={index}>Pontszám: <Modifier socket={socket} index={el[0]} value={inner}/></li>
                            }
                        }else{
                            if(props.isAnswer){
                                return <li key={index}>Válasz: <Modifier socket={socket} index={el[0]} value={inner} isAnswer={true}/></li>
                            }else{
                                return <li key={index}>Kérdés: <Modifier socket={socket} index={el[0]} value={inner} /></li>
                            }
                        }
                    })
                })    
            }
            <AddAnswer socket={props.socket} questionId={questionId} display={display} updated={updated}/>
            {
                props.isAnswer ? <li><button onClick={modifyDisplay}>{
                    !display ? 'Válasz hozzáadása' : 'Mégse'
                }</button></li> : null
            }       
        </ul>
    )
}