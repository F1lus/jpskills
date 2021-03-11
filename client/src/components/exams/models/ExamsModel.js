export default (rawExamArray) => {
    if (rawExamArray) {
        let examList = []

        rawExamArray.forEach((exam) => {
            if (!exam[2] || exam[2] === 'null' || exam[2] === '') {
                exam[2] = null
            }
            examList.push({
                name: exam[0],
                itemcode: exam[1],
                comment: exam[2],
                status: exam[3] === 1 ? 'Aktív' : 'Inaktív',
                date: exam[4]
            })
        })

        return examList
    }
    return []
}