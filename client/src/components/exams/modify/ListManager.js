import React, {useEffect, useState} from 'react'

import Modifier from './Modifier'

export default function ListManager(props){

    const [list, setList] = useState([])

    useEffect(() =>{
        setList(props.list)
        console.log(props.isAnswer)
    }, [])

    return (
        <ul>
            {
                list.length === 0 ? <li>Nincs megjeleníthető tartalom</li> :
                list.map((el, index) => {
                    if(Array.isArray(el)){
                        if(index === 3){
                            return (
                            <div key={index}>
                                <div>A kérdéshez tartozó válaszok:</div>
                                <ListManager list={el} isAnswer={true}/>
                            </div>)
                        }else{
                            return <ListManager key={index} list={el} />
                        }
                    }else{
                        if(index === 0){
                            return <li key={index}>Azonosító: {el}</li>
                        }else if(index === 2){
                            if(typeof el === 'boolean'){
                                return <li key={index}>Érték: <Modifier value={el} isAnswer={true}/></li>
                            }else{
                                return <li key={index}>Pontszám: <Modifier value={el}/></li>
                            }
                        }else{
                            if(props.isAnswer){
                                return <li key={index}>Szöveg: {el}</li>
                            }else{
                                return <li key={index}>KÉRDÉS: {el}</li>
                            }
                        }
                    }
                })
            }
        </ul>
    )
}