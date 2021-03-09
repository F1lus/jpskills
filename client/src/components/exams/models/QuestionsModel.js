export default (rawQuestions) => {
    let examPoints = 0

    //Kérdés { id, name, points, pic, answers}
    //Válasz { id, text, correct}

    if (rawQuestions || rawQuestions.length > 0) {
        rawQuestions.forEach((question) => {
            question.answers.forEach(answer => examPoints += answer.correct ? question.points : 0)
            question.answers.sort((a, b) => a.id - b.id)
        })
        rawQuestions.sort((a, b) => a.id - b.id)
    }

    return {
        questions: rawQuestions,
        points: examPoints
    }
}