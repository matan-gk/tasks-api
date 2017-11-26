require('./config/config');

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

var {mongoose} = require('./db/mongoose');
var {Task} = require('./models/task');
var {User} = require('./models/user');
var {authenticate} = require('./middleware/authenticate');

var app = express();
const listenPort = process.env.PORT;

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

app.get('/tasks/:taskId', (req, res) => {
    var taskId = req.params.taskId;
    console.log('task ID:', taskId)
    if (!ObjectID.isValid(taskId)) {
        console.log('task ID is not valid');
        res.status(404).send();
    } else {
        Task.findById(taskId).then((selectedTask) => {
            if (!selectedTask) res.status(404).send();
            else res.status(200).send(selectedTask);
        }, (err) => {
            res.status(400);
        })
    }
})

app.delete('/tasks/:taskId', (req, res) => {
    var taskId = req.params.taskId;
    console.log('task ID:', taskId)
    if (!ObjectID.isValid(taskId)) {
        console.log('task ID is not valid');
        res.status(404).send();
    } else {
        Task.findByIdAndRemove(taskId).then((selectedTask) => {
            if (!selectedTask) res.status(404).send();
            else res.status(200).send(selectedTask);
        }, (err) => {
            res.status(400);
        })
    }
})

// Update an individual task
app.patch('/tasks/:taskId', (req, res) => {
    var taskId = req.params.taskId;
    var body = _.pick(req.body, ['text', 'completed']);

    console.log('task ID:', taskId)
    if (!ObjectID.isValid(taskId)) {
        console.log('task ID is not valid');
        res.status(404).send();
    } else {

        if (_.isBoolean(body.completed) && body.completed) {
            body.completedAt = new Date().getTime(); 
        } else {
            body.completed = false;
            body.completedAt = null;
        }

        console.log(body);

        Task.findByIdAndUpdate(taskId, {
            $set: {body}
        }, {new: true})
        .then((selectedTask) => {
            if (!selectedTask) res.status(404).send();
            else res.status(200).send(selectedTask);
        }, (err) => {
            res.status(400);
        })
    }
});

// Add a new user
app.post('/users', (req, res) => {
    var newUser = new User ({
        email: req.body.email,
        password: req.body.password
    });

    newUser.save().then(() => {
        return newUser.generateAuthToken();
    }).then((token) => {
        res.header('x-auth', token).send({newUser});
    }).catch((err) => {
        res.status(400).send(err);
    });
});

app.get('/users/me', authenticate, (req, res) => {
    res.send(req.user);
});

app.listen(listenPort, () => {
    console.log(`app started on port ${listenPort}`);
});

module.exports = {app};