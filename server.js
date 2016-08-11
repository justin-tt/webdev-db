var express = require('express');
var bodyParser = require('body-parser');
var mongodb = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var app = express();
var port = 8888;
var db, collection;

var uri = "mongodb://" + process.env.MONGOLAB_USER + ":" + process.env.MONGOLAB_PASSWORD + "@ds023485.mlab.com:23485/webdev";
var jokes=[{setup:"Our wedding was so beautiful,",punchline:"even the cake was in tiers", votes: 0},{setup:"I'm reading a book on the history of glue",punchline:"I just can't seem to put it down", votes: 0},{setup:"What do you call an Argentinian with a rubber toe?",punchline:"Roberto", votes: 0}];

app.use(bodyParser.json());
app.use(express.static('static'));

mongodb.connect(uri, function(err, database) {
   db = database;
   collection = db.collection('jokes');

    app.listen(process.env.PORT || port, function() {
        console.log("Listening on " + port);
    });
});


app.get('/', function(req, res) {
    res.sendFile(__dirname + '/static/index.html');
});

app.get('/jokes', function(req, res) {

    collection.count(function(err, count) {

        var randomNumber = Math.floor(Math.random() * count);

        collection.find().limit(-1).skip(randomNumber).next(
            function(err, results) {
                res.send(results);
            }
        );
    });
});

app.put('/upvote', function(req, res) {
    var jokeIndex = req.body.id;
    collection.findOneAndUpdate(
        { _id: ObjectId(jokeIndex) },
        { $inc: { "votes" : 1 }},
        function(err, result) {
            result.value.votes++;
            res.send(result.value);
        }
    );
});

app.put('/downvote', function(req, res) {
    var jokeIndex = req.body.id;
    collection.findOneAndUpdate(
        { _id: ObjectId(jokeIndex) },
        { $inc: { "votes" : -1 }},
        { returnNewDocument: true },
        function(err, result) {
            result.value.votes--;
            res.send(result.value);
        }
    );
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

app.post('/createjoke', function(req, res) {

    collection.insertOne(req.body,
        function(err, results){
            res.send(results);
        }
    );
});

app.get('/alljokes', function(req, res) {
    collection.find().toArray(
        function(err, resultArray) {
            res.send(resultArray)
        }
    );
});

app.delete('/deletejoke', function(req, res) {
    collection.deleteOne({_id: ObjectId(req.body.id)},
        function(err, results){
            res.send(results);
        }
    );
});
