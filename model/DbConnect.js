const CryptoJS = require('crypto-js')
/**
 * Általános tudnivalók
 * 
 * @classdesc Ez az osztály kezeli az adatbázissal kapcsolatos összes műveletet
 * 
 * 
 * Minden funkció async/await alapú
 * 
 * @author Filimon Márk
 */

class Connection {

    /**
     * 
     * @constructor -> A kapcsolat kiépítése
     * @property con -> connection rövidítése, ez felel a közvetlen kapcsolatért az adatbázissal
     */

    constructor() {
        const config = require('../config')
        
        this.con = require('knex')({
            client: 'mysql',
            connection: {
                host: config.database.host,
                user: config.database.user,
                password: config.database.password,
                database: config.database.db,
                multipleStatements: true
            },
            pool: { min: 0, max: 7 }
        })
    }

    globalStatisticsForAdmin = async (cardNum) => {
        const stats = []
        try {
            const exams = await this.con('exams')
                .select(['exams.exam_id', 'exam_itemcode', 'exam_name', 'points_required', 'points', 'time', 'completed', 'worker_id'])
                .innerJoin(this.con.raw('skills ON exams.exam_id = skills.exam_id')).where('exam_creator', cardNum)

            for (const exam of exams) {
                const worker = await this.con('workers').select('worker_name')
                    .where('worker_id', [exam.worker_id]).first()

                if (worker) {
                    stats.push([exam.exam_name, exam.exam_itemcode, exam.points_required,
                    exam.points, exam.time, exam.completed === 1, worker.worker_name])
                }
            }
        } catch (error) {
            console.log(error.message)
        }
        return stats
    }

    globalStatisticsForUser = async (cardNum) => {
        const stats = []
        try {
            const worker = await this.con('workers').select('worker_id').where('worker_cardcode', [cardNum]).first()

            if (worker) {
                const skills = await this.con('skills').select(['skills.exam_id', 'exam_itemcode', 'exam_name', 'points_required', 'points', 'time', 'completed'])
                    .innerJoin(this.con.raw('exams ON skills.exam_id = exams.exam_id'))
                    .where('worker_id', [worker.worker_id])

                skills.forEach(skill => {
                    stats.push([skill.exam_name, skill.exam_itemcode, skill.points_required,
                    skill.points, skill.time, skill.completed === 1])
                })
            }
        } catch (error) {
            console.log(error.message)
        }
        return stats
    }



    /*selectUserAnswers = (examCode, cardNum) => {
        return new Promise((resolve, reject) => {
            const answers = []
            this.con('exams').select('exam_id').where(this.con.raw('exam_itemcode = ?', [examCode])).first()
            .then(exam => {
                if(exam){
                    this.con('workers').select('worker_id')
                    .where(this.con.raw('worker_cardcode = ?', [cardNum])).first()
                    .then(worker => {
                        if(worker){
                            this.con('exam_result')
                            .select(['questions.question_name', 'exam_result.points', 'questions.points'])
                            .innerJoin(this.con.raw('questions ON questions.question_id = exam_result.question_id'))
                            .where('exam_result.worker_id', worker.worker_id).andWhere()
                        }
                    })
                }
            })
        })
    }*/

    selectSkill = async (examCode, cardNum) => {
        const skill = []
        try {
            const exam = await this.con('exams').select(['exam_id', 'exam_name', 'points_required'])
                .where(this.con.raw('exam_itemcode = ?', [examCode])).first()

            if (exam) {
                const worker = await this.con('workers').select('worker_id')
                    .where(this.con.raw('worker_cardcode = ?', [cardNum])).first()

                if (worker) {
                    const skillResult = await this.con('skills').where('worker_id', [worker.worker_id])
                        .andWhere('exam_id', exam.exam_id).first()

                    const maxPoints = await this.countExamMaxPoints(exam.exam_id)

                    if (skillResult && maxPoints) {
                        skill.push([exam.exam_name, exam.points_required,
                        skillResult.points, skillResult.time, skillResult.completed, points])
                    }
                }
            }
        } catch (error) {
            console.log(error.message)
        }
        return skill
    }

