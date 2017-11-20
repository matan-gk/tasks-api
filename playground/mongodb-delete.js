const {MongoClient, ObjectID} = require('mongodb');

var obj = new ObjectID();
console.log(obj);

MongoClient.connect('mongodb://localhost:27017/todoApp', (err, db) => {
    if (err) {
        return console.log('unable to connect to MongoDB server');
    }

    console.log('Connected to MongoDB server');

    db.collection('todos').deleteMany({text: 'Eat lunch'}).then((result) => {
        console.log(result);
    });


    

    db.close();

});