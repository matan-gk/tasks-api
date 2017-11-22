const express = require('express');
const bodyParser = require('body-parser');

var {mongoose} = require('./db/mongoose');
var {Task} = require('./models/task');
var {User} = require('./models/user');

var app = express();

app.use(bodyParser.json());

// Add a new task
app.post('/tasks', (req, res) => {
    var newTask = new Task ({
        title: req.body.title
    });

    newTask.save().then((doc) => {
        res.send(doc);
    },(err) => {
        res.status(400).send(err);
    });
});


app.get('/tasks', (req, res) => {
    Task.find({}).then((tasks) => {
        res.send({tasks});
    }, (err) => {
        res.status(400).send(err);
    });
});

app.listen(3000, () => {
    console.log('app started on port 3000');
});

module.exports = {app};