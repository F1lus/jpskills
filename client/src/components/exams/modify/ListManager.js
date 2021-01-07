import React, {useEffect, useState} from 'react'

import Modifier from './Modifier'

export default function ListManager(props){

    const [list, setList] = useState([])

    useEffect(() =>{
        setList(props.list)
    }, [props.list])

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
                                <ListManager list={inner} isAnswer={true}/>
                            </div>)
                        }else if(index === 0){
                            return <li key={index}>Azonosító: {inner}</li>
                        }else if(index === 2){
                            if(typeof inner === 'boolean'){
                                return <li key={index}>Érték: <Modifier index={el[0]} value={inner} isAnswer={true}/></li>
                            }else{
                                return <li key={index}>Pontszám: <Modifier index={el[0]} value={inner}/></li>
                            }
                        }else{
                            if(props.isAnswer){
                                return <li key={index}>Válasz: <Modifier index={el[0]} value={inner} isAnswer={true}/></li>
                            }else{
                                return <li key={index}>Kérdés: <Modifier index={el[0]} value={inner} /></li>
                            }
                        }
                    })
                    
                })
}
        </ul>
    )
}