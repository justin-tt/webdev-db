var express = require('express');
var bodyParser = require('body-parser');
var mongodb = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var app = express();
var port = 8888;

// setting ENV variables in windows
// https://technet.microsoft.com/en-us/library/ff730964.aspx
// [Environment]::SetEnvironmentVariable("TestVariable", "Test value.", "User")
// requires restarting of powershell to view variables

var uri = "mongodb://" + process.env.MONGOLAB_USER + ":" + process.env.MONGOLAB_PASSWORD + "@ds023485.mlab.com:23485/webdev";
var jokes=[{setup:"Our wedding was so beautiful,",punchline:"even the cake was in tiers", votes: 0},{setup:"I'm reading a book on the history of glue",punchline:"I just can't seem to put it down", votes: 0},{setup:"What do you call an Argentinian with a rubber toe?",punchline:"Roberto", votes: 0}];

app.use(bodyParser.json());
app.use(express.static('static'));

app.listen(process.env.PORT || port, function(){
    console.log("Listening on " + port);
});

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/static/index.html');
});

app.get('/jokes', function(req, res) {

    mongodb.connect(uri, function(err, db) {
        var collection = db.collection('jokes');
        collection.count(function(err, count) {
            var randomNumber = Math.floor(Math.random() * count);
            console.log(count + " jokes found in database.");

            collection.find().limit(-1).skip(randomNumber).next(
                function(err, results) {
                    res.send(results);
                }
            );
        });
    });
});

app.post('/upvote', function(req, res) {
    console.log("Someone tried to upvote something");
    console.log(req.body);
    var jokeIndex = req.body.id;

    mongodb.connect(uri, function(err, db) {
        var collection = db.collection('jokes');
        // https://docs.mongodb.com/manual/reference/method/db.collection.findOneAndUpdate/
        collection.findOneAndUpdate(
            { _id: ObjectId(jokeIndex) },
            { $inc: { "votes" : 1 }},
            { returnNewDocument: true },
            function(err, result) {
                result.value.votes++;
                console.log(result);
                res.send(result.value);
            }
        );
    });
});

app.post('/downvote', function(req, res) {
    console.log("Someone tried to downvote something.");
    console.log(req.body);
    var jokeIndex = req.body.id;

    mongodb.connect(uri, function(err, db) {
        var collection = db.collection('jokes');
        // https://docs.mongodb.com/manual/reference/operator/update/  INCREMENT
        collection.findOneAndUpdate(
            { _id: ObjectId(jokeIndex) },
            { $inc: { "votes" : -1 }},
            { returnNewDocument: true },
            function(err, result) {
                result.value.votes--;
                console.log(result);
                res.send(result.value);
            }
        );
    });
});

/* This page was to populate some jokes into the database */
// app.get('/admin', function(req, res) {
//
//     console.log('Attempting to add into database.');
//     mongodb.connect(uri, function(err, db) {
//         var collection = db.collection('jokes');
//         collection.insertMany(jokes,
//             function(err, results){
//                 res.send(results);
//                 db.close();
//             }
//         );
//     });
// });

app.get('/updatejokes', function(req, res) {

    res.sendFile(__dirname + '/static/updateJokes.html');
});

app.post('/createJoke', function(req, res) {

    console.log('Creating joke: ', req.body);

    mongodb.connect(uri, function(err, db) {
        var collection = db.collection('jokes');
        collection.insertOne(req.body,
            function(err, results){
                res.send(results);
                db.close();
            }
        );
    });

});

app.get('/alljokes', function(req, res) {
    var jokesArray;
    mongodb.connect(uri, function(err, db) {
        var collection = db.collection('jokes');
        // http://blog.modulus.io/mongodb-tutorial
        collection.find().toArray(
            function(err, result) {
                jokesArray = result;
                res.send(jokesArray)
            }
        );
    });
});

app.post('/deletejoke', function(req, res) {
    console.log("Deleting: " + req.body.id);

    mongodb.connect(uri, function(err, db) {
        var collection = db.collection('jokes');
        collection.deleteOne({_id: ObjectId(req.body.id)},
            function(err, results){
                res.send(results);
                db.close();
            }
        );
    });
});

// TODO: UPDATE Jokes
// Have a drop down list of jokes (READ)
// this dropdown should have a function that re-loads db documents when jokes are added/deleted/edited
// to edit (UPDATE)
