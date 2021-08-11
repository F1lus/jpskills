import { useState, useEffect } from "react"

export default function useExamStats(exams) {

    const [stat, setStat] = useState({
        avgTime: {
            avgMins: 0,
            avgSecs: 0
        },
        avgScore: 0,
        completionRate: 0
    })

    useEffect(() => {
        let avgTime = 0
        let avgScore = 0
        let rate = 0

        if (exams && exams.length > 0) {
            exams.forEach(exam => {
                avgTime += exam.time
                avgScore += exam.score
                rate += exam.completed ? 1 : 0
            })

            setStat({
                skills: exams,
                avgTime: {
                    avgMins: Math.floor((avgTime / exams.length) / 60),
                    avgSecs: Math.round((avgTime / exams.length) % 60)
                },
                avgScore: Math.round(avgScore / exams.length),
                completionRate: ((rate / exams.length) * 100).toString().substring(0, 5)
            })
        }
    }, [exams])

    return stat

}