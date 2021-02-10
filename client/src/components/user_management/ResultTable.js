import React, {useState, useEffect} from 'react'

export default function ResultTable(props) {

    const [exams, setExams] = useState([])
    const [examCode, setExamCode] = useState(null)
    const [results, setResults] = useState([])

    useEffect(() => {
        if(props.results){
            const array = []
            props.results.forEach(skill => {
                if(array.findIndex(value => value.key === skill.examName && value.value === skill.examCode) === -1){
                    array.push({key: skill.examName, value: skill.examCode})
                }
            })
            setExams(array)
        }
    }, [props.results])

    useEffect(() => {
        if(props.results && examCode){
            let filteredArray = props.results.filter(skill => skill.examCode === examCode) 
            setResults(filteredArray)
        }else{
            setResults([])
        }
    }, [examCode, props.results])

    function handleChange(event){
        if(!event.target.value || event.target.value === 'Vizsga kiválasztása'){
            setExamCode(null)
        }else{
            setExamCode(event.target.value)
        }
    }

    function renderRows(){
        return results.map((result, index) => {
            return (
                <tr key={index} className={result.completed ? "table-success" : "table-danger"}>
                    <td>{result.worker}</td>
                    <td>{result.score+"/"+result.minScore}</td>
                    <td>{Math.floor(result.time/60)+":"+result.time%60}</td>
                    <td>{result.completed ? 'Átment' : 'Megbukott'}</td>
                </tr>
            )
        })
    }

    return (
        <div className="container text-center">
            <br/>
            <h1><p>Vizsgánkénti statisztika</p></h1>

            <select onChange={handleChange} className="mb-3">
                <option value={null}>Vizsga kiválasztása</option>
                {exams.length > 0 ? exams.map((exam, index) => {
                    return <option key={index} value={exam.value}>{exam.key}</option>
                }) : null}
            </select>

            {results.length > 0 ?
                <table className="table table-hover">
                    <thead>
                        <tr>
                            <th>Vizsgázó neve</th>
                            <th>Eredmény</th>
                            <th>Idő</th>
                            <th>Konklúzió</th>
                        </tr>
                    </thead>

                    <tbody>
                        {renderRows()}
                    </tbody>
                </table> : null
            }
            <br/>
        </div>
    )
}