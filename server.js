/*Main Server of the Saas Team Project*/
require('rootpath')();
var express = require('express');
var app = express();
var morgan = require('morgan'); // Import Morgan Package
var session = require('express-session');
var bodyParser = require('body-parser');
var expressJwt = require('express-jwt');
var config = require('config.json');
//macku
var net = require('net'),
    JsonSocket = require('json-socket');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://192.168.223.65:27017/";
var ObjectID = require('mongodb').ObjectID;
 
//added by dyan0 --socket.io for realtime
var http = require('http').Server(app);
var io = require('socket.io')(http);

//macku
var server = net.createServer();

//Added by Glenn for upload profile pic
/*var multer = require('multer');
var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'D:\profile pictures');
    },
    filename: function(req, file, cb) {
        if (!file.originalname.match(/\.(png|jpeg|jpg)$/)) {
            var err = new Error();
            err.code = 'filetype';
            return cb(err);
        } else {
            cb(null, file.originalname);
        }
    }
});
var upload = multer({
    storage: storage,
    limits: { fileSize: 10000000 }
}).single('myfile');

app.post('/upload', function(req, res) {
    upload(req, res, function(err) {
        if (err) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                res.json({ success: false, message: 'File size is too large. Max limit is 10MB' });
            } else if (err.code === 'filetype') {
                res.json({ success: false, message: 'Filetype is invalid. Must be .png' });
            } else {
                res.json({ success: false, message: 'Unable to upload file' });
            }
        } else {
            if (!req.file) {
                res.json({ success: false, message: 'No file was selected' });
            } else {
                res.json({ success: true, message: 'File uploaded!' });
            }
        }
    });
});*/
//End of upload profile pic

//added by jeremy
require('./models/models');
var mongoose = require('mongoose');
mongoose.connect(config.connectionString);

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({ secret: config.secret, resave: false, saveUninitialized: true }));
 

//THIS added by dyano for uploading image please change variable names
var superhero = require('./services/superhero')();
app.route('/superhero')
    .post(superhero.post)
    .get(superhero.getAll);
app.route('/superhero/:id')
    .get(superhero.getOne);
app.route('/superhero/email')
    .get(superhero.getOneByEmail);
//end of THIS


// use JWT auth to secure the api   // edited by dyan0: added '/api/users/emailOn'
app.use('/api', expressJwt({ secret: config.secret }).unless({ path: ['/api/users/authenticate', '/api/users/register', '/api/users/emailOn'] }));
 
// routes
app.use('/login', require('./controllers/login.controller'));
app.use('/register', require('./controllers/register.controller'));
app.use('/app', require('./controllers/app.controller'));
app.use('/api/users', require('./controllers/api/users.controller'));
app.use('/api/devices', require('./controllers/api/devices.controller'));
 
//added by jeremy
app.use('/api/assets', require('./controllers/api/assets.controller'));
app.use('/api/fields', require('./controllers/api/fields.controller'));

//added by dyan0
io.on('connection', function(socket){
    
    //for asset changes in realtime
    socket.on('assetChange', function(){
        io.emit('assetChange');
    });
    socket.on('deviceChange', function(){
        io.emit('deviceChange');
    });
    socket.on('userChange', function(){
        io.emit('userChange');
    });
    socket.on('fieldsChange', function(){
        io.emit('fieldsChange');
    });
    

    //console.log('a user is connected');
    socket.on('disconnect', function(){
        //console.log('a user has disconnected');
    })
});

// make '/app' default route
app.get('/', function (req, res) {
    return res.redirect('/app');
});


 
// start server --edited by dyan0 from app.listen to http.listen
var server = http.listen(3000, function () {
    console.log('Server listening at http://' + server.address().address + ':' + server.address().port);


    /* Author: Macku I. Sanchez
       Date: 01/23/2018
       Purpose: Recieves the Data that is sent by the Dummy Program.
    */
    server.on('connection', function(socket) { //This is a standard net.Socket
        socket = new JsonSocket(socket); //Now we've decorated the net.Socket to be a JsonSocket
        socket.on('message', function(message) {

            //var _id = message._id;
            var assetParam = message;
            //var objectId2 = new ObjectID(_id);
            var set = {location: assetParam.location,
                        updated_date: assetParam.updated_date};

            MongoClient.connect(url, function(err, db) {
                if (err) throw err;
                var dbo = db.db("SaasDatabaseRealProj");
                dbo.collection("assets").updateOne(
                        { asset_tag: assetParam.asset_tag }, 
                        { $set: set },
                        function(err, res) {
                            if (err) throw err;
                            io.emit('assetChange');
                            db.close();
                });
            });
        });
    });
});