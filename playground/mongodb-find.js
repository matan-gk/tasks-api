const {MongoClient, ObjectID} = require('mongodb');

var obj = new ObjectID();
console.log(obj);

MongoClient.connect('mongodb://localhost:27017/todoApp', (err, db) => {
    if (err) {
        return console.log('unable to connect to MongoDB server');
    }

    console.log('Connected to MongoDB server');

    var cursor = db.collection('todos').find();

    cursor.toArray().then((docs) => {
        console.log('todos:');
        console.log(JSON.stringify(docs, undefined, 2));
    }, (err) => {
        console.log('unable to fetch todos', err);
    })


    

    db.close();

});