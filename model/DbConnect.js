const CryptoJS = require("crypto-js");

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
     * @constructor A kapcsolat kiépítése
     * @property con -> connection rövidítése, ez felel a közvetlen kapcsolatért az adatbázissal
     */

    constructor() {
        const config = require("../config");

        try {
            this.con = require("knex")({
                client: "mysql",
                connection: {
                    host: config.database.host,
                    user: config.database.user,
                    password: config.database.password,
                    database: config.database.db,
                    multipleStatements: true,
                },
                pool: {
                    min: 0,
                    max: 7,
                },
            });
        } catch (error) {
            console.log(error.message);
        }
    }

    selectAllDocuments = async () => {
        let exams = [];
        try {
            
            const examList = await this.con("exams")
                    .select([
                        "exam_id",
                        "exam_name",
                        "exam_itemcode",
                        "exam_notes",
                        "exam_creation_time",
                    ])

                examList.forEach((result) => {
                    exams.push({
                        examName: result.exam_name,
                        itemCode: result.exam_itemcode,
                        comment: result.exam_notes,
                        created: result.exam_creation_time,
                    });
                });

        } catch (error) {
            console.log(error.message);
        }
        return exams;
    }

    examCompletion = async (cardnum, examcode) => {
        let completion = 0

        try {
            
            const exams = await this.con("exams")
                .select("exams.exam_id", "exam_grouping.worker_usergroup_id")
                .innerJoin("exam_grouping", "exams.exam_id", "exam_grouping.exam_id")
                .where("exam_creator", cardnum)
                .andWhere('exam_itemcode', examcode)

            for (const exam of exams) {
                const skilled = await this.con("skills")
                    .select("worker_id")
                    .leftJoin(
                        "skill_archive",
                        "skills.skills_id",
                        "skill_archive.skills_id"
                    )
                    .where('skill_archive.skills_id', null)
                    .andWhere("skills.exam_id", exam.exam_id)

                if (!exam.worker_usergroup_id) {
                    const workers = await this.con("workers")
                        .select("worker_id")
                        .whereNot("worker_usergroup", "admin")
                        .andWhereNot("worker_usergroup", "Adminisztrátor")
                        .andWhereNot("worker_usergroup", "superuser");

                    completion += skilled.length / workers.length;
                } else {
                    const workers = await this.con("workers")
                        .select("worker_id")
                        .where("worker_usergroup_id_id", exam.worker_usergroup_id)
                        .andWhereNot("worker_usergroup", "admin")
                        .andWhereNot("worker_usergroup", "Adminisztrátor")
                        .andWhereNot("worker_usergroup", "superuser");

                    completion += skilled.length / workers.length;
                }
            }

            completion = Number.parseFloat((completion * 100).toString().substring(0, 5))

        } catch (error) {
            console.log(error.message)
        }

        return completion
    }

    userVisualizer = async cardnum => {
        let completion = 0

        try {
            
            const worker = await this.con('workers')
                .select('worker_id', 'worker_usergroup_id_id')
                .where('worker_cardcode', cardnum)
                .first()

            const exams = await this.con('exams')
                .distinct('exams.exam_id')
                .innerJoin('exam_grouping', 'exams.exam_id', 'exam_grouping.exam_id')
                .where('worker_usergroup_id', worker.worker_usergroup_id_id)
                .orWhere('worker_usergroup_id', null)

            for(const exam of exams){

                const skills = await this.con('skills')
                    .leftJoin('skill_archive', 'skills.skills_id', 'skill_archive.skills_id')
                    .where('skill_archive.skills_id', null)
                    .andWhere('exam_id', exam.exam_id)
                    .andWhere('worker_id', worker.worker_id)
                    .first()

                if(skills){
                    completion++
                }
            }

            completion = Math.round((completion / exams.length) * 100)
        } catch (error) {
            console.log(error.message)
        }

        return completion
    }

    adminGlobal = async () => {
        const globalObject = {
            completion: 0,
            avgTime: 0,
            successRate: 0,
        };

        try {
            const exams = await this.con("exams")
                .select(["exams.exam_id", "exam_grouping.worker_usergroup_id"])
                .innerJoin("exam_grouping", "exams.exam_id", "exam_grouping.exam_id");

            for (const exam of exams) {
                const skilled = await this.con("skills")
                    .select("worker_id")
                    .leftJoin(
                        "skill_archive",
                        "skills.skills_id",
                        "skill_archive.skills_id"
                    )
                    .where('skill_archive.skills_id', null)
                    .andWhere("skills.exam_id", exam.exam_id);

                if(skilled.length === 0){
                    continue
                }

                if (!exam.worker_usergroup_id) {
                    const workers = this.con("workers")
                        .select("worker_id")
                        .whereNot("worker_usergroup", "admin")
                        .andWhereNot("worker_usergroup", "Adminisztrátor")
                        .andWhereNot("worker_usergroup", "superuser");

                    globalObject.completion += ((skilled.length / (await workers).length) * 100)
                } else {
                    const workers = this.con("workers")
                        .select("worker_id")
                        .where("worker_usergroup_id_id", exam.worker_usergroup_id)
                        .andWhereNot("worker_usergroup", "admin")
                        .andWhereNot("worker_usergroup", "Adminisztrátor")
                        .andWhereNot("worker_usergroup", "superuser");

                    globalObject.completion += ((skilled.length / (await workers).length) * 100)
                }
            }

            globalObject.completion = Number.parseFloat(globalObject.completion.toString().substring(0, 5))

            const skilled = await this.con("skills")
                .leftJoin(
                    "skill_archive",
                    "skills.skills_id",
                    "skill_archive.skills_id"
                )
                .where('skill_archive.skills_id', null)

            for (const skill of skilled) {
                globalObject.successRate += skill.completed === 1 ? 1 : 0;
                globalObject.avgTime += skill.time;
            }

            globalObject.successRate =
                ((globalObject.successRate / skilled.length) * 100)
                    .toString()
                    .substring(0, 5) + "%";
            globalObject.avgTime = `${Math.floor(
                globalObject.avgTime / skilled.length / 60
            )} p ${Math.round((globalObject.avgTime / skilled.length) % 60)} mp`;
        } catch (error) {
            console.log(error.message);
        }

        return globalObject;
    };

    adminCompletionRate = async (cardnum) => {
        let completion = 0;

        try {
            const exams = await this.con("exams")
                .select(["exams.exam_id", "exam_grouping.worker_usergroup_id"])
                .innerJoin("exam_grouping", "exams.exam_id", "exam_grouping.exam_id")
                .where("exam_creator", cardnum);

            for (const exam of exams) {
                const skilled = this.con("skills")
                    .distinct("worker_id")
                    .leftJoin(
                        "skill_archive",
                        "skills.skills_id",
                        'skill_archive.skills_id'
                    )
                    .where('skill_archive.skills_id', null)
                    .andWhere("skills.exam_id", exam.exam_id);

                if (!exam.worker_usergroup_id) {
                    const workers = this.con("workers")
                        .select("worker_id")
                        .whereNot("worker_usergroup", "admin")
                        .andWhereNot("worker_usergroup", "Adminisztrátor")
                        .andWhereNot("worker_usergroup", "superuser");

                    completion += (await skilled).length / (await workers).length;
                } else {
                    const workers = this.con("workers")
                        .select("worker_id")
                        .where("worker_usergroup_id_id", exam.worker_usergroup_id)
                        .andWhereNot("worker_usergroup", "admin")
                        .andWhereNot("worker_usergroup", "Adminisztrátor")
                        .andWhereNot("worker_usergroup", "superuser");

                    completion += (await skilled).length / (await workers).length;
                }
            }

            completion = Number.parseFloat((completion * 100).toString().substring(0, 5))
        } catch (error) {
            console.log(error.message);
        }

        return completion;
    };

    selectUsers = async (cardnum) => {
        const result = [];
        try {
            const users = await this.con("workers")
                .select(["worker_name", "worker_cardcode"])
                .whereNot("worker_usergroup", "Adminisztrátor")
                .andWhereNot("worker_usergroup", "admin")
                .andWhereNot("worker_usergroup", "superuser");

            users.forEach((user) => result.push(user));
        } catch (error) {
            console.log(error.message);
        }
        return result;
    };

    deleteAdmin = async (cardcode, replaceAdmin) => {
        try {
            await this.con.transaction(async (trx) => {
                const validCardcode = await this.con("admin_login")
                    .select("cardcode")
                    .where(this.con.raw("cardcode = ?", cardcode))
                    .first()
                    .transacting(trx);

                const validAdmin = await this.con("admin_login")
                    .select("cardcode")
                    .where(this.con.raw("cardcode = ?", replaceAdmin))
                    .first()
                    .transacting(trx);

                if (validCardcode && validAdmin) {
                    await this.con("exams")
                        .update({
                            exam_creator: validAdmin.cardcode,
                        })
                        .where("exam_creator", validCardcode.cardcode)
                        .transacting(trx);

                    await this.con("admin_login")
                        .delete()
                        .where("cardcode", validCardcode.cardcode)
                        .transacting(trx);
                }
            });
        } catch (error) {
            console.log(error.message);
        }
    };

    selectExamsByCreator = async (cardcode) => {
        const exams = [];

        try {
            const selectedExams = await this.con("exams")
                .select([
                    "exam_id",
                    "exam_name",
                    "exam_creation_time",
                    "exam_modified_time",
                    "exam_itemcode",
                ])
                .where(this.con.raw("exam_creator = ?", cardcode));

            selectedExams.forEach((exam) => {
                exams.push({
                    id: exam.exam_id,
                    examName: exam.exam_name,
                    examCode: exam.exam_itemcode,
                    created: exam.exam_creation_time,
                    modified: exam.exam_modified_time || "-",
                });
            });
        } catch (error) {
            console.log(error.message);
        }

        return exams;
    };

    selectUserGroups = async () => {
        const groups = [];
        try {
            const rawGroups = await this.con("workers")
                .distinct("worker_usergroup_id_id", "worker_usergroup")
                .whereNot("worker_usergroup", "admin")
                .andWhereNot("worker_usergroup", "Adminisztrátor")
                .andWhereNot("worker_usergroup", "superuser");

            rawGroups.forEach((group) => {
                groups.push({
                    id: group.worker_usergroup_id_id,
                    groupName: group.worker_usergroup,
                });
            });
        } catch (error) {
            console.log(error.message);
        }
        return groups;
    };

    archiveUser = async (workerId, superUserCardcode) => {
        try {
            const skills = await this.con("skills").where(
                this.con.raw("worker_id = ?", workerId)
            );

            if (skills.length === 0) {
                return;
            }
            const skillArray = skills.map((skill) => {
                return {
                    examId: skill.exam_id,
                    workerId: skill.worker_id,
                    skillId: skill.skills_id,
                };
            });

            await this.archiveExams(skillArray, superUserCardcode);
        } catch (error) {
            console.log(error.message);
        }
    };

    selectArchivedSkills = async (cardNum) => {
        const skills = [];
        try {
            const worker = await this.con("workers")
                .select("worker_id")
                .where(this.con.raw("worker_cardcode = ?", cardNum))
                .first();

            const archived = await this.con("skills")
                .innerJoin(
                    "skill_archive",
                    "skills.skills_id",
                    "skill_archive.skills_id"
                )
                .where("worker_id", worker.worker_id);

            for (const skill of archived) {
                const exam = await this.con("exams")
                    .select("exam_name")
                    .where("exam_id", skill.exam_id)
                    .first();

                const archiver = await this.con("workers")
                    .select("worker_name")
                    .where("worker_id", skill.archiver_id)
                    .first();

                skills.push({
                    skillId: skill.skills_id,
                    archiveId: skill.archive_id,
                    workerId: skill.worker_id,
                    examId: skill.exam_id,
                    examName: exam.exam_name,
                    completed: skill.completed === 1,
                    archiver: archiver.worker_name,
                });
            }
        } catch (error) {
            console.log(error.message);
        }
        return skills;
    };

    removeArchivedExam = async (archiveId) => {
        try {
            await this.con.transaction(async (trx) => {

                for(const id of archiveId){
                    await this.con("skill_archive")
                        .delete()
                        .where(this.con.raw("archive_id = ?", id))
                        .transacting(trx);
                }

            });
        } catch (error) {
            console.log(error.message);
        }
    };

    archiveExams = async (skillArray, superUserCardcode) => {
        try {
            await this.con.transaction(async (trx) => {
                for (const skill of skillArray) {
                    const skillId = await this.con("skills")
                        .select("skills.skills_id")
                        .leftJoin(
                            "skill_archive",
                            "skills.skills_id",
                            "skill_archive.skills_id"
                        )
                        //.where("skill_archive.skills_id", null)
                        .andWhere(this.con.raw("skills.skills_id = ?", skill.skillId))
                        .first()
                        .transacting(trx);

                    if (skillId) {
                        const superuser = await this.con("workers")
                            .select("worker_id")
                            .where("worker_cardcode", superUserCardcode)
                            .first()
                            .transacting(trx);

                        await this.con("skill_archive")
                            .insert({
                                skills_id: skillId.skills_id,
                                archiver_id: superuser.worker_id,
                            })
                            .transacting(trx);
                    }
                }
            });
        } catch (error) {
            console.log(error.message);
        }
    };

    removeUserSkill = async (skillArray) => {
        try {
            await this.con.transaction(async (trx) => {
                
                for(const skill of skillArray){
                    await this.con("skills")
                    .delete()
                    .where(this.con.raw("skills_id = ?", skill.skillId))
                    .andWhere(this.con.raw('worker_id = ?', skill.workerId))
                    .andWhere(this.con.raw('exam_id = ?', skill.examId))
                    .limit(1)
                    .transacting(trx);
                }
            });
        } catch (error) {
            console.log(error.message);
        }
    };

    getAdmins = async (cardcode) => {
        const admins = [];

        try {
            const validAdmins = await this.con("admin_login")
                .select("cardcode")
                .where(this.con.raw("cardcode <> ?", cardcode));

            for (const admin of validAdmins) {
                const workerData = await this.con("workers")
                    .select(["worker_name", "worker_cardcode", "worker_usergroup"])
                    .where("worker_cardcode", admin.cardcode)
                    .first();

                if (workerData) {
                    if (
                        workerData.worker_usergroup === "admin" ||
                        workerData.worker_usergroup === "Adminisztrátor"
                    ) {
                        admins.push({
                            name: workerData.worker_name,
                            cardcode: workerData.worker_cardcode,
                        });
                    }
                }
            }
        } catch (error) {
            console.log(error.message);
        }

        return admins;
    };

    getSpecificUser = async (cardcode) => {
        return (await this.getExistingUsers(0)).filter(
            (user) => user.cardcode == cardcode
        );
    };

    getExistingUsers = async (cardcode) => {
        const users = [];

        try {
            const existingUsers = await this.con("workers")
                .select([
                    "worker_cardcode",
                    "worker_id",
                    "worker_name",
                    "worker_usergroup",
                    "worker_active",
                ])
                .whereNot("worker_cardcode", cardcode);
            existingUsers.forEach((user) => {
                users.push({
                    id: user.worker_id,
                    name: user.worker_name,
                    group: user.worker_usergroup,
                    cardcode: user.worker_cardcode,
                    isActive: user.worker_active === 1,
                });
            });
        } catch (error) {
            console.log(error.message);
        }

        return users;
    };

    globalStatisticsForAdmin = async (cardNum) => {
        const stats = [];
        try {
            const exams = await this.con("exams")
                .select([
                    "exams.exam_id",
                    "exam_itemcode",
                    "exam_name",
                    "points_required",
                    "points",
                    "time",
                    "completed",
                    "worker_id",
                ])
                .innerJoin("skills", "exams.exam_id", "skills.exam_id")
                .leftJoin(
                    "skill_archive",
                    "skills.skills_id",
                    "skill_archive.skills_id"
                )
                .where('skill_archive.skills_id', null)
                .andWhere("exam_creator", cardNum);

            for (const exam of exams) {
                const worker = await this.con("workers")
                    .select("worker_name")
                    .where("worker_id", [exam.worker_id])
                    .first();

                if (worker) {
                    stats.push({
                        examName: exam.exam_name,
                        examCode: exam.exam_itemcode,
                        minScore: exam.points_required,
                        score: exam.points,
                        time: exam.time,
                        completed: exam.completed === 1,
                        worker: worker.worker_name,
                    });
                }
            }
        } catch (error) {
            console.log(error.message);
        }
        return stats;
    };

    globalStatisticsForUser = async (cardNum, getArchived) => {
        const stats = [];
        try {
            const worker = await this.con("workers")
                .select(["worker_id", "worker_name"])
                .where("worker_cardcode", cardNum)
                .first();

            if (worker) {
                if (getArchived) {
                    const skills = await this.con("skills")
                        .select([
                            "skills.skills_id",
                            "skills.exam_id",
                            "exam_itemcode",
                            "exam_name",
                            "points_required",
                            "points",
                            "time",
                            "completed",
                        ])
                        .innerJoin("exams", "skills.exam_id", "exams.exam_id")
                        .leftJoin(
                            "skill_archive",
                            "skills.skills_id",
                            "skill_archive.skills_id"
                        )
                        .where('skill_archive.skills_id', null)
                        .andWhere("worker_id", [worker.worker_id]);

                    skills.forEach((skill) => {
                        stats.push({
                            skillId: skill.skills_id,
                            examId: skill.exam_id,
                            workerId: worker.worker_id,
                            examName: skill.exam_name,
                            examCode: skill.exam_itemcode,
                            minScore: skill.points_required,
                            score: skill.points,
                            time: skill.time,
                            completed: skill.completed === 1,
                            worker: worker.worker_name,
                        });
                    });
                } else {
                    const skills = await this.con("skills")
                        .select([
                            "skills.skills_id",
                            "skills.exam_id",
                            "exam_itemcode",
                            "exam_name",
                            "points_required",
                            "points",
                            "time",
                            "completed",
                        ])
                        .innerJoin(this.con.raw("exams ON skills.exam_id = exams.exam_id"))
                        .leftJoin(
                            "skill_archive",
                            "skills.skills_id",
                            "skill_archive.skills_id"
                        )
                        .where("skill_archive.skills_id", null)
                        .andWhere("worker_id", [worker.worker_id]);

                    skills.forEach((skill) => {
                        stats.push({
                            skillId: skill.skills_id,
                            examId: skill.exam_id,
                            workerId: worker.worker_id,
                            examName: skill.exam_name,
                            examCode: skill.exam_itemcode,
                            minScore: skill.points_required,
                            score: skill.points,
                            time: skill.time,
                            completed: skill.completed === 1,
                            worker: worker.worker_name,
                        });
                    });
                }
            }
        } catch (error) {
            console.log(error.message);
        }
        return stats;
    };

    selectSkill = async (examCode, cardNum) => {
        const skill = [];
        try {
            const exam = await this.con("exams")
                .select(["exam_id", "exam_name", "points_required"])
                .where(this.con.raw("exam_itemcode = ?", [examCode]))
                .first();

            if (exam) {
                const worker = await this.con("workers")
                    .select("worker_id")
                    .where("worker_cardcode", cardNum)
                    .first();

                if (worker) {
                    const skills = await this.con("skills")
                        .where("worker_id", worker.worker_id)
                        .andWhere("exam_id", exam.exam_id);

                    const skillResult = skills[skills.length - 1];

                    const maxPoints = await this.countExamMaxPoints(exam.exam_id);

                    if (skillResult && maxPoints) {
                        skill.push(
                            exam.exam_name,
                            exam.points_required,
                            skillResult.points,
                            skillResult.time,
                            skillResult.completed,
                            maxPoints
                        );
                    }
                }
            }
        } catch (error) {
            console.log(error.message);
        }
        return skill;
    };

    countExamMaxPoints = async (examId) => {
        let maxPoints = 0;
        try {
            const questions = await this.con("questions")
                .select(["question_id", "points"])
                .where("exam_id", [examId]);

            for (const question of questions) {
                const answers = await this.con("exam_prepare")
                    .select("exam_prepare.results_id")
                    .innerJoin(
                        this.con.raw(
                            "results ON exam_prepare.results_id = results.results_id"
                        )
                    )
                    .where("question_id", [question.question_id])
                    .andWhere("correct", 1);

                if (answers.length > 0) {
                    maxPoints += question.points * answers.length;
                }
            }
        } catch (error) {
            console.log(error.message);
        }
        return maxPoints;
    };

    processAnswers = async (answers, examCode, cardNum, time) => {
        let success = false;
        try {
            const exam = await this.con("exams")
                .select(["exam_status", "exam_id"])
                .where("exam_itemcode", [examCode])
                .first();

            const worker = await this.con("workers")
                .select("worker_id")
                .where(this.con.raw("worker_cardcode = ?", [cardNum]))
                .first();

            const skillExists = await this.con("skills")
                .leftJoin(
                    "skill_archive",
                    "skills.skills_id",
                    "skill_archive.skills_id"
                )
                .where("skill_archive.skills_id", null)
                .andWhere("worker_id", worker.worker_id)
                .andWhere("exam_id", exam.exam_id);

            if (skillExists.length > 0) {
                return success;
            }

            if (exam.exam_status === 1) {
                let maxQuestionPoints = 0;
                let totalPoints = 0;
                for (const answerObj of answers) {
                    const results = await this.con("results")
                        .select("results.results_id")
                        .innerJoin(
                            this.con.raw(
                                "exam_prepare ON results.results_id = exam_prepare.results_id"
                            )
                        )
                        .where(this.con.raw("exam_prepare.question_id = ?", [answerObj.id]))
                        .andWhere("correct", 1);

                    const question = await this.con("questions")
                        .select(["question_id", "points"])
                        .where(this.con.raw("question_id = ?", [answerObj.id]))
                        .first();

                    if (results.length > 0 && question) {
                        maxQuestionPoints += question.points * results.length;
                        let questionPoints = 0;

                        for (const answer of answerObj.answers) {
                            if (
                                results.findIndex((value) => value.results_id === answer) >
                                -1 &&
                                answerObj.answers.length > 0 &&
                                answerObj.answers.length <= results.length
                            ) {
                                totalPoints += question.points;
                                questionPoints += question.points;
                            }
                        }

                        await this.uploadPartialResults(
                            worker.worker_id,
                            question.question_id,
                            questionPoints
                        );
                    }
                }

                success = await this.uploadResults(
                    examCode,
                    totalPoints,
                    time,
                    maxQuestionPoints,
                    worker.worker_id
                );
            }
        } catch (error) {
            console.log(error.message);
        }
        return success;
    };

    uploadResults = async (examCode, totalPoints, time, maxPoints, workerId) => {
        let success = false;
        try {
            await this.con.transaction(async (trx) => {
                const exam = await this.con("exams")
                    .select(["exam_id", "points_required"])
                    .where(this.con.raw("exam_itemcode = ?", [examCode]))
                    .first()
                    .transacting(trx);

                if (exam) {
                    const completed =
                        totalPoints >= Math.round(exam.points_required * maxPoints) ? 1 : 0;
                    const insert = await this.con("skills")
                        .insert({
                            worker_id: workerId,
                            exam_id: exam.exam_id,
                            points: totalPoints,
                            time: time,
                            completed: completed,
                        })
                        .transacting(trx);

                    if (insert) {
                        success = insert[0].insertId !== 0;
                    }
                }
            });
        } catch (error) {
            console.log(error.message);
        }
        return success;
    };

    uploadPartialResults = async (workerId, questionId, points) => {
        let success = false;
        try {
            await this.con.transaction(async (trx) => {
                const insert = await this.con("exam_result")
                    .insert({
                        worker_id: workerId,
                        question_id: questionId,
                        points: points,
                    })
                    .transacting(trx);

                if (insert) {
                    success = insert[0].insertId !== 0;
                }
            });
        } catch (error) {
            console.log(error.message);
        }
        return success;
    };

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
        let success = false;
        try {
            await this.con.transaction(async (trx) => {
                const validUser = await this.checkExamCreator(user, examCode);
                if (validUser) {
                    const exam = await this.con("exams")
                        .where(this.con.raw("exam_itemcode = ?", [examCode]))
                        .first()
                        .transacting(trx);

                    if (exam) {
                        await this.removeMultipleQuestions(exam.exam_id, user, examCode);

                        const del = await this.con("exams")
                            .delete()
                            .where(this.con.raw("exam_itemcode = ?", [examCode]))
                            .transacting(trx);

                        if (del) {
                            success = true;
                        }
                    }
                }
            });
        } catch (error) {
            console.log(error.message);
        }
        return success;
    };

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
            const questions = await this.con("questions").where(
                this.con.raw("exam_id = ?", [examId])
            );
            if (questions.length !== 0) {
                for (const question of questions) {
                    await this.removeQuestion(user, question.question_id, examCode);
                }
            }
        } catch (error) {
            console.log(error.message);
        }
    };

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
        let success = false;
        try {
            await this.con.transaction(async (trx) => {
                const validUser = await this.checkExamCreator(user, examCode);
                if (validUser) {
                    const resultIds = await this.con("exam_prepare")
                        .where(this.con.raw("question_id = ?", [questionId]))
                        .transacting(trx);

                    if (resultIds) {
                        await this.removeMultipleAnswers(resultIds);
                    }
                    await this.con("questions")
                        .delete()
                        .where(this.con.raw("question_id = ?", [questionId]))
                        .transacting(trx);

                    success = await this.updateExamModify(user, examCode, trx);
                }
            });
        } catch (error) {
            console.log(error.message);
        }
        return success;
    };

    /**
     * Adott kérdéshez tartozó összes válasz törlése
     *
     * @param {number[]} resultIds
     *
     * Használt táblák: results
     */

    removeMultipleAnswers = async (resultIds) => {
        try {
            await this.con.transaction(async (trx) => {
                for (const id of resultIds) {
                    await this.con("results")
                        .delete()
                        .where(this.con.raw("results_id = ?", [id.results_id]))
                        .transacting(trx);
                }
            });
        } catch (error) {
            console.log(error.message);
        }
    };

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
        let success = false;
        try {
            await this.con.transaction(async (trx) => {
                const validUser = this.checkExamCreator(user, examCode);

                if (validUser) {
                    const del = await this.con("results")
                        .delete()
                        .where(this.con.raw("results_id = ?", [answerId]))
                        .transacting(trx);

                    if (del) {
                        success = await this.updateExamModify(user, examCode, trx);
                    }
                }
            });
        } catch (error) {
            console.log(error.message);
        }
        return success;
    };

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
        let success = false;
        try {
            await this.con.transaction(async (trx) => {
                const validUser = await this.checkExamCreator(user, examCode);

                if (validUser) {
                    const exam = await this.con("exams")
                        .where(this.con.raw("exam_itemcode = ?", [examCode]))
                        .first()
                        .transacting(trx);

                    if (exam) {
                        const insert = await this.con("questions")
                            .insert({
                                exam_id: exam.exam_id,
                                question_name: text,
                                points: points,
                                picture: picture,
                            })
                            .transacting(trx);

                        if (insert[0].insertId !== 0) {
                            success = await this.updateExamModify(user, examCode, trx);
                        }
                    }
                }
            });
        } catch (error) {
            console.log(error.message);
        }
        return success;
    };

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
        let success = false;
        try {
            await this.con.transaction(async (trx) => {
                const validUser = await this.checkExamCreator(user, examCode);

                if (validUser) {
                    const question = await this.con("questions")
                        .select("question_id")
                        .where(this.con.raw("question_id = ?", [questionId]))
                        .first()
                        .transacting(trx);

                    if (question) {
                        let answerArray = [answerText, value];
                        const insertAnswer = await this.con
                            .raw("INSERT INTO results (result_text, correct) VALUES(?)", [
                                answerArray,
                            ])
                            .transacting(trx);

                        if (insertAnswer[0].insertId !== 0) {
                            const insertLink = await this.con("exam_prepare")
                                .insert({
                                    question_id: question.question_id,
                                    results_id: insertAnswer[0].insertId,
                                })
                                .transacting(trx);

                            if (insertLink[0].insertId !== 0) {
                                success = await this.updateExamModify(user, examCode, trx);
                            }
                        }
                    }
                }
            });
        } catch (error) {
            console.log(error.message);
        }
        return success;
    };

    /*
      ---------------------------------------------------------------------------
      Már létező vizsga tulajdonságok módosítása
      ---------------------------------------------------------------------------
      */

    updateExamStatus = async (user, examCode, status) => {
        let success = false;
        try {
            await this.con.transaction(async (trx) => {
                const validUser = await this.checkExamCreator(user, examCode);

                if (validUser) {
                    const update = await this.con("exams")
                        .update({
                            exam_status: status,
                            exam_modifier: user,
                            exam_modified_time: this.con.fn.now(),
                        })
                        .where(this.con.raw("exam_itemcode = ?", [examCode]))
                        .transacting(trx);

                    if (update) {
                        success = true;
                    }
                }
            });
        } catch (error) {
            console.log(error.message);
        }
        return success;
    };

    updateExamPoints = async (user, examCode, points) => {
        let success = false;
        try {
            await this.con.transaction(async (trx) => {
                const validUser = this.checkExamCreator(user, examCode);

                if (validUser) {
                    const exam = await this.con("exams")
                        .select("exam_id")
                        .where(this.con.raw("exam_itemcode = ?", [examCode]))
                        .transacting(trx);

                    if (exam.length !== 0) {
                        const update = await this.con("exams")
                            .update({
                                points_required: points,
                                exam_modifier: user,
                                exam_modified_time: this.con.fn.now(),
                            })
                            .where(this.con.raw("exam_itemcode = ?", [examCode]))
                            .transacting(trx);

                        if (update) {
                            success = true;
                        }
                    }
                }
            });
        } catch (error) {
            console.log(error.message);
        }
        return success;
    };

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
        let success = false;
        try {
            await this.con.transaction(async (trx) => {
                const validUser = await this.checkExamCreator(user, examCode);

                if (validUser) {
                    const update = await this.con("questions")
                        .update({
                            picture: picture,
                        })
                        .where(this.con.raw("question_id = ?", [questionId]))
                        .transacting(trx);

                    if (update) {
                        success = await this.updateExamModify(user, examCode, trx);
                    }
                }
            });
        } catch (error) {
            console.log(error.message);
        }
        return success;
    };

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

    updateAnswer = async (user, examCode, answerId, value) => {
        let success = false;
        try {
            await this.con.transaction(async (trx) => {
                const validUser = await this.checkExamCreator(user, examCode);

                if (validUser) {
                    const result = await this.con("results")
                        .where(this.con.raw("results_id = ?", [answerId]))
                        .first()
                        .transacting(trx);

                    let update = null;
                    if (
                        result &&
                        !(value === "0" || value === "1") &&
                        typeof value !== "boolean"
                    ) {
                        update = await this.con("results")
                            .update({
                                result_text: value,
                            })
                            .where(this.con.raw("results_id = ?", [answerId]))
                            .transacting(trx);
                    } else if (
                        (result && value === "0") ||
                        value === "1" ||
                        typeof value === "boolean"
                    ) {
                        update = await this.con("results")
                            .update({
                                correct: value,
                            })
                            .where(this.con.raw("results_id = ?", [answerId]))
                            .transacting(trx);
                    }

                    if (update != null) {
                        success = await this.updateExamModify(user, examCode, trx);
                    }
                }
            });
        } catch (error) {
            console.log(error.message);
        }
        return success;
    };

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

    updateQuestion = async (user, examCode, questionId, value, type) => {
        let success = false;
        try {
            await this.con.transaction(async (trx) => {
                const validUser = await this.checkExamCreator(user, examCode);
                if (validUser) {
                    const question = await this.con("questions")
                        .select(["question_name", "points", "question_id"])
                        .where(this.con.raw("question_id = ?", [questionId]))
                        .first()
                        .transacting(trx);

                    let update = null;

                    if (question && type === "text") {
                        update = await this.con("questions")
                            .update({
                                question_name: value,
                            })
                            .where(this.con.raw("question_id = ?", [questionId]))
                            .transacting(trx);
                    } else if (question && type === "number") {
                        update = await this.con("questions")
                            .update({
                                points: value,
                            })
                            .where(this.con.raw("question_id = ?", [questionId]))
                            .transacting(trx);
                    }

                    if (update != null) {
                        success = await this.updateExamModify(user, examCode, trx);
                    }
                }
            });
        } catch (error) {
            console.log(error.message);
        }
        return success;
    };

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
        let success = false;
        try {
            await this.con.transaction(async (trx) => {
                const validUser = await this.checkExamCreator(user, examCode);

                if (validUser) {
                    const examNameCheck = await this.con("exams")
                        .where(this.con.raw("exam_name = ?", [examName]))
                        .andWhere(this.con.raw("exam_itemcode <> ?", [examCode]))
                        .transacting(trx);

                    if (examNameCheck.length === 0) {
                        const update = await this.con("exams")
                            .update({
                                exam_name: examName,
                                exam_notes: notes,
                                points_required: points,
                                exam_modifier: user,
                                exam_modified_time: this.con.fn.now(),
                            })
                            .where(this.con.raw("exam_itemcode = ?", [examCode]))
                            .transacting(trx);

                        if (update) {
                            success = true;
                        }
                    }
                }
            });
        } catch (error) {
            console.log(error.message);
        }
        return success;
    };

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
        let isValid = false;
        try {
            const exam = await this.con("exams")
                .select("exam_creator")
                .where(this.con.raw("exam_itemcode = ?", [examCode]))
                .first();

            isValid = exam.exam_creator == user;
        } catch (error) {
            console.log(error.message);
        }
        return isValid;
    };

    /**
     * A vizsga módosítási idejének rögzítése
     *
     * @param {string} user
     * @param {number | string} examCode
     *
     * Használt táblák: exams
     */

    updateExamModify = async (user, examCode, trx) => {
        let updated = false;
        try {
            const updater = await this.con("exams")
                .update({
                    exam_modifier: user,
                    exam_modified_time: this.con.fn.now(),
                })
                .where(this.con.raw("exam_itemcode = ?", [examCode]))
                .transacting(trx);
            updated = updater === 1;
        } catch (error) {
            console.log(error.message);
        }
        return updated;
    };

    /*
      ---------------------------------------------------------------------------
      Általános vizsga műveletek
      ---------------------------------------------------------------------------
      */

    selectProductTypes = async () => {
        let types = [];
        try {
            const typeList = await this.con("items").distinct("Types");

            typeList.forEach((type) => {
                types.push(type.Types);
            });
        } catch (error) {
            console.log(error.message);
        }
        return types;
    };

    selectProducts = async (productType) => {
        //Lehetséges termékek kiválasztása a vizsgákhoz
        let filteredResults = [];
        try {
            let items = [];
            if (productType) {
                items = await this.con("items")
                    .select(["ProductName", "Itemcode"])
                    .leftJoin("exams", "items.Itemcode", "exams.exam_itemcode")
                    .where("exams.exam_itemcode", null)
                    .andWhere(this.con.raw("Types = ?", [productType]));
            } else {
                items = await this.con("items")
                    .select(["ProductName", "Itemcode"])
                    .leftJoin("exams", "items.Itemcode", "exams.exam_itemcode")
                    .where("exams.exam_itemcode", null);
            }

            items.forEach((item) => {
                filteredResults.push([item.ProductName, item.Itemcode]);
            });
        } catch (error) {
            console.log(error.message);
        }
        return filteredResults;
    };

    selectExamDoc = async (exam_itemcode, cardNum, userIsAdmin) => {
        //A vizsga tananyagának kiválasztása
        let result = [];
        try {
            if (!userIsAdmin) {
                const exam = await this.con("exams")
                    .where(this.con.raw("exam_itemcode = ?", [exam_itemcode]))
                    .first();

                const skill = await this.con("workers")
                    .select("workers.worker_id")
                    .innerJoin("skills", "workers.worker_id", "skills.worker_id")
                    .where("worker_cardcode", [cardNum])
                    .andWhere("exam_id", [exam.exam_id]);

                result.push(skill.length !== 0 ? 0 : exam.exam_status, exam.exam_docs);
            } else {
                const exam = await this.con("exams")
                    .where(this.con.raw("exam_itemcode = ?", [exam_itemcode]))
                    .first();

                result.push(0, exam.exam_docs);
            }
        } catch (error) {
            console.log(error.message);
        }
        return result;
    };

    selectLearnExams = async (userIsAdmin, cardcode) => {
        let exams = [];
        try {
            if (!userIsAdmin) {
                const worker = await this.con("workers")
                    .select("worker_usergroup_id_id")
                    .where("worker_cardcode", cardcode)
                    .first();

                const examList = await this.con("exams")
                    .select([
                        "exams.exam_id",
                        "exam_name",
                        "exam_itemcode",
                        "exam_notes",
                        "exam_creation_time",
                        "worker_usergroup_id",
                    ])
                    .innerJoin("exam_grouping", "exams.exam_id", "exam_grouping.exam_id");

                examList.forEach((result) => {
                    if (result.worker_usergroup_id != null) {
                        if (result.worker_usergroup_id === worker.worker_usergroup_id_id) {
                            exams.push({
                                examName: result.exam_name,
                                itemCode: result.exam_itemcode,
                                comment: result.exam_notes,
                                created: result.exam_creation_time,
                            });
                        }
                    } else {
                        exams.push({
                            examName: result.exam_name,
                            itemCode: result.exam_itemcode,
                            comment: result.exam_notes,
                            created: result.exam_creation_time,
                        });
                    }
                });
            } else {
                const examList = await this.con("exams")
                    .select([
                        "exam_id",
                        "exam_name",
                        "exam_itemcode",
                        "exam_notes",
                        "exam_creation_time",
                    ])
                    .where("exam_creator", cardcode);

                examList.forEach((result) => {
                    exams.push({
                        examName: result.exam_name,
                        itemCode: result.exam_itemcode,
                        comment: result.exam_notes,
                        created: result.exam_creation_time,
                    });
                });
            }
        } catch (error) {
            console.log(error.message);
        }
        return exams;
    };

    selectExams = async (user, userIsAdmin) => {
        let exams = [];
        try {
            if (userIsAdmin) {
                const examList = await this.con("exams")
                    .select([
                        "exam_name",
                        "exam_itemcode",
                        "exam_notes",
                        "exam_status",
                        "exam_creation_time",
                        "worker_usergroup_id",
                    ])
                    .innerJoin("exam_grouping", "exams.exam_id", "exam_grouping.exam_id")
                    .where("exam_creator", [user])
                    .groupBy(["exams.exam_id"]);

                for (const exam of examList) {
                    if (exam.worker_usergroup_id == null) {
                        exams.push({
                            examName: exam.exam_name,
                            itemCode: exam.exam_itemcode,
                            comment: exam.exam_notes,
                            status: exam.exam_status,
                            created: exam.exam_creation_time,
                            group: "Nincs",
                        });
                    } else {
                        exams.push({
                            examName: exam.exam_name,
                            itemCode: exam.exam_itemcode,
                            comment: exam.exam_notes,
                            status: exam.exam_status,
                            created: exam.exam_creation_time,
                            group: "Egy vagy több",
                        });
                    }
                }
            } else {
                const worker = await this.con("workers")
                    .select(["worker_id", "worker_usergroup_id_id", "worker_usergroup"])
                    .where("worker_cardcode", user)
                    .first();

                if (worker) {
                    const examList = await this.con("exams")
                        .select([
                            "exams.exam_id",
                            "exam_name",
                            "exam_itemcode",
                            "exam_notes",
                            "exam_status",
                            "exam_creation_time",
                            "worker_usergroup_id",
                        ])
                        .innerJoin(
                            "exam_grouping",
                            "exams.exam_id",
                            "exam_grouping.exam_id"
                        )
                        .andWhere("exam_status", 1);
                    for (const exam of examList) {
                        const skills = await this.con("skills")
                            .where("exam_id", exam.exam_id)
                            .andWhere("worker_id", worker.worker_id);
                        if (skills.length > 0) {
                            const archived = await this.con("skills")
                                .innerJoin(
                                    "skill_archive",
                                    "skills.skills_id",
                                    "skill_archive.skills_id"
                                )
                                .where("exam_id", exam.exam_id)
                                .andWhere("worker_id", worker.worker_id);

                            if (skills.length === archived.length) {
                                if (exam.worker_usergroup_id != null) {
                                    if (
                                        exam.worker_usergroup_id == worker.worker_usergroup_id_id
                                    ) {
                                        exams.push({
                                            examName: exam.exam_name,
                                            itemCode: exam.exam_itemcode,
                                            comment: exam.exam_notes,
                                            status: exam.exam_status,
                                            created: exam.exam_creation_time,
                                            group: worker.worker_usergroup,
                                        });
                                    }
                                } else {
                                    exams.push({
                                        examName: exam.exam_name,
                                        itemCode: exam.exam_itemcode,
                                        comment: exam.exam_notes,
                                        status: exam.exam_status,
                                        created: exam.exam_creation_time,
                                        group: "Mindenki",
                                    });
                                }
                            }
                        } else {
                            if (exam.worker_usergroup_id != null) {
                                if (exam.worker_usergroup_id == worker.worker_usergroup_id_id) {
                                    exams.push({
                                        examName: exam.exam_name,
                                        itemCode: exam.exam_itemcode,
                                        comment: exam.exam_notes,
                                        status: exam.exam_status,
                                        created: exam.exam_creation_time,
                                        group: worker.worker_usergroup,
                                    });
                                }
                            } else {
                                exams.push({
                                    examName: exam.exam_name,
                                    itemCode: exam.exam_itemcode,
                                    comment: exam.exam_notes,
                                    status: exam.exam_status,
                                    created: exam.exam_creation_time,
                                    group: "Mindenki",
                                });
                            }
                        }
                    }
                }
            }
        } catch (error) {
            console.log(error.message);
        }
        return exams;
    };

    /*
      ---------------------------------------------------------------------------
      A vizsga kiválasztása (Általános jellemzők + Kérdések + válaszok)
      ---------------------------------------------------------------------------
      */

    selectTest = async (questions) => {
        //Kérdés + Válasz párosítás
        let questionList = [];
        try {
            for (const question of questions) {
                const answersIdList = await this.con("exam_prepare").where(
                    this.con.raw("question_id = ?", [question.question_id])
                );

                const results = await this.selectResults(answersIdList);

                questionList.push({
                    id: question.question_id,
                    exam_id: question.exam_id,
                    name: question.question_name,
                    points: question.points,
                    pic: question.picture,
                    answers: results,
                });
            }
        } catch (error) {
            console.log(error.message);
        }
        return questionList;
    };

    selectResults = async (answersIdList) => {
        //Válaszok keresése a kérdéshez
        let results = [];
        try {
            for (const answerId of answersIdList) {
                const answer = await this.con("results")
                    .where(this.con.raw("results_id = ?", [answerId.results_id]))
                    .first();

                if (answer) {
                    results.push({
                        id: answer.results_id,
                        text: answer.result_text,
                        correct: answer.correct == 1 ? true : false,
                    });
                }
            }
        } catch (error) {
            console.log(error.message);
        }
        return results;
    };

    selectExamContent = async (exam_itemcode) => {
        //Az adatok összesítése és tovább küldése
        let content = [];
        try {
            const exam = await this.con("exams")
                .select("exam_id")
                .where(this.con.raw("exam_itemcode = ?", [exam_itemcode]))
                .first();

            if (exam) {
                const questions = await this.con("questions").where("exam_id", [
                    exam.exam_id,
                ]);
                if (questions.length > 0) {
                    content = await this.selectTest(questions);
                }
            }
        } catch (error) {
            console.log(error.message);
        }
        return content;
    };

    selectExamProps = async (exam_itemcode) => {
        let result = [];
        try {
            const exam = await this.con("exams")
                .select(["exam_name", "exam_notes", "exam_status", "points_required"])
                .where("exam_itemcode", [exam_itemcode])
                .first();

            if (exam) {
                result.push(
                    exam.exam_name,
                    exam.exam_notes,
                    exam.exam_status,
                    exam.points_required
                );
            }
        } catch (error) {
            console.log(error.message);
        }
        return result;
    };

    /*
      --------------------------------------------------------------------------
      Felhasználó kezelés
      --------------------------------------------------------------------------
      */

    findUser = async (cardNum) => {
        let result = "no_user";
        try {
            const worker = await this.con("workers")
                .where(this.con.raw("worker_cardcode = ?", [cardNum]))
                .first();

            if (worker) {
                result = [worker.worker_name, worker.worker_usergroup];
            }
        } catch (error) {
            console.log(error.message);
        }
        return result;
    };

    getUserForMail = async (adminId) => {
        let result = null;
        try {
            const admin = await this.con("admin_login").where("id", adminId).first();

            if (admin) {
                const worker = await this.con("workers")
                    .where("worker_cardcode", admin.cardcode)
                    .first();

                if (worker) {
                    result = {
                        name: worker.worker_name,
                        email: admin.email,
                    };
                }
            }
        } catch (error) {
            console.log(error.message);
        }

        return result;
    };

    findUserId = async (cardNum) => {
        let result = -1;
        try {
            const admin = await this.con("admin_login")
                .where(this.con.raw("cardcode = ?", [cardNum]))
                .first();

            if (admin) {
                result = admin.id;
            }
        } catch (error) {
            console.log(error.message);
        }
        return result;
    };

    resetUserPassword = async (id, password) => {
        let msg = false;

        try {
            await this.con.transaction(async (trx) => {
                const update = await this.con("admin_login")
                    .update({
                        password: CryptoJS.AES.encrypt(password, "jp-$kDB").toString(),
                    })
                    .where("id", id)
                    .transacting(trx);

                if (update) {
                    await this.con("tokens")
                        .delete()
                        .where("admin_id", id)
                        .transacting(trx);

                    msg = true;
                }
            });
        } catch (error) {
            console.log(error.message);
        }

        return msg;
    };

    registerUser = async (cardNum, email, password) => {
        let msg = false;
        try {
            await this.con.transaction(async (trx) => {
                const login = await this.con("admin_login")
                    .where(this.con.raw("cardcode = ?", [cardNum]))
                    .orWhere(this.con.raw("email = ?", [email]))
                    .first()
                    .transacting(trx);

                if (!login) {
                    const insert = await this.con("admin_login")
                        .insert({
                            cardcode: cardNum,
                            email: email,
                            password: CryptoJS.AES.encrypt(password, "jp-$kDB").toString(),
                        })
                        .transacting(trx);

                    msg = insert.length > 0;
                }
            });
        } catch (error) {
            console.log(error.message);
        }
        return msg;
    };

    selectUserToken = async (adminId) => {
        let result = null;

        try {
            result = await this.con("tokens")
                .where(this.con.raw("admin_id = ?", adminId))
                .first();
        } catch (error) {
            console.log(error.message);
        }

        return result;
    };

    clearExpiredTokens = async () => {
        try {
            await this.con.transaction(async (trx) => {
                const tokens = await this.con("tokens").transacting(trx);

                for (const token of tokens) {
                    if (new Date().getTime() > new Date(token.expires).getTime()) {
                        await this.con("tokens")
                            .delete()
                            .where("id", token.id)
                            .transacting(trx);
                    }
                }
            });
        } catch (error) {
            console.log(error.message);
        }
    };

    registerToken = async (adminId, token, expires) => {
        try {
            await this.con.transaction(async (trx) => {
                const amount = await this.con("tokens")
                    .where("admin_id", adminId)
                    .transacting(trx);

                if (amount.length !== 0) {
                    await this.con("tokens")
                        .delete()
                        .where("admin_id", adminId)
                        .transacting(trx);
                }

                await this.con("tokens")
                    .insert({
                        admin_id: adminId,
                        token,
                        expires,
                    })
                    .transacting(trx);
            });
        } catch (error) {
            console.log(error.message);
        }
    };

    userLogout = async (cardNum) => {
        try {
            await this.con.transaction(async (trx) => {
                await this.con("admin_login")
                    .update({
                        latest_logout: this.con.fn.now(),
                    })
                    .where("cardcode", [cardNum])
                    .transacting(trx);
            });
        } catch (error) {
            console.log(error.message);
        }
    };

    userExists = async (cardNum, password) => {
        let access = false;
        try {
            await this.con.transaction(async (trx) => {
                const login = await this.con("admin_login")
                    .where(this.con.raw("cardcode = ?", [cardNum]))
                    .first()
                    .transacting(trx);
                if (login) {
                    access =
                        CryptoJS.AES.decrypt(login.password, "jp-$kDB").toString(
                            CryptoJS.enc.Utf8
                        ) === password;
                    if (access) {
                        await this.con("admin_login")
                            .update({
                                latest_login: this.con.fn.now(),
                            })
                            .where("cardcode", [cardNum])
                            .transacting(trx);
                    }
                }
            });
        } catch (error) {
            console.log(error.message);
        }
        return access;
    };

    /*
      ----------------------------------------------------------------------
      Vizsga feltöltés rendszere
      ----------------------------------------------------------------------
      */

    insertExam = async (arr, group) => {
        let message = "";
        try {
            await this.con.transaction(async (trx) => {
                const itemCount = await this.con("items")
                    .count("Itemcode AS count")
                    .where(this.con.raw("Itemcode = ?", [arr[0]]))
                    .first()
                    .transacting(trx);

                if (itemCount.count === 0) {
                    message = "mysql_invalid_itemcode";
                    return;
                }

                const examcodeCount = await this.con("exams")
                    .count("exam_itemcode AS count")
                    .where(this.con.raw("exam_itemcode = ?", [arr[0]]))
                    .first()
                    .transacting(trx);

                if (examcodeCount.count !== 0) {
                    message = "mysql_item_exists_error";
                    return;
                }

                const nameCount = await this.con("exams")
                    .count("exam_id AS count")
                    .where(this.con.raw("exam_name = ?", [arr[1]]))
                    .first()
                    .transacting(trx);

                if (nameCount.count !== 0) {
                    message = "mysql_name_exists_error";
                    return;
                }

                const insert = await this.con
                    .raw(
                        "INSERT INTO exams (exam_itemcode, exam_name, " +
                        "exam_notes, exam_docs, exam_creator, exam_modifier) " +
                        "VALUES (?)",
                        [arr]
                    )
                    .transacting(trx);
                if (insert.length !== 0) {
                    if (group.length === 0) {
                        const insertGrouping = await this.con("exam_grouping")
                            .insert({
                                exam_id: insert[0].insertId,
                                worker_usergroup_id: null,
                            })
                            .transacting(trx);
                        if (insertGrouping.length !== null) {
                            message = 200;
                        }
                    } else {
                        for (const grp of group) {
                            await this.con
                                .raw(
                                    "INSERT INTO exam_grouping SET exam_id = ?, worker_usergroup_id = ? ",
                                    [insert[0].insertId, grp]
                                )
                                .transacting(trx);
                        }
                        message = 200;
                    }
                }
            });
        } catch (error) {
            console.log(error.message);
        }
        return message;
    };
}

module.exports = new Connection();
