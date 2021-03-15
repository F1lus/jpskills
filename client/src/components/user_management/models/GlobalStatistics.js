export default (rawSkillMatrix) => {
    const skills = rawSkillMatrix
    let avgScore = 0
    let avgTime = 0
    let completedCount = 0

    if (skills || skills.length > 0) {
        skills.sort((a, b) => b.score - a.score)

        skills.forEach(skill => {
            avgScore += skill.score
            avgTime += skill.time
            completedCount += skill.completed ? 1 : 0
        })

        avgScore /= skills.length
        avgTime /= skills.length
        completedCount = (completedCount / skills.length) * 100
    }

    return {
        skills: skills,
        avgScore: Math.round(avgScore),
        avgTime: {
            avgMins: Math.floor(avgTime / 60),
            avgSecs: Math.round(avgTime % 60)
        },
        completedRate: completedCount.toString().substring(0, 5)
    }
}