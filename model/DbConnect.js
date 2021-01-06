class Connection {

    constructor(){
        this.con = require('knex')({
            client: 'mysql',
            connection:{
                host: 'localhost',
                user: 'root',
                password: '',
                database: 'jpskills'
            },
            pool: { min: 0, max: 7 }
        })
    }

    selectProducts = () => {
        return new Promise((resolve, reject) => {
            this.con('items').select(['ProductName', 'Itemcode'])
            .leftJoin(this.con.raw('exams ON items.Itemcode = exams.exam_itemcode'))
            .where(this.con.raw('exams.exam_itemcode IS NULL'))
            .then(result => {
                let filteredResults = []
                result.forEach(values => {
                    filteredResults.push([values.ProductName, values.Itemcode])
                })
                if(filteredResults.length === result.length){
                    resolve(filteredResults)
                }
            }).catch(err => reject(err))
        })
    }

    selectExamDoc = (exam_itemcode) => {
        return new Promise((resolve, reject) => {
            this.con('exams').where(this.con.raw('exam_itemcode = ?', [exam_itemcode])).first()
            .then(result => {
                resolve(result.exam_docs)
            }).catch(err => {
                reject(err)
            })
        })
    }

    selectExams = () =>{
        return new Promise((resolve, reject) => {
            this.con('exams').then(results => {
                let exams = []
                results.forEach((result) => {
                    const examData = {
                        examName: result.exam_name,
                        itemCode: result.exam_itemcode
                    }
                    exams.push(examData)
                })
                resolve(exams)
            }).catch(err => reject(err))
        })
    }

    selectTest = (questions) => {
        return new Promise((resolve, reject) => {
            let questionList = new Array()
            questions.forEach( (question, index) => {
                this.con('exam_prepare')
                .where(this.con.raw('question_id = ?', [question.question_id])).then(answersIdList =>{
                    this.selectResults(answersIdList).then(result => {
                        questionList.push({
                            id: question.question_id,
                            exam_id: question.exam_id,
                            name: question.question_name,
                            points: question.points,
                            pic: question.picture,
                            answers: result
                        })
                        if(questionList.length === questions.length){
                            resolve(questionList)
                        }
                    })
                }).catch(err => reject(err))
            })
        })
    }

    selectResults = (answersIdList) =>{
        return new Promise((resolve, reject) =>{
            let result = new Array()
            answersIdList.forEach((answerId, index) =>{
                this.con('results').where(this.con.raw('results_id = ?', [answerId.results_id])).first()
                .then(answer => {
                    result.push({
                        id: answer.results_id,
                        text: answer.result_text,
                        correct: answer.correct == 1 ? true : false
                    })
                    if(index === answersIdList.length-1){
                        resolve(result)
                    }
                }).catch(err => reject(err))
            })
        })
    }

    selectWholeExam = (exam_itemcode) =>{
        return new Promise((resolve, reject) => {
            this.con('exams').select(['exam_id', 'exam_name'])
            .where(this.con.raw('exam_itemcode = ?', [exam_itemcode])).first()
            .then(exam => {
                this.con('questions').where(this.con.raw('exam_id = ?', [exam.exam_id]))
                .then(questions => {
                    if(questions.length !== 0){
                        this.selectTest(questions).then(questionList => {
                            resolve([exam.exam_name, questionList])
                        })
                    }else{
                        resolve([exam.exam_name])
                    }
                }).catch(err => reject(err))
            }).catch(err => reject(err))
        })
    }

    findUser = (cardNum) =>{
        return new Promise((resolve, reject) => {
            this.con('workers')
                .innerJoin(this.con.raw('admin_login ON workers.worker_cardcode = admin_login.cardcode'))
                .where(this.con.raw('workers.worker_cardcode = ?', [cardNum])).first()
                .then((result) =>{
                    if(result){
                        resolve([result.worker_name, result.worker_usergroup])
                    }
                }).catch(err => reject(err))
        })
    }

    userExists = (cardNum, password) =>{
        return new Promise((resolve, reject) => {
            this.con('admin_login').where(this.con.raw('cardcode = ?', [cardNum]))
            .andWhere(this.con.raw('password = ?', [password])).first()
            .then((result) =>{
                if(result){
                    resolve(true)
                }else{
                    resolve(false)
                }
            }).catch((err) => reject(err))
        })
    }

    itemCodeTest = (itemcode) => { //true -> létezik ilyen, false -> nem létezik ilyen
        return new Promise((resolve, reject) =>{
            this.con('items').count('Itemcode AS count')
            .where(this.con.raw('Itemcode = ?', [itemcode])).first().then(itemCode => {
                resolve(itemCode == null || itemCode.count == 0)
            }).catch(err => reject(err))
        })
    }

    examCodeTest = (itemcode) => {
        return new Promise((resolve, reject) => {
            this.con('exams').count('exam_itemcode AS count')
            .where(this.con.raw('exam_itemcode = ?', [itemcode])).first().then(examItem => {
                resolve(examItem != null && examItem.count > 0)
            }).catch(err => reject(err))
        })
    }

    examNameTest = (examName) => {
        return new Promise((resolve, reject) => {
            this.con('exams').count('exam_id AS count')
            .where(this.con.raw('exam_name = ?', [examName])).first().then(nameCount => {
                resolve(nameCount != null && nameCount.count > 0)
            }).catch(err => reject(err))
        })
    }

    insertExam = (arr) =>{
        return new Promise((resolve, reject) => {
            this.itemCodeTest(arr[0]).then(result => {
                if(result){
                    resolve('mysql_invalid_itemcode')
                }else{
                    this.examCodeTest(arr[0]).then(result =>{
                        if(result){
                            resolve('mysql_item_exists_error')
                        }else{
                            this.examNameTest(arr[1]).then(result => {
                                if(result){
                                    resolve('mysql_name_exists_error')
                                }else{
                                    this.con.raw(
                                        'INSERT INTO exams (exam_itemcode, exam_name, '+
                                        'exam_notes, exam_docs, exam_creator, exam_modifier) '+
                                        'VALUES (?)',
                                    [arr]).then(() =>{
                                        resolve(200)
                                    }).catch((err) =>{
                                        reject(err)
                                    })
                                }
                            }).catch(err => reject(err))
                        }
                    }).catch(err => reject(err))    
                }
            }).catch(err => reject(err))
        })
    }
    
}

module.exports = new Connection()