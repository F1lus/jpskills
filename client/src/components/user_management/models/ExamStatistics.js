export default (exams) => {
    let avgTime = 0
    let avgScore = 0
    let rate = 0

    if (exams || exams.length > 0) {
        exams.forEach(exam => {
            avgTime += exam.time
            avgScore += exam.score
            rate += exam.completed ? 1 : 0
        })

        avgScore /= exams.length
        avgTime /= exams.length
        rate = (rate / exams.length) * 100
    }

    return {
        avgTime: {
            avgMins: Math.floor(avgTime / 60),
            avgSecs: Math.round(avgTime % 60)
        },
        avgScore: Math.round(avgScore),
        completionRate: rate.toString().substring(0, 5)
    }

}