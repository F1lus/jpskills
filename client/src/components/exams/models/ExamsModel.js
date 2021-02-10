export default (rawExamArray) => {
        if(rawExamArray){
            let examList = []
            
            rawExamArray.forEach((exam) => {
                if(!exam[2] || exam[2] === 'null' || exam[2] === ''){
                    exam[2] = null
                }
                examList.push([exam[0], exam[1], exam[2], exam[3], exam[4]])
            })
            
            return examList
        }
        return []
}