    countExamMaxPoints = async (examId) => {
        let maxPoints = 0
        try {
            const questions = await this.con('questions').select(['question_id', 'points']).where('exam_id', [examId])

            for (const question of questions) {

                const answers = await this.con('exam_prepare').select('exam_prepare.results_id')
                    .innerJoin(this.con.raw('results ON exam_prepare.results_id = results.results_id'))
                    .where('question_id', [question.question_id]).andWhere('correct', 1)

                if (answers.length > 0) {
                    maxPoints += question.points * results.length
                }
            }
        } catch (error) {
            console.log(error.message)
        }
        return maxPoints
    }

    processAnswers = async (answers, examCode, cardNum, time) => {
        let success = false
        try {
            const exam = await this.con('exams').select('exam_status').where('exam_itemcode', [examCode]).first()
            if (exam.exam_status === 1) {
                let maxQuestionPoints = 0
                let totalPoints = 0
                for (const answerObj of answers) {
                    const results = await this.con('results').select('results.results_id')
                        .innerJoin(this.con.raw('exam_prepare ON results.results_id = exam_prepare.results_id'))
                        .where(this.con.raw('exam_prepare.question_id = ?', [answerObj.id])).andWhere('correct', 1)

                    const question = await this.con('questions').select(['question_id', 'points'])
                        .where(this.con.raw('question_id = ?', [answerObj.id])).first()

                    if (results.length > 0 && question) {
                        maxQuestionPoints += question.points * results.length
                        let questionPoints = 0

                        for (const answer of answerObj.answers) {
                            if (result.findIndex(value => value.results_id === answer) > -1 && answerObj.answers.length > 0 && answerObj.answers.length <= result.length) {
                                totalPoints += question.points
                                questionPoints += question.points
                            }
                        }

                        await this.uploadPartialResults(cardNum, question.question_id, questionPoints)
                    }
                }

                success = await this.uploadResults(examCode, cardNum, totalPoints, time, maxQuestionPoints)
            }
        } catch (error) {
            console.log(error.message)
        }
        return success
    }

    uploadResults = async (examCode, cardNum, totalPoints, time, maxPoints) => {
        let success = false
        try {
            await this.con.transaction(async trx => {
                const worker = await this.con('workers').select('worker_id')
                    .where('worker_cardcode', [cardNum])
                    .first().transacting(trx)

                if (worker) {
                    const exam = await this.con('exams').select(['exam_id', 'points_required'])
                        .where(this.con.raw('exam_itemcode = ?', [examCode])).first().transacting(trx)

                    if (exam) {
                        const completed = totalPoints >= Math.round(exam.points_required * maxPoints) ? 1 : 0
                        const insert = await this.con('skills').insert({
                            worker_id: worker.worker_id,
                            exam_id: exam.exam_id,
                            points: totalPoints,
                            time: time,
                            completed: completed
                        }).transacting(trx)

                        if (insert) {
                            success = insert[0].insertId !== 0
                        }
                    }
                }
            })
        } catch (error) {
            console.log(error.message)
        }
        return success
    }

    uploadPartialResults = async (cardNum, questionId, points) => {
        let success = false
        try {
            await this.con.transaction(async trx => {
                const worker = await this.con('workers').select('worker_id')
                    .where(this.con.raw('worker_cardcode = ?', [cardNum])).transacting(trx)

                if (worker) {
                    const insert = await this.con('exam_result').insert({
                        worker_id: worker.worker_id,
                        question_id: questionId,
                        points: points
                    }).transacting(trx)

                    if (insert) {
                        success = insert[0].insertId !== 0
                    }
                }
            })
        } catch (error) {
            console.log(error.message)
        }
        return success
    }

