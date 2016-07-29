var express = require('express');
var bodyParser = require('body-parser');
var mongodb = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var app = express();
var port = 8888;

var uri = "mongodb://" + process.env.MONGOLAB_USER + ":" + process.env.MONGOLAB_PASSWORD + "@ds023485.mlab.com:23485/webdev";
// var jokes=[{setup:"Our wedding was so beautiful,",punchline:"even the cake was in tiers", votes: 0},{setup:"I'm reading a book on the history of glue",punchline:"I just can't seem to put it down", votes: 0},{setup:"What do you call an Argentinian with a rubber toe?",punchline:"Roberto", votes: 0}];

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
        // var joke = collection.findOne({ _id: ObjectId(jokeId) }, function(err, result) {
        //     console.log(result);
        //     result.votes++;
        //     console.log(result);
        //     // TODO: Write this vote update to database!
        //     res.send(result);
        // });
        // https://docs.mongodb.com/manual/reference/method/db.collection.findOneAndUpdate/
        var joke = collection.findOneAndUpdate(
            { _id: ObjectId(jokeIndex) },
            { $inc: { "votes" : 1 }},
            { returnNewDocument: true },
            function(err, result) {
                result.value.votes++;
                console.log(result);
                res.send(result.value);
            }
        );

        // res.send(joke);
    });
});

app.post('/downvote', function(req, res) {
    console.log("Someone tried to downvote something.");
    console.log(req.body);
    var jokeIndex = req.body.id;

    mongodb.connect(uri, function(err, db) {
        var collection = db.collection('jokes');
        // var joke = collection.findOne({ _id: ObjectId(jokeId) }, function(err, result) {
        //     console.log(result);
        //     result.votes--;
        //     console.log(result);
        //     // TODO: Write this vote update to database!
        //     res.send(result);
        // });

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

app.get('/admin', function(req, res) {

    console.log('Attempting to add into database.');
    mongodb.connect(uri, function(err, db) {
        var collection = db.collection('jokes');
        collection.insertMany(jokes,
            function(err, results){
                res.send(results);
                db.close();
            }
        );
    });
});