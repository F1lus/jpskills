export default (rawExamArray) => {
        if(rawExamArray){
            let examList = []
            
            rawExamArray.forEach((exam) => {
                examList.push([exam[0], exam[1], exam[2], exam[3], exam[4]])
            })
            
            return examList
        }
        return []
}