    /*
     *---------------------------------------------------------------------------
     *
     *Új kérdések és válaszok beszúrása
     *
     *---------------------------------------------------------------------------
    */


    /**
     * A vizsga törlését végrehajtó folyamat
     * 
     * @param {string} user 
     * @param {number | string} examCode 
     * 
     * Használt táblák: exams, questions, results, exam_prepare
     */

    removeTest = async (user, examCode) => {
        let success = false
        try {
            await this.con.transaction(async trx => {
                const validUser = await this.checkExamCreator(user, examCode)
                if (validUser) {
                    const exam = await this.con('exams')
                        .where(this.con.raw('exam_itemcode = ?', [examCode])).first().transacting(trx)

                    if (exam) {
                        await this.removeMultipleQuestions(exam.exam_id, user, examCode)

                        const del = await this.con('exams').delete()
                            .where(this.con.raw('exam_itemcode = ?', [examCode])).transacting(trx)

                        if (del) {
                            success = true
                        }
                    }
                }
            })
        } catch (error) {
            console.log(error.message)
        }
        return success
    }

    /**
     * Több kérdés törlését végrehajtó folyamat
     * 
     * @param {number} examId 
     * @param {string} user 
     * @param {number | string} examCode
     * 
     * 
     * Használt táblák: questions, results, exam_prepare
     */

    removeMultipleQuestions = async (examId, user, examCode) => {
        try {
            const questions = await this.con('questions').where(this.con.raw('exam_id = ?', [examId]))
            if (questions.length !== 0) {
                for (const question of questions) {
                    await this.removeQuestion(user, question.question_id, examCode)
                }
            }
        } catch (error) {
            console.log(error.message)
        }
    }

    /**
     * Egy adott kérdés törlése válaszokkal együtt
     * 
     * @param {string} user 
     * @param {number} questionId 
     * @param {number | string} examCode 
     * 
     * Használt táblák: questions, results, exam_prepare
     */

    removeQuestion = async (user, questionId, examCode) => {
        let success = false
        try {
            await this.con.transaction(async trx => {
                const validUser = await this.checkExamCreator(user, examCode)
                if (validUser) {

                    const resultIds = await this.con('exam_prepare')
                        .where(this.con.raw('question_id = ?', [questionId])).transacting(trx)

                    if (resultIds) {
                        await this.removeMultipleAnswers(resultIds)
                    }
                    await this.con('questions').delete()
                        .where(this.con.raw('question_id = ?', [questionId])).transacting(trx)

                    success = await this.updateExamModify(user, examCode)
                }
            })
        } catch (error) {
            console.log(error.message)
        }
        return success
    }

    /**
     * Adott kérdéshez tartozó összes válasz törlése
     * 
     * @param {number[]} resultIds
     * 
     * Használt táblák: results
     */

    removeMultipleAnswers = async (resultIds) => {
        try {
            await this.con.transaction(async trx => {
                for (const id of resultIds) {
                    await this.con('results').delete()
                        .where(this.con.raw('results_id = ?', [id.results_id])).transacting(trx)
                }
            })
        } catch (error) {
            console.log(error.message)
        }
    }

    /**
     * Adott kérdés adott válaszának törlése
     * 
     * @param {string} user
     * @param {number} answerId
     * @param {number | string} examCode
     * 
     * Használt táblák: results, exam_prepare
     */

    removeAnswer = async (user, answerId, examCode) => {
        let success = false
        try {
            await this.con.transaction(async trx => {
                const validUser = this.checkExamCreator(user, examCode)

                if (validUser) {
                    //this.con('exam_prepare').delete().where(this.con.raw('results_id = ?', [answerId]))
                    const del = await this.con('results').delete()
                        .where(this.con.raw('results_id = ?', [answerId])).transacting(trx)

                    if (del) {
                        success = await this.updateExamModify(user, examCode)
                    }
                }
            })
        } catch (error) {
            console.log(error.message)
        }
        return success
    }

