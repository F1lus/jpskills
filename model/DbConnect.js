module.exports = class Connection {

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

    selectExamDoc = async (exam_itemcode) => {
        return await this.con('exams').where(this.con.raw('exam_itemcode = ?', [exam_itemcode])).first()
    }

    selectExams = async () =>{
        let exams = []
        await this.con('exams').then(results => {
            results.forEach((result) => {
                const examData = {
                    examName: result.exam_name,
                    itemCode: result.exam_itemcode
                }
                exams.push(examData)
            })
        }).catch(err => console.log(err))
        
        return exams
    }

    selectWholeExam = async (exam_itemcode) =>{
        let exam = await this.con('exams').select('exam_id, exam_name')
            .where(this.con.raw('exam_itemcode = ?', exam_itemcode)).first()

        let questionList = []

        await this.con('questions').where(this.con.raw('exam_id = ?', exam[0]))
            .then((questions) => {
                questions.forEach(async (question) => {
                    let currentQuestion
                    let answerList = []
                    await this.con('results').select('results_id, result_text, correct')
                        .innerJoin(this.con.raw('exam_prepare ON results.results_id = exam_prepare.results_id'))
                        .where(this.con.raw('exam_prepare.question_id = ?', question.question_id))
                        .then((answers) => {
                            answers.forEach((answer) => {
                                let currentAnswer = {
                                    id: answer.results_id,
                                    answer: answer.result_text,
                                    correct: answer.correct
                                }
                                answerList.push(currentAnswer)
                            });
                    }).catch((err) => console.log(err))
                    
                    currentQuestion = {
                        question_id: question.question_id,
                        exam_itemcode: exam_itemcode,
                        question: question.question_name,
                        points: question.points,
                        answers: answerList,
                        picture: question.picture
                    }
                    questionList.push(currentQuestion)
                })
        }).catch((err) => console.log(err))
        
        return [exam[1], questionList]
    }

    findUser = async (cardNum) =>{
        let userData = []
        await this.con('workers')
                .innerJoin(this.con.raw('admin_login ON workers.worker_cardcode = admin_login.cardcode'))
                .where(this.con.raw('workers.worker_cardcode = ?', [cardNum])).first()
                .then((result) =>{
                    if(result){
                        userData.push(result.worker_name, result.worker_usergroup)
                    }
                }).catch((err) => console.log(err))

        return userData
    }

    userExists = async (cardNum, password) =>{
        let exists = false
        await this.con('admin_login').where(this.con.raw('cardcode = ?', [cardNum]))
            .andWhere(this.con.raw('password = ?', [password])).first()
            .then((result) =>{
                if(result){
                    exists = true
                }
            }).catch((err) => console.log(err))
        return exists
        
    }

    insertExam = async (arr) =>{
        //A lekérdezések a redundancia elhárítását szolgálják

        //Exam_itemcode létezésének meghatározása
        let itemCount = await this.con('exams').count('exam_itemcode AS count')
        .where(this.con.raw('exam_itemcode = ?', [arr[0]])).first().catch(err => console.log(err))

        if(itemCount != null && itemCount.count > 0){
            return 'mysql_item_exists_error'
        }
        //Exam_form_number létezésének meghatározása
        let formCount = await this.con('exams').count('exam_form_number AS count')
        .where(this.con.raw('exam_form_number = ?', [arr[1]])).first().catch(err => console.log(err))

        if(formCount != null && formCount.count > 0){
            return 'mysql_form_exists_error'
        }
        //Exam_name létezésének meghatározása
        let nameCount = await this.con('exams').count('exam_id AS count')
        .where(this.con.raw('exam_name = ?', [arr[2]])).first().catch(err => console.log(err))

        if(nameCount != null && nameCount.count > 0){
            return 'mysql_name_exists_error'
        }
        //Ha a fenti lekérdezések nem akadályozták meg, akkor az adatok beszúrása az adatbázisba
        let result = 500
        await this.con.raw(
            'INSERT INTO exams (exam_itemcode, exam_form_number, '+
            'exam_name, exam_notes, exam_docs, exam_creator, '+
            'exam_modifier, exam_status, points_required) VALUES (?)',
        [arr]).then(() =>{
            result = 200
        }).catch((err) =>{
            result = 500
            console.log(err)
        })
        return result
    }
    
}