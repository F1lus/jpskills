export default (rawResult) => {

    const result = {
        examName: null,
        minPoints: null,
        userScore: null,
        time: null,
        completed: null
    }

    if(rawResult || rawResult.length > 0){
        result.examName = rawResult[0]
        result.minPoints = rawResult[1]
        result.userScore = rawResult[2]
        result.time = Math.floor(rawResult[3] / 60) + " perc " + Math.round(rawResult[3] % 60) + " másodperc"
        result.completed = rawResult[4] === 1
    }

    return result
}