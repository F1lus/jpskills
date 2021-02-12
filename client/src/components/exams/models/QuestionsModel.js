export default (rawQuestions) => {
    let list = []
    let examPoints = 0
    
    if(rawQuestions || rawQuestions.length > 0){
        rawQuestions.forEach((question) => {
            let answers = []
            if(question.answers){
                question.answers.forEach(answer => {
                    if(answer.correct){
                        examPoints += question.points
                    }
                    answers.push([answer.id, answer.text, answer.correct])
                })
                answers.sort((a, b) => a[0] - b[0])
            }

            list.push([question.id, question.name, question.points, question.pic, answers])
        })
        
        list.sort((a, b) => a[0] - b[0])
    }

    return {
        questions: list,
        points: examPoints
    }
}