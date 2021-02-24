/**
 * Általános tudnivalók
 * 
 * @classdesc Ez az osztály kezeli az adatbázissal kapcsolatos összes műveletet
 * 
 * Külső modulok:
 * 
 * @module knex
 * @module mysql
 * 
 * 
 * Minden funkció Promise alapú
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
        this.con = require('knex')({
            client: 'mysql',
            connection: {
                host: 'localhost',
                user: 'root',
                password: '',
                database: 'jpskills',
                multipleStatements: true
            },
            pool: { min: 0, max: 7 }
        })
    }

    globalStatisticsForAdmin = (cardNum) => {
        return new Promise((resolve, reject) => {
            const results = []
            this.con('exams')
                .select(['exams.exam_id', 'exam_itemcode', 'exam_name', 'points_required', 'points', 'time', 'completed', 'worker_id'])
                .innerJoin(this.con.raw('skills ON exams.exam_id = skills.exam_id')).where('exam_creator', cardNum)
                .then(exams => {
                    if (exams) {
                        exams.forEach((exam, index) => {
                            this.con('workers').select('worker_name')
                                .where('worker_id', [exam.worker_id]).first()
                                .then(worker => {
                                    if (worker) {
                                        results.push([
                                            exam.exam_name, exam.exam_itemcode, exam.points_required,
                                            exam.points, exam.time, exam.completed === 1, worker.worker_name
                                        ])
                                    }
                                    if (index === exams.length - 1) {
                                        resolve(results)
                                    }
                                }).catch(err => reject(err))
                        })
                    }
                }).catch(err => reject(err))
        })
    }

    globalStatisticsForUser = (cardNum) => {
        return new Promise((resolve, reject) => {
            const results = []
            this.con('workers').select('worker_id').where('worker_cardcode', [cardNum]).first()
                .then(worker => {
                    if (worker) {
                        this.con('skills').select(['skills.exam_id', 'exam_itemcode', 'exam_name', 'points_required', 'points', 'time', 'completed'])
                            .innerJoin(this.con.raw('exams ON skills.exam_id = exams.exam_id'))
                            .where('worker_id', [worker.worker_id])
                            .then(skills => {
                                if (skills) {
                                    skills.forEach((skill, index) => {
                                        results.push([
                                            skill.exam_name, skill.exam_itemcode, skill.points_required,
                                            skill.points, skill.time, skill.completed === 1
                                        ])
                                        if (index === skills.length - 1) {
                                            resolve(results)
                                        }
                                    })
                                } else {
                                    resolve(results)
                                }
                            }).catch(err => reject(err))
                    } else {
                        resolve(results)
                    }
                }).catch(err => reject(err))
        })
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

    selectSkill = (examCode, cardNum) => {
        return new Promise((resolve, reject) => {
            this.con('exams').select(['exam_id', 'exam_name', 'points_required'])
                .where(this.con.raw('exam_itemcode = ?', [examCode])).first()
                .then(exam => {
                    if (exam) {
                        this.con('workers').select('worker_id')
                            .where(this.con.raw('worker_cardcode = ?', [cardNum])).first()
                            .then(worker => {
                                if (worker) {
                                    this.con('skills').where('worker_id', [worker.worker_id])
                                        .andWhere('exam_id', exam.exam_id).first()
                                        .then(skill => {
                                            if (skill) {
                                                this.countExamMaxPoints(exam.exam_id).then(points => {
                                                    if (points) {
                                                        resolve([
                                                            exam.exam_name, exam.points_required,
                                                            skill.points, skill.time, skill.completed, points
                                                        ])
                                                    }
                                                })
                                            } else {
                                                resolve([])
                                            }
                                        }).catch(err => reject(err))
                                }
                            }).catch(err => reject(err))
                    } else {
                        resolve([])
                    }
                }).catch(err => reject(err))
        })
    }

    countExamMaxPoints = (examId) => {
        return new Promise((resolve, reject) => {
            let maxPoints = 0
            this.con('questions').select(['question_id', 'points']).where('exam_id', [examId])
                .then(questions => {
                    if (questions) {
                        questions.forEach((question, index) => {
                            this.con('exam_prepare').select('exam_prepare.results_id')
                                .innerJoin(this.con.raw('results ON exam_prepare.results_id = results.results_id'))
                                .where('question_id', [question.question_id]).andWhere('correct', 1)
                                .then(results => {
                                    if (results) {
                                        maxPoints += question.points * results.length
                                    }
                                    if (index === questions.length - 1) {
                                        resolve(maxPoints)
                                    }
                                }).catch(err => reject(err))
                        })
                    }
                }).catch(err => reject(err))
        })
    }

    processAnswers = (answers, examCode, cardNum, time) => {
        return new Promise((resolve, reject) => {
            this.con('exams').select('exam_status').where('exam_itemcode', [examCode]).first()
                .then(exam => {
                    if (exam.exam_status === 1) {
                        let maxQuestionPoints = 0
                        let totalPoints = 0
                        answers.forEach((answerObj, index) => {
                            this.con('results').select('results.results_id')
                                .innerJoin(this.con.raw('exam_prepare ON results.results_id = exam_prepare.results_id'))
                                .where(this.con.raw('exam_prepare.question_id = ?', [answerObj.id])).andWhere('correct', 1)
                                .then(result => {
                                    if (result) {
                                        this.con('questions').select(['question_id', 'points'])
                                            .where(this.con.raw('question_id = ?', [answerObj.id])).first()
                                            .then(question => {
                                                if (question) {
                                                    maxQuestionPoints += question.points * result.length
                                                    let questionPoints = 0
                                                    answerObj.answers.forEach((answer) => {
                                                        if (result.findIndex(value => value.results_id === answer) > -1 && answerObj.answers.length > 0 && answerObj.answers.length <= result.length) {
                                                            totalPoints += question.points
                                                            questionPoints += question.points
                                                        }
                                                    })
                                                    this.uploadPartialResults(cardNum, question.question_id, questionPoints).then(() => {
                                                        if (index === answers.length - 1) {
                                                            this.uploadResults(examCode, cardNum, totalPoints, time, maxQuestionPoints)
                                                                .then(response => resolve(response))
                                                                .catch(err => reject(err))
                                                        }
                                                    })
                                                        .catch(err => reject(err))
                                                }
                                            }).catch(err => reject(err))
                                    }
                                }).catch(err => reject(err))
                        })
                    }
                }

                )
        })
    }

    uploadResults = (examCode, cardNum, totalPoints, time, maxPoints) => {
        return new Promise((resolve, reject) => {
            this.con('workers').select('worker_id').where(this.con.raw('worker_cardcode = ?', [cardNum]))
                .first().then(worker => {
                    if (worker) {
                        this.con('exams').select(['exam_id', 'points_required'])
                            .where(this.con.raw('exam_itemcode = ?', [examCode])).first()
                            .then(exam => {
                                if (exam) {
                                    const completed = totalPoints >= Math.round(exam.points_required * maxPoints) ? 1 : 0
                                    this.con('skills').insert({
                                        worker_id: worker.worker_id,
                                        exam_id: exam.exam_id,
                                        points: totalPoints,
                                        time: time,
                                        completed: completed
                                    }).then(response => resolve(response != null)).catch(err => reject(err))
                                } else {
                                    resolve(false)
                                }
                            }).catch(err => reject(err))
                    } else {
                        resolve(false)
                    }
                }).catch(err => reject(err))
        })
    }

    uploadPartialResults = (cardNum, questionId, points) => {
        return new Promise((resolve, reject) => {
            this.con('workers').select('worker_id').where(this.con.raw('worker_cardcode = ?', [cardNum]))
                .first().then(worker => {
                    if (worker) {
                        this.con('exam_result').insert({
                            worker_id: worker.worker_id,
                            question_id: questionId,
                            points: points
                        }).then(response => resolve(response != null))
                            .catch(err => reject(err))
                    } else {
                        resolve(false)
                    }
                }).catch(err => reject(err))
        })
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

    removeTest = (user, examCode) => {
        return new Promise((resolve, reject) => {
            this.checkExamCreator(user, examCode).then(result => {
                if (result) {
                    this.con('exams').where(this.con.raw('exam_itemcode = ?', [examCode])).first()
                        .then(exam => {
                            if (exam) {
                                this.removeMultipleQuestions(exam.exam_id, user, examCode).then(() => {
                                    this.con('exams').delete()
                                        .where(this.con.raw('exam_itemcode = ?', [examCode])).then(response => {
                                            resolve(response != null)
                                        }).catch(err => reject(err))
                                }).catch(err => reject(err))
                            }
                        }).catch(err => reject(err))
                }
            }).catch(err => reject(err))
        })
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

    removeMultipleQuestions = (examId, user, examCode) => {
        return new Promise((resolve, reject) => {
            this.con('questions').where(this.con.raw('exam_id = ?', [examId]))
                .then(questionIds => {
                    if (questionIds.length === 0) {
                        resolve(false)
                    } else {
                        questionIds.forEach((id, index) => {
                            this.removeQuestion(user, id.question_id, examCode).then(() => {
                                if (index === questionIds.length - 1) {
                                    resolve(true)
                                }
                            }).catch(err => reject(err))
                        })
                    }
                }).catch(err => reject(err))
        })
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

    removeQuestion = (user, questionId, examCode) => {
        return new Promise((resolve, reject) => {
            this.checkExamCreator(user, examCode).then(result => {
                if (result) {
                    this.con('exam_prepare').where(this.con.raw('question_id = ?', [questionId]))
                        .then(resultIds => {
                            if (resultIds) {
                                this.con('exam_prepare').delete().where(this.con.raw('question_id = ?', [questionId]))
                                    .then(response => {
                                        if (response) {
                                            this.removeMultipleAnswers(resultIds)
                                                .then(() => {
                                                    this.con('questions').delete().where(this.con.raw('question_id = ?', [questionId]))
                                                        .then(() => {
                                                            this.updateExamModify(user, examCode)
                                                                .then(res => resolve(res != null))
                                                                .catch(err => reject(err))
                                                        }).catch(err => reject(err))

                                                }).catch(err => reject(err))
                                        } else {
                                            this.con('questions').delete().where(this.con.raw('question_id = ?', [questionId]))
                                                .then(() => {
                                                    this.updateExamModify(user, examCode)
                                                        .then(res => resolve(res != null))
                                                        .catch(err => reject(err))
                                                }).catch(err => reject(err))
                                        }
                                    }).catch(err => reject(err))
                            }
                        }).catch(err => reject(err))
                }
            }).catch(err => reject(err))
        })
    }

    /**
     * Adott kérdéshez tartozó összes válasz törlése
     * 
     * @param {number[]} resultIds
     * 
     * Használt táblák: results
     */

    removeMultipleAnswers = (resultIds) => {
        return new Promise((resolve, reject) => {
            resultIds.forEach((id, index) => {
                this.con('results').delete().where(this.con.raw('results_id = ?', [id.results_id]))
                    .then(() => {
                        if (resultIds.length - 1 === index) {
                            resolve(true)
                        }
                    }).catch(err => reject(err))
            })
        })
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

    removeAnswer = (user, answerId, examCode) => {
        return new Promise((resolve, reject) => {
            this.checkExamCreator(user, examCode).then(result => {
                if (result) {
                    this.con('exam_prepare').delete().where(this.con.raw('results_id = ?', [answerId]))
                        .then(response => {
                            if (response) {
                                this.con('results').delete().where(this.con.raw('results_id = ?', [answerId]))
                                    .then(res => {
                                        if (res) {
                                            this.updateExamModify(user, examCode)
                                                .then(res => resolve(res != null))
                                                .catch(err => reject(err))
                                        } else {
                                            resolve(false)
                                        }
                                    }).catch(err => reject(err))
                            } else {
                                resolve(false)
                            }
                        }).catch(err => reject(err))
                }
            }).catch(err => reject(err))
        })
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

    insertQuestion = (user, examCode, text, points, picture) => {
        return new Promise((resolve, reject) => {
            this.checkExamCreator(user, examCode).then(result => {
                if (result) {
                    this.con('exams').where(this.con.raw('exam_itemcode = ?', [examCode])).first()
                        .then(exam => {
                            if (exam) {
                                this.con('questions').insert({
                                    exam_id: exam.exam_id,
                                    question_name: text,
                                    points: points,
                                    picture: picture
                                }).then(response => {
                                    if (response) {
                                        this.updateExamModify(user, examCode)
                                            .then(res => resolve(res != null))
                                            .catch(err => reject(err))
                                    }
                                }).catch(err => reject(err))
                            }
                        }).catch(err => reject(err))
                }
            }).catch(err => reject(err))
        })
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

    insertAnswer = (user, examCode, questionId, answerText, value) => {
        return new Promise((resolve, reject) => {
            this.checkExamCreator(user, examCode).then(result => {
                if (result) {
                    this.con('questions').select('question_id').where(this.con.raw('question_id = ?', [questionId]))
                        .first().then(result => {
                            if (result) {
                                let arr = [answerText, value]
                                this.con.raw('INSERT INTO results (result_text, correct) VALUES(?)', [arr])
                                    .then(response => {
                                        if (response) {
                                            let arr2 = [questionId, response[0].insertId]
                                            this.con.raw('INSERT INTO exam_prepare (question_id, results_id) VALUES(?)', [arr2])
                                                .then(res => {
                                                    if (res) {
                                                        this.updateExamModify(user, examCode)
                                                            .then(res => resolve(res != null))
                                                            .catch(err => reject(err))
                                                    }
                                                }).catch(err => reject(err))
                                        }
                                    }).catch(err => reject(err))
                            } else {
                                resolve(false)
                            }
                        }).catch(err => reject(err))
                }
            }).catch(err => reject(err))
        })
    }

    /*
    ---------------------------------------------------------------------------
    Már létező vizsga tulajdonságok módosítása
    ---------------------------------------------------------------------------
    */

    updateExamStatus = (user, examCode, status) => {
        return new Promise((resolve, reject) => {
            this.checkExamCreator(user, examCode).then(response => {
                if (response) {
                    this.con('exams').update({
                        exam_status: status,
                        exam_modifier: user,
                        exam_modified_time: this.con.fn.now()
                    }).where(this.con.raw('exam_itemcode = ?', [examCode]))
                        .then(res => resolve(res != null))
                        .catch(err => reject(err))
                }
            }).catch(err => reject(err))
        })
    }

    updateExamPoints = (user, examCode, points) => {
        return new Promise((resolve, reject) => {
            this.checkExamCreator(user, examCode).then(response => {
                if (response) {
                    this.con('exams').select('points_required')
                        .where(this.con.raw('exam_itemcode = ?', [examCode]))
                        .then(result => {
                            if (result) {
                                resolve(false)
                            } else {
                                this.con('exams').update({
                                    points_required: points,
                                    exam_modifier: user,
                                    exam_modified_time: this.con.fn.now()
                                }).where(this.con.raw('exam_itemcode = ?', [examCode]))
                                    .then(res => resolve(res != null))
                                    .catch(err => reject(err))
                            }
                        }).catch(err => reject(err))
                }
            }).catch(err => reject(err))
        })
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

    updateQuestionPic = (user, examCode, questionId, picture) => {
        return new Promise((resolve, reject) => {
            this.checkExamCreator(user, examCode).then(response => {
                if (response) {
                    this.con('questions').update({
                        picture: picture
                    }).where(this.con.raw('question_id = ?', [questionId]))
                        .then(response => {
                            if (response) {
                                this.updateExamModify(user, examCode)
                                    .then(res => resolve(res != null))
                                    .catch(err => reject(err))
                            } else {
                                resolve(false)
                            }
                        }).catch(err => reject(err))
                } else {
                    resolve(false)
                }
            }).catch(err => reject(err))
        })
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

    updateAnswer = (user, examCode, answerId, value, isBoolean) => {
        return new Promise((resolve, reject) => {
            this.checkExamCreator(user, examCode).then(result => {
                if (result) {
                    this.con('results').where(this.con.raw('results_id = ?', [answerId]))
                        .first().then(result => {
                            if (result) {
                                if (!isBoolean) {
                                    if (result.result_text === value) {
                                        resolve(false)
                                    } else {
                                        this.con('results').update({
                                            result_text: value
                                        }).where(this.con.raw('results_id = ?', [answerId]))
                                            .then(response => {
                                                if (response) {
                                                    this.updateExamModify(user, examCode)
                                                        .then(res => resolve(res != null))
                                                        .catch(err => reject(err))
                                                }
                                            }).catch(err => reject(err))
                                    }
                                } else {
                                    if (result.correct === value) {
                                        resolve(false)
                                    } else {
                                        this.con('results').update({
                                            correct: value
                                        }).where(this.con.raw('results_id = ?', [answerId]))
                                            .then(response => {
                                                if (response) {
                                                    this.updateExamModify(user, examCode)
                                                        .then(res => resolve(res != null))
                                                        .catch(err => reject(err))
                                                }
                                            }).catch(err => reject(err))
                                    }
                                }
                            } else {
                                resolve(false)
                            }
                        }).catch(err => reject(err))
                }
            }).catch(err => reject(err))
        })
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

    updateQuestion = (user, examCode, questionId, value, isNumber) => {
        return new Promise((resolve, reject) => {
            this.checkExamCreator(user, examCode).then(result => {
                if (result) {
                    this.con('questions').select(['question_name', 'points', 'question_id'])
                        .where(this.con.raw('question_id = ?', [questionId]))
                        .first().then(result => {
                            if (result) {
                                if (!isNumber) {
                                    if (result.question_name === value) {
                                        resolve(false)
                                    } else {
                                        this.con('questions').update({
                                            question_name: value
                                        }).where(this.con.raw('question_id = ?', [questionId]))
                                            .then(response => {
                                                if (response) {
                                                    this.updateExamModify(user, examCode)
                                                        .then(res => resolve(res != null))
                                                        .catch(err => reject(err))
                                                }
                                            }).catch(err => reject(err))
                                    }
                                } else {
                                    if (result.points == value) {
                                        resolve(false)
                                    } else {
                                        this.con('questions').update({
                                            points: value
                                        }).where(this.con.raw('question_id = ?', [questionId]))
                                            .then(response => {
                                                if (response) {
                                                    this.updateExamModify(user, examCode)
                                                        .then(res => resolve(res != null))
                                                        .catch(err => reject(err))
                                                }
                                            }).catch(err => reject(err))
                                    }
                                }

                            } else {
                                resolve(false)
                            }
                        }).catch(err => reject(err))
                }
            }).catch(err => reject(err))
        })
    }

    /**
     * Már létező vizsga módosítása
     * 
     * @param {string} user
     * @param {string} examName
     * @param {number | string} examCode 
     * @param {string} notes
     * @param {[0,1]} status
     * @param {number} points
     * 
     * Használt táblák: exams
     */

    updateExam = (user, examName, examCode, notes, points) => {
        return new Promise((resolve, reject) => {
            this.checkExamCreator(user, examCode)
                .then(result => {
                    if (result) {
                        this.con('exams').update({
                            exam_name: examName,
                            exam_notes: notes,
                            points_required: points,
                            exam_modifier: user,
                            exam_modified_time: this.con.fn.now()
                        })
                            .where(this.con.raw('exam_itemcode = ?', [examCode])).then(response => {
                                if (response) {
                                    resolve(true)
                                } else {
                                    resolve(false)
                                }
                            }).catch(err => reject(err))
                    }
                }).catch(err => reject(err))
        })
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

    checkExamCreator = (user, examCode) => {
        return new Promise((resolve, reject) => {
            this.con('exams').select(['exam_name', 'exam_creator'])
                .where(this.con.raw('exam_itemcode = ?', [examCode]))
                .first().then(result => {
                    if (result) {
                        resolve(result.exam_creator == user)
                    } else {
                        reject('no_exam')
                    }
                }).catch(err => reject(err))
        })
    }

    /**
     * A vizsga módosítási idejének rögzítése
     *
     * @param {string} user
     * @param {number | string} examCode
     * 
     * Használt táblák: exams
     */

    updateExamModify = (user, examCode) => {
        return new Promise((resolve, reject) => {
            this.con('exams').update({
                exam_modifier: user,
                exam_modified_time: this.con.fn.now()
            })
                .where(this.con.raw('exam_itemcode = ?', [examCode]))
                .then(response => {
                    if (response) {
                        resolve(true)
                    } else {
                        reject('exams_no_update')
                    }
                }).catch(err => reject(err))
        })
    }

    /*
    ---------------------------------------------------------------------------
    Általános vizsga műveletek
    ---------------------------------------------------------------------------
    */

    selectProducts = () => { //Lehetséges termékek kiválasztása a vizsgákhoz
        return new Promise((resolve, reject) => {
            this.con('items').select(['ProductName', 'Itemcode'])
                .leftJoin(this.con.raw('exams ON items.Itemcode = exams.exam_itemcode'))
                .where(this.con.raw('exams.exam_itemcode IS NULL'))
                .then(result => {
                    let filteredResults = []
                    result.forEach(values => {
                        filteredResults.push([values.ProductName, values.Itemcode])
                    })
                    if (filteredResults.length === result.length) {
                        resolve(filteredResults)
                    }
                }).catch(err => reject(err))
        })
    }

    selectExamDoc = (exam_itemcode, cardNum) => { //A vizsga tananyagának kiválasztása
        return new Promise((resolve, reject) => {
            this.con('workers').select('workers.worker_id')
                .innerJoin('skills', 'workers.worker_id', 'skills.worker_id').where('worker_cardcode', [cardNum])
                .then(worker => {
                    this.con('exams').where(this.con.raw('exam_itemcode = ?', [exam_itemcode])).first()
                        .then(result => {
                            resolve([worker.length !== 0 ? 0 : result.exam_status, result.exam_docs])
                        }).catch(err => {
                            reject(err)
                        })
                }).catch(err => {
                    reject(err)
                })
        })
    }

    selectLearnExams = (user, userIsAdmin) => {
        return new Promise((resolve, reject) => {
            if (userIsAdmin) {
                resolve(null)
            } else {
                this.con('workers').select('worker_id').where(this.con.raw('worker_cardcode = ?', [user])).first()
                    .then(worker => {
                        if (worker) {
                            this.con('exams')
                                .select(['exam_id', 'exam_name', 'exam_itemcode', 'exam_notes', 'exam_creation_time'])
                                .then(results => {
                                    let exams = []
                                    results.forEach((result) => {
                                        const examData = {
                                            examName: result.exam_name,
                                            itemCode: result.exam_itemcode,
                                            comment: result.exam_notes,
                                            created: result.exam_creation_time
                                        }
                                        exams.push(examData)
                                    })
                                    resolve(exams)
                                }).catch(err => reject(err))
                        }
                    }).catch(err => reject(err))
            }
        })
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
                        if (skills.findIndex(value => value.exam_id === result.exam_id) === -1) {
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
                        password: password,
                        latest_login: this.con.fn.now()
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
        let msg = false
        try {
            await this.con.transaction(async trx => {
                const login =
                    await this.con('admin_login')
                        .where(this.con.raw('cardcode = ?', [cardNum])).first().transacting(trx)
                if (login.password) {
                    await this.con('admin_login').update({
                        latest_login: this.con.fn.now()
                    }).where('cardcode', [cardNum]).transacting(trx)
                    msg = login.password === password
                }
            })
        } catch (error) {
            console.log(error.message)
        }
        return msg
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