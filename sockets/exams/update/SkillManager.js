const dbconnect = require("../../../model/DbConnect");

module.exports = socket => {

    const session = socket.handshake.session

    const removeSkill = async (skillArray) => {
        if(!session.perm || !session.cardNum || !Array.isArray(skillArray)){
            return
        }

        if(session.perm === 'superuser'){
            await dbconnect.removeUserSkill(skillArray)
            socket.emit('skill-update')
        }
    }

    const archiveSkills = async skillArray => {
        if(!session.perm || !session.cardNum || !Array.isArray(skillArray)){
            return
        }

        if(session.perm === 'superuser'){
            await dbconnect.archiveExams(skillArray, session.cardNum)
            socket.emit('skill-update')
        }
    }

    const getSkillArchive = async cardNum => {
        if(!session.perm || !session.cardNum){
            return
        }

        if(session.perm === 'superuser'){
            socket.emit('archived-list', await dbconnect.selectArchivedSkills(cardNum))
        }
    }

    const removeArchivedExam = async archiveId => {
        if(!session.perm || !session.cardNum || !Array.isArray(archiveId)){
            return
        }

        if(session.perm === 'superuser'){
            await dbconnect.removeArchivedExam(archiveId)
            socket.emit('skill-update')
        }
    }

    const archiveUser = async workerId => {
        if(!session.perm || !session.cardNum){
            return
        }

        if(session.perm === 'superuser'){
            await dbconnect.archiveUser(workerId, session.cardNum)
            socket.emit('skill-update')
        }
    }

    socket
        .on('remove-skill', removeSkill)
        .on('archive-skills', archiveSkills)
        .on('get-archived', getSkillArchive)
        .on('remove-archived', removeArchivedExam)
        .on('archive-user', archiveUser)
}