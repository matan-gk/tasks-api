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
app.post('/tasks', authenticate, (req, res) => {
    var newTask = new Task ({
        title: req.body.title,
        _creator: req.user._id
    });

    newTask.save().then((doc) => {
        res.send(doc);
    },(err) => {
        res.status(400).send(err);
    });
});

app.get('/tasks', authenticate, (req, res) => {
    Task.find({
        _creator: req.user._id
    }).then((tasks) => {
        res.send({tasks});
    }, (err) => {
        res.status(400).send(err);
    });
});

app.get('/tasks/:taskId', authenticate, (req, res) => {
    var taskId = req.params.taskId;

    if (!ObjectID.isValid(taskId)) {
        return res.status(404).send();
    }

    Task.findOne({
        _id: taskId,
        _creator: req.user._id
    }).then((selectedTask) => {
        if (!selectedTask) return res.status(404).send();
        
        res.send({task: selectedTask});

    }).catch((err) => {
        res.status(400).send();
    });
});

app.delete('/tasks/:taskId', authenticate, (req, res) => {
    var taskId = req.params.taskId;
    console.log('task ID:', taskId)
    if (!ObjectID.isValid(taskId)) {
        console.log('task ID is not valid');
        res.status(404).send();
    } else {
        Task.findOneAndRemove({
            _id: taskId,
            _creator: req.user._id
        }).then((selectedTask) => {
            if (!selectedTask) res.status(404).send();
            else res.status(200).send({task: selectedTask});
        }, (err) => {
            res.status(400);
        })
    }
})

// Update an individual task
app.patch('/tasks/:taskId', authenticate, (req, res) => {
    var taskId = req.params.taskId;
    var body = _.pick(req.body, ['title', 'completed']);

    if (!ObjectID.isValid(taskId)) {
        res.status(404).send();
    }

    if (_.isBoolean(body.completed) && body.completed) {
        body.completedAt = new Date().getTime(); 
    } else {
        body.completed = false;
        body.completedAt = null;
    }

    Task.findOneAndUpdate({
        _id: taskId,
        _creator: req.user._id
    }, { $set: body }, {new: true})
    .then((selectedTask) => {
        if (!selectedTask) res.status(404).send();
        else res.status(200).send({task: selectedTask});
    }, (err) => {
        res.status(400);
    });
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
        res.header('x-auth', token).send(newUser);
    }).catch((err) => {
        res.status(400).send(err);
    });
});

app.get('/users/me', authenticate, (req, res) => {
    res.send(req.user);
});

app.post('/users/login', (req, res) => {
    var body = _.pick(req.body, ['email', 'password']);
    
    User.findByCredentials(body.email, body.password).then((user) => {
        return user.generateAuthToken().then((token) => {
            res.header('x-auth', token).send({user});
        });
    }).catch((err) => {
        res.status(400).send();
    });

});

app.delete('/users/me/token', authenticate, (req,res) => {
    req.user.removeToken(req.token).then(() => {
        res.status(200).send();
    }).catch(() => {
        res.status(400).send();
    });
});

app.listen(listenPort, () => {
    console.log(`app started on port ${listenPort}`);
});

module.exports = {app};
