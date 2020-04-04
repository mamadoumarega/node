require('babel-register')
const {success, error, checkAndChange} = require('./assets/functions')
const mysql = require('promise-mysql')
const bodyParser = require('body-parser')
const express = require('express')
const swaggerUi = require('swagger-ui-express')
const swaggerDocument = require('./assets/swagger.json')
const morgan = require('morgan')('dev')
const config = require('./assets/config')

mysql.createConnection({
    host: config.db.host,
    database: config.db.database,
    user: config.db.user,
    password: config.db.password
}).then((db) => {
    console.log('Connected.')

    const app = express()
    app.use(config.rootAPI +'api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

    let MembersRouter = express.Router()
    let Members = require('./assets/classes/members-class')(db, config)
    console.log(Members)

    app.use(morgan)
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    MembersRouter.route('/:id')

        // Récupère un membre avec son ID

        .get( async (req, res) => {
            let member = await Members.getById(req.params.id)
            res.json(checkAndChange(member))
        })

        // Modifie un membre avec ID
        .put(async (req, res) => {
            let updateMember = await Members.updateMember(req.params.id, req.body.name)
            res.json(checkAndChange(updateMember))
        })

        // Supprime un membre avec ID
        .delete( async (req, res) => {
            let deleteMembers = await Members.delete(req.params.id)
            res.json(checkAndChange(deleteMembers))
        })

    MembersRouter.route('/')

        // Récupère tous les membres
        .get( async (req, res) => {
           let allMembers = await Members.getAll(req.query.max)
            res.json(checkAndChange(allMembers))
        })

        // Ajoute un membre avec son nom
        .post(async (req, res) => {

           let addMember = await Members.add(req.body.name)
            res.json(checkAndChange(addMember))
        })

    app.use(config.rootAPI+'members', MembersRouter)

    app.listen(config.port, () => console.log('Started on port '+config.port))

}).catch((err) => {
    console.log('Error during database connetion ...')
    console.log(err.message)
})

