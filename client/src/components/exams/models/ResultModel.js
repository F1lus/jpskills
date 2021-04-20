export default (rawResult) => {

    const result = {
        examName: null,
        minPercent: null,
        userScore: null,
        time: null,
        completed: null,
        maxPoints: null
    }

    if (rawResult || rawResult.length > 0) {
        result.examName = rawResult[0]
        result.minPercent = rawResult[1] || 0
        result.userScore = rawResult[2] || 0
        result.time = Math.floor(rawResult[3] || 0 / 60) + " perc " + Math.round(rawResult[3] || 0 % 60) + " másodperc"
        result.completed = rawResult[4] === 1
        result.maxPoints = rawResult[5] || 0
    }

    return result
}