    /*
    ---------------------------------------------------------------------------
    Új kérdések és válaszok beszúrása
    ---------------------------------------------------------------------------
    */

    /**
     * Új kérdés beszúrása
     * 
     * @param {string} user 
     * @param {number | string} examCode 
     * @param {string} text 
     * @param {number} points 
     * @param {Blob} picture 
     * 
     * Használt táblák: exams, questions
     */

    insertQuestion = async (user, examCode, text, points, picture) => {
        let success = false
        try {
            await this.con.transaction(async trx => {
                const validUser = await this.checkExamCreator(user, examCode)

                if (validUser) {
                    const exam = await this.con('exams')
                        .where(this.con.raw('exam_itemcode = ?', [examCode])).first().transacting(trx)

                    if (exam) {
                        const insert = await this.con('questions').insert({
                            exam_id: exam.exam_id,
                            question_name: text,
                            points: points,
                            picture: picture
                        }).transacting(trx)

                        if (insert[0].insertId !== 0) {
                            success = await this.updateExamModify(user, examCode)
                        }
                    }
                }
            })
        } catch (error) {
            console.log(error.message)
        }
        return success
    }

    /**
     * Új válasz beszúrása
     * 
     * @param {string} user 
     * @param {number | string} examCode 
     * @param {number} questionId
     * @param {string} answerText 
     * @param {[0,1]} value
     * 
     * Használt táblák: questions, results, exam_prepare
     */

    insertAnswer = async (user, examCode, questionId, answerText, value) => {
        let success = false
        try {
            await this.con.transaction(async trx => {
                const validUser = await this.checkExamCreator(user, examCode)

                if (validUser) {
                    const question = await this.con('questions').select('question_id')
                        .where(this.con.raw('question_id = ?', [questionId]))
                        .first().transacting(trx)

                    if (question) {
                        let answerArray = [answerText, value]
                        const insertAnswer = await this.con.raw('INSERT INTO results (result_text, correct) VALUES(?)', [answerArray]).transacting(trx)

                        if (insertAnswer[0].insertId !== 0) {
                            const insertLink = await this.con('exam_prepare').insert({
                                question_id: question.question_id,
                                results_id: insertAnswer[0].insertId
                            }).transacting(trx)

                            if (insertLink[0].insertId !== 0) {
                                success = await this.updateExamModify(user, examCode)
                            }
                        }
                    }
                }
            })
        } catch (error) {
            console.log(error.message)
        }
        return success
    }

    /*
    ---------------------------------------------------------------------------
    Már létező vizsga tulajdonságok módosítása
    ---------------------------------------------------------------------------
    */

    updateExamStatus = async (user, examCode, status) => {
        let success = false
        try {
            await this.con.transaction(async trx => {
                const validUser = await this.checkExamCreator(user, examCode)

                if (validUser) {
                    const update = await this.con('exams').update({
                        exam_status: status,
                        exam_modifier: user,
                        exam_modified_time: this.con.fn.now()
                    }).where(this.con.raw('exam_itemcode = ?', [examCode])).transacting(trx)

                    if (update) {
                        success = true
                    }
                }
            })
        } catch (error) {
            console.log(error.message)
        }
        return success
    }

    updateExamPoints = async (user, examCode, points) => {
        let success = false
        try {
            await this.con.transaction(async trx => {
                const validUser = this.checkExamCreator(user, examCode)

                if (validUser) {
                    const exam = await this.con('exams').select('exam_id')
                        .where(this.con.raw('exam_itemcode = ?', [examCode])).transacting(trx)

                    if (exam.length !== 0) {
                        const update = await this.con('exams').update({
                            points_required: points,
                            exam_modifier: user,
                            exam_modified_time: this.con.fn.now()
                        }).where(this.con.raw('exam_itemcode = ?', [examCode])).transacting(trx)

                        if (update) {
                            success = true
                        }
                    }
                }
            })
        } catch (error) {
            console.log(error.message)
        }
        return success
    }

