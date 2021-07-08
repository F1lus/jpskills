const nodemailer = require('nodemailer')
const handlebars = require('handlebars')

const fs = require('fs')
const path = require('path')

const config = require('../config')

/**
 * 
 * @param {string} email User email
 * @param {string} subject Email subject
 * @param {any} payload Variables to insert into the document
 * @param {string} template Path to the template
 * 
 * @returns Whether the email has been sent or not (boolean)
 */

module.exports = async (email, subject, payload, template) => {
    try {
        
        const transporter = nodemailer.createTransport({
            host: config.mail.host,
            port: 465,
            auth: {
                user: config.mail.auth.user,
                pass: config.mail.auth.password
            }
        })

        const src = fs.readFileSync(path.join(__dirname, 'templates', `${template}.handlebars`), 'utf8')
        const compiledTemplate = handlebars.compile(src)
        const options = () => ({
            from: config.mail.address,
            to: email,
            subject,
            html: compiledTemplate(payload)
        })

        await transporter.sendMail(options())

        return true

    } catch (error) {
        console.log(error.message)
        return false
    }
}