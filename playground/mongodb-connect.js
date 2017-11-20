const {MongoClient, ObjectID} = require('mongodb');

var obj = new ObjectID();
console.log(obj);

MongoClient.connect('mongodb://localhost:27017/todoApp', (err, db) => {
    if (err) {
        return console.log('unable to connect to MongoDB server');
    }

    console.log('Connected to MongoDB server');

    db.collection('todos').insertOne({
        text: 'something to do',
        completed: false
    }, (err, result) => {
        if (err) {
            return console.log('unable to insert todo', err);
        }

        console.log(JSON.stringify(result.ops, undefined, 2));
    })

    db.close();

});