    /**
     * A vizsga egy adott kérdéséhez tartozó kép módosítása
     * 
     * @param {string} user 
     * @param {number | string} examCode
     * @param {number} questionId
     * @param {Blob | Buffer | ArrayBuffer | Uint8Array} picture
     * 
     * Használt táblák: exams
     * 
     */

    updateQuestionPic = async (user, examCode, questionId, picture) => {
        let success = false
        try {
            await this.con.transaction(async trx => {
                const validUser = await this.checkExamCreator(user, examCode)

                if (validUser) {
                    const update = await this.con('questions').update({
                        picture: picture
                    }).where(this.con.raw('question_id = ?', [questionId])).transacting(trx)

                    if (update) {
                        success = await this.updateExamModify(user, examCode)
                    }
                }
            })
        } catch (error) {
            console.log(error.message)
        }
        return success
    }

    /**
     * Már létező válasz módosítása
     * 
     * @param {string} user 
     * @param {number | string} examCode 
     * @param {number} answerId
     * @param {string | [0,1]} value
     * @param {boolean} isBoolean
     * 
     * Használt táblák: results
     */

    updateAnswer = async (user, examCode, answerId, value, isBoolean) => {
        let success = false
        try {
            await this.con.transaction(async trx => {
                const validUser = await this.checkExamCreator(user, examCode)

                if (validUser) {
                    const result = await this.con('results')
                        .where(this.con.raw('results_id = ?', [answerId]))
                        .first().transacting(trx)

                    let update = null
                    if (result && !isBoolean) {
                        if (result.result_text !== value) {
                            update = await this.con('results').update({
                                result_text: value
                            }).where(this.con.raw('results_id = ?', [answerId])).transacting(trx)
                        }
                    } else if (result && isBoolean) {
                        if (result.correct !== value) {
                            update = await this.con('results').update({
                                correct: value
                            }).where(this.con.raw('results_id = ?', [answerId])).transacting(trx)
                        }
                    }

                    if (update) {
                        success = await this.updateExamModify(user, examCode)
                    }
                }
            })
        } catch (error) {
            console.log(error.message)
        }
        return success
    }

    /**
     * Már létező kérdés módosítása
     * 
     * @param {string} user 
     * @param {number | string} examCode 
     * @param {number} questionId
     * @param {string | number} value
     * @param {boolean} isNumber
     * 
     * Használt táblák: questions
     */

    updateQuestion = async (user, examCode, questionId, value, isNumber) => {
        let success = false
        try {
            await this.con.transaction(async trx => {
                const validUser = await this.checkExamCreator(user, examCode)
                if (validUser) {
                    const question = await this.con('questions')
                        .select(['question_name', 'points', 'question_id'])
                        .where(this.con.raw('question_id = ?', [questionId]))
                        .first().transacting(trx)

                    let update = null
                    if (question && !isNumber) {
                        if (question.question_name !== value) {
                            update = await this.con('questions').update({
                                question_name: value
                            }).where(this.con.raw('question_id = ?', [questionId])).transacting(trx)
                        }
                    } else if (question && isNumber) {
                        if (question.points !== value) {
                            update = await this.con('questions').update({
                                points: value
                            }).where(this.con.raw('question_id = ?', [questionId])).transacting(trx)
                        }
                    }

                    if (update) {
                        success = await this.updateExamModify(user, examCode)
                    }
                }
            })
        } catch (error) {
            console.log(error.message)
        }
        return success
    }

    /**
     * Már létező vizsga módosítása
     * 
     * @param {string} user
     * @param {string} examName
     * @param {number | string} examCode 
     * @param {string} notes
     * @param {number} points
     * 
     * Használt táblák: exams
     */

