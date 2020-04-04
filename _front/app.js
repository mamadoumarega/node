//Modules
require('babel-register');
const bodyParser = require('body-parser');
const express = require('express');
const twig = require('twig');
const morgan = require('morgan')('dev');
const axios = require('axios');


// Vraiables globales
const app = express();
const port = 8081;

const fetch = axios.create({
    baseURL: 'http://localhost:8080/api/v1'
});

// Les midlewares
app.use(morgan);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// Les routes
// Page d'acceuil
app.get('/', (req, res) => {
    res.redirect('/members')
});

// page récupérant tous les membres
app.get('/members', (req, res) => {
    apiCall(req.query.max ? '/members?max=' + req.query.max : '/members', 'get', {}, res, (result) => {
        res.render('membres.twig', {
            members: result
        })
    })
});

// page récupérant un membre en fonction de son id
app.get('/members/:id', (req, res) => {
    apiCall('/members/' + req.params.id, 'get', {}, res, (result) => {
        res.render('membre.twig', {
            member: result
        })
    })
})

// page modifiant un membre en fonction de son id
app.get('/edit/:id', (req, res) => {
    apiCall('/members/'+req.params.id, 'get', {}, res, (result) => {
        res.render('edit.twig', {
            member: result
        })
    })
});

// Modification d'un membre
app.post('/edit/:id', (req, res) => {
    apiCall('/members/'+req.params.id, 'put', {
        name: req.body.name
    }, res, () =>{
        res.redirect('/members')
    })
});

//Page gérant l'ajout
app.get('/insert', (req, res) =>{
   res.render('insert.twig')
});

//Méthode gérant l'ajout
app.post('/insert', (req, res) => {
    apiCall('/members', 'post', {name: req.body.name}, res, () =>{
        res.redirect('/members')
    })
});

// Suppression
app.post('/delete', (req, res) =>{
    apiCall('/members/'+req.body.id, 'delete', {}, res, () => {
        res.redirect('/members')
    })
});

// Lancement de l'application
app.listen(port, () => console.log('Started on port ' + port));


// Fonctions
function rendError(res, errMsg) {
    res.render('error.twig', {
        errorMsg: errMsg
    })
}

function apiCall(url, method, data, res, next) {
    fetch({
        method: method,
        url: url,
        data: data
    })
        .then((response) => {
            if (response.data.status == 'success') {
                next(response.data.result)
            } else {
                rendError(res, response.data.message)
            }
        }).catch((err) => rendError(res, err.message))
}