    updateExam = async (user, examName, examCode, notes, points) => {
        let success = false
        try {
            await this.con.transaction(async trx => {
                const validUser = await this.checkExamCreator(user, examCode)

                if (validUser) {
                    const examNameCheck = await this.con('exams')
                        .where(this.con.raw('exam_name = ?', [examName]))
                        .andWhere(this.con.raw('exam_itemcode <> ?', [examCode])).transacting(trx)
                    if (examNameCheck.length === 0) {
                        const update = await this.con('exams').update({
                            exam_name: examName,
                            exam_notes: notes,
                            points_required: points,
                            exam_modifier: user,
                            exam_modified_time: this.con.fn.now()
                        })
                            .where(this.con.raw('exam_itemcode = ?', [examCode])).transacting(trx)

                        if (update) {
                            success = true
                        }
                    }
                }
            })
        } catch (error) {
            console.log(error.message)
        }
        return success
    }

    /*
    ---------------------------------------------------------------------------
    A vizsga módosításához szükséges segédlekérdezés(ek)
    ---------------------------------------------------------------------------
    */

    /**
     * A felhasználó és a vizsga készítőjének összehasonlítása
     * 
     * @param {string} user
     * @param {number | string} examCode
     * 
     * Használt táblák: exams
     */

    checkExamCreator = async (user, examCode) => {
        let isValid = false
        try {
            const exam = await this.con('exams').select('exam_creator')
                .where(this.con.raw('exam_itemcode = ?', [examCode]))
                .first()

            isValid = (exam.exam_creator == user)
        } catch (error) {
            console.log(error.message)
        }
        return isValid
    }

    /**
     * A vizsga módosítási idejének rögzítése
     *
     * @param {string} user
     * @param {number | string} examCode
     * 
     * Használt táblák: exams
     */

    updateExamModify = async (user, examCode) => {
        let updated = false
        try {
            await this.con.transaction(async trx => {
                const updater = await this.con('exams').update({
                    exam_modifier: user,
                    exam_modified_time: this.con.fn.now()
                })
                    .where(this.con.raw('exam_itemcode = ?', [examCode]))
                    .transacting(trx)
                if (updater) {
                    updated = true
                }
            })
        } catch (error) {
            console.log(error.message)
        }
        return updated
    }

    /*
    ---------------------------------------------------------------------------
    Általános vizsga műveletek
    ---------------------------------------------------------------------------
    */

    selectProductTypes = async () => {
        let types = []
        try {
            const typeList = await this.con('items').distinct('Types')

            typeList.forEach(type => {
                types.push(type.Types)
            })
        } catch (error) {
            console.log(error.message)
        }
        return types
    }

    selectProducts = async (productType) => { //Lehetséges termékek kiválasztása a vizsgákhoz
        let filteredResults = []
        try {
            let items = []
            if (productType) {
                items = await this.con('items').select(['ProductName', 'Itemcode'])
                    .leftJoin('exams', 'items.Itemcode', 'exams.exam_itemcode')
                    .where('exams.exam_itemcode', null).andWhere(this.con.raw('Types = ?', [productType]))
            } else {
                items = await this.con('items').select(['ProductName', 'Itemcode'])
                    .leftJoin('exams', 'items.Itemcode', 'exams.exam_itemcode')
                    .where('exams.exam_itemcode', null)
            }

            items.forEach(item => {
                filteredResults.push([item.ProductName, item.Itemcode])
            })
        } catch (error) {
            console.log(error.message)
        }
        return filteredResults
    }

    selectExamDoc = async (exam_itemcode, cardNum) => { //A vizsga tananyagának kiválasztása
        let result = []
        try {
            const exam = await this.con('exams').where(this.con.raw('exam_itemcode = ?', [exam_itemcode])).first()

            const skill = await this.con('workers').select('workers.worker_id')
                .innerJoin('skills', 'workers.worker_id', 'skills.worker_id').where('worker_cardcode', [cardNum])
                .andWhere('exam_id', [exam.exam_id])

            result.push(skill.length !== 0 ? 0 : exam.exam_status, exam.exam_docs)

        } catch (error) {
            console.log(error.message)
        }
        return result
    }

    selectLearnExams = async (userIsAdmin) => {
        let exams = []
        try {
            if (!userIsAdmin) {
                const examList = await this.con('exams')
                    .select(['exam_id', 'exam_name', 'exam_itemcode', 'exam_notes', 'exam_creation_time'])

                examList.forEach(result => {
                    exams.push({
                        examName: result.exam_name,
                        itemCode: result.exam_itemcode,
                        comment: result.exam_notes,
                        created: result.exam_creation_time
                    })
                })
            }
        } catch (error) {
            console.log(error.message)
        }
        return exams
    }

    selectExams = async (user, userIsAdmin) => { //Általános vizsgainfók kiválasztása
        let exams = []
        try {
            if (userIsAdmin) {
                const examList = await this.con('exams')
                    .select(['exam_name', 'exam_itemcode', 'exam_notes', 'exam_status', 'exam_creation_time'])
                    .where('exam_creator', [user])

                examList.forEach(exam => {
                    exams.push({
                        examName: exam.exam_name,
                        itemCode: exam.exam_itemcode,
                        comment: exam.exam_notes,
                        status: exam.exam_status,
                        created: exam.exam_creation_time
                    })
                })
            } else {
                const worker = await this.con('workers').select('worker_id')
                    .where('worker_cardcode', [user]).first()

                if (worker) {
                    const examList = await this.con('exams')
                        .select(['exams.exam_id', 'exam_name', 'exam_itemcode', 'exam_notes', 'exam_status', 'exam_creation_time'])
                        .where('exam_status', 1)

                    const skills = await this.con('skills').select('exam_id').where('worker_id', worker.worker_id)

                    examList.forEach(exam => {
                        if (skills.findIndex(value => value.exam_id === exam.exam_id) === -1) {
                            exams.push({
                                examName: exam.exam_name,
                                itemCode: exam.exam_itemcode,
                                comment: exam.exam_notes,
                                status: exam.exam_status,
                                created: exam.exam_creation_time
                            })
                        }

                    })

                }
            }
        } catch (error) {
            console.log(error)
        }
        return exams
    }

    /*
    ---------------------------------------------------------------------------
    A vizsga kiválasztása (Általános jellemzők + Kérdések + válaszok)
    ---------------------------------------------------------------------------
    */

    selectTest = async (questions) => { //Kérdés + Válasz párosítás
        let questionList = []
        try {
            for (const question of questions) {
                const answersIdList = await this.con('exam_prepare')
                    .where(this.con.raw('question_id = ?', [question.question_id]))

                const results = await this.selectResults(answersIdList)

                questionList.push({
                    id: question.question_id,
                    exam_id: question.exam_id,
                    name: question.question_name,
                    points: question.points,
                    pic: question.picture,
                    answers: results
                })
            }
        } catch (error) {
            console.log(error.message)
        }
        return questionList
    }

    selectResults = async (answersIdList) => { //Válaszok keresése a kérdéshez
        let results = []
        try {
            for (const answerId of answersIdList) {
                const answer = await this.con('results')
                    .where(this.con.raw('results_id = ?', [answerId.results_id])).first()

                if (answer) {
                    results.push({
                        id: answer.results_id,
                        text: answer.result_text,
                        correct: answer.correct == 1 ? true : false
                    })
                }
            }
        } catch (error) {
            console.log(error.message)
        }
        return results
    }

    selectExamContent = async (exam_itemcode) => { //Az adatok összesítése és tovább küldése
        let content = []
        try {
            const exam = await this.con('exams').select('exam_id')
                .where(this.con.raw('exam_itemcode = ?', [exam_itemcode])).first()
            if (exam) {
                const questions = await this.con('questions').where('exam_id', [exam.exam_id])
                if (questions.length > 0) {
                    content = await this.selectTest(questions)
                }
            }
        } catch (error) {
            console.log(error.message)
        }
        return content
    }

    selectExamProps = async (exam_itemcode) => {
        let result = []
        try {
            const exam = await this.con('exams')
                .select(['exam_name', 'exam_notes', 'exam_status', 'points_required'])
                .where('exam_itemcode', [exam_itemcode]).first()

            if (exam) {
                result.push(exam.exam_name, exam.exam_notes, exam.exam_status, exam.points_required)
            }
        } catch (error) {
            console.log(error.message)
        }
        return result
    }

    /*
    --------------------------------------------------------------------------
    Felhasználó kezelés
    --------------------------------------------------------------------------
    */

    findUser = async (cardNum) => {
        let result = 'no_user'
        try {
            const worker = await this.con('workers')
                .where(this.con.raw('worker_cardcode = ?', [cardNum])).first()

            if (worker) {
                result = [worker.worker_name, worker.worker_usergroup]
            }
        } catch (error) {
            console.log(error.message)
        }
        return result
    }

    registerUser = async (cardNum, password) => {
        let msg = false
        try {
            await this.con.transaction(async trx => {
                const login = await this.con('admin_login')
                    .where(this.con.raw('cardcode = ?', [cardNum])).first().transacting(trx)
                if (!login) {
                    const insert = await this.con('admin_login').insert({
                        cardcode: cardNum,
                        password: CryptoJS.AES.encrypt(password, 'jp-$kDB').toString()
                    }).transacting(trx)
                    msg = insert.length > 0
                }
            })
        } catch (error) {
            console.log(error.message)
        }
        return msg
    }

    userLogout = async (cardNum) => {
        try {
            await this.con.transaction(async trx => {
                await this.con('admin_login').update({
                    latest_logout: this.con.fn.now()
                }).where('cardcode', [cardNum]).transacting(trx)
            })
        } catch (error) {
            console.log(error.message)
        }
    }

    userExists = async (cardNum, password) => {
        let access = false
        try {
            await this.con.transaction(async trx => {
                const login =
                    await this.con('admin_login')
                        .where(this.con.raw('cardcode = ?', [cardNum])).first().transacting(trx)
                if (login.password) {
                    access = CryptoJS.AES.decrypt(login.password, 'jp-$kDB').toString(CryptoJS.enc.Utf8) === password
                    if(access){
                        await this.con('admin_login').update({
                            latest_login: this.con.fn.now()
                        }).where('cardcode', [cardNum]).transacting(trx)
                    }
                }
            })
        } catch (error) {
            console.log(error.message)
        }
        return access
    }

    /*
    ----------------------------------------------------------------------
    Vizsga feltöltés rendszere
    ----------------------------------------------------------------------
    */

    insertExam = async (arr) => {
        let message = ''
        try {
            await this.con.transaction(async trx => {
                const itemCount =
                    await this.con('items').count('Itemcode AS count')
                        .where(this.con.raw('Itemcode = ?', [arr[0]])).first().transacting(trx)
                if (itemCount.count > 0) {
                    const examcodeCount =
                        await this.con('exams').count('exam_itemcode AS count')
                            .where(this.con.raw('exam_itemcode = ?', [arr[0]])).first().transacting(trx)
                    if (examcodeCount.count === 0) {
                        const nameCount =
                            await this.con('exams').count('exam_id AS count')
                                .where(this.con.raw('exam_name = ?', [arr[1]])).first().transacting(trx)
                        if (nameCount.count === 0) {
                            const insert = await this.con.raw(
                                'INSERT INTO exams (exam_itemcode, exam_name, ' +
                                'exam_notes, exam_docs, exam_creator, exam_modifier) ' +
                                'VALUES (?)',
                                [arr]).transacting(trx)
                            if (insert.length !== 0) {
                                message = 200
                            }
                        } else {
                            message = 'mysql_name_exists_error'
                        }
                    } else {
                        message = 'mysql_item_exists_error'
                    }
                } else {
                    message = 'mysql_invalid_itemcode'
                }
            })
        } catch (error) {
            console.log(error.message)
        }
        return message
    }

}

module.exports = new Connection()