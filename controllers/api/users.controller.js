var config = require('config.json');
var express = require('express');
var nodemailer = require('nodemailer');
var router = express.Router();
var userService = require('services/user.service');

//Added by Glenn Multer Declaration
var multer = require('multer');
var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'D:\profile pictures');
    },
    filename: function(req, file, cb) {
        if (!file.originalname.match(/\.(png|jpeg|jpg)$/)) {
            var err = new Error();
            err.code = 'filetype';
            return cb(err);
            console.log('errrrrrroorrrrrrrzzz');
        } else {
            console.log('jjiokoskksk');
            cb(null, file.originalname);
        }
    }
});

var upload = multer({
    storage: storage,
    limits: { fileSize: 10000000 }
}).single('myfile');
//end
 
// routes
router.get('/isAdmin', getAdminUser);
router.get('/all', getAllUsers);
router.post('/authenticate', authenticateUser);
router.post('/emailOn', emailOn);       // added by dyan0
router.post('/addUser', addUser);
router.post('/register', registerUser);
router.get('/current', getCurrentUser);
router.put('/:_id', updateUser);
router.delete('/:_id', deleteUser);
router.post('/upload', uploadProfilePic);
 
module.exports = router;

function getAllUsers(req, res) {
    userService.getAll(req.user.sub)
        .then(function (user) {
            if (user) {
                res.send(user);
            } else {
                res.sendStatus(404);
            }
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}
 
function authenticateUser(req, res) {
    userService.authenticate(req.body.email, req.body.password)
        .then(function (token) {
            if (token) {
                // authentication successful
                res.send({ token: token });
            } else {
                // authentication failed
                res.sendStatus(401);
            }
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}
 
// added by dyan0
function emailOn(req, res) {
    userService.emailOn(req.body)
        .then(function (emailDBstat) {
            res.status(200).send(emailDBstat);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}
// end of add - dyan0


function addUser(req, res) {
    userService.insert(req.body)
        .then(function () {
            sendingMail();
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });

        //sending the email
        function sendingMail(){
            const output = `
                <p>This mail contains your account's details</p>
                <h3> Account Details</h3>
                <ul>
                   <li>Email: ${req.body.email}</li>
                    <li>First name: ${req.body.firstName}</li>
                    <li>Last name: ${req.body.lastName}</li>
                    <li>Password: ${req.body.password}</li>
                </ul>
                <h3>IMPORTANT!</h3>
                <p>Please change your password as soon as possible.</p>
                <p>You are registered as ${req.body.role}</p>
            `;
        
            // create reusable transporter object using the default SMTP transport
            let transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'saasteamaws@gmail.com', // generated ethereal user
                    pass: '12angDum^^y'  // generated ethereal password
                }
            });
        
            // setup email data with unicode symbols
            let mailOptions = {
                from: '"SaaS Team 👻" <saasteamaws@gmail.com>', // sender address
                to: req.body.email, // list of receivers
                subject: 'Account Registered ✔', // Subject line
                text: 'Welcome to SaaS Project', // plain text body
                html: output // html body
            };
        
            // send mail with defined transport object
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    return console.log(error);
                }
            });
        }
}

function registerUser(req, res) {
    userService.create(req.body)
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}
 
function getCurrentUser(req, res) {
    userService.getById(req.user.sub)
        .then(function (user) {
            if (user) {
                res.send(user);
            } else {
                res.sendStatus(404);
            }
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

// Added by Glenn
// This is to determine if user is admin or not.
function getAdminUser(req, res) {
    userService.getById(req.user.sub)
        .then(function (user) {
            if(user) {
                if (user.role == 'Admin') {
                    res.send(true);
                } else {
                    res.send(false);
                }
            } else {
                res.sendStatus(404);
            }
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}
 
function updateUser(req, res) {
    var userId = req.params._id
 
    userService.update(userId, req.body)
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}
 
function deleteUser(req, res) {
    var userId = req.params._id;
 
 
    userService.delete(userId)
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

//Added by Glenn for pic upload
function uploadProfilePic(req, res) {
    console.log('sdsdsdasasasasasas');
    console.log(req.file);
    upload(req, res, function(err) {
        if (err) {
            console.log('errrrorrrrrr', err);
            if (err.code === 'LIMIT_FILE_SIZE') {
                res.json({ success: false, message: 'File size is too large. Max limit is 10MB' });
            } else if (err.code === 'filetype') {
                res.json({ success: false, message: 'Filetype is invalid. Must be .png' });
            } else {
                res.json({ success: false, message: 'Unable to upload file' });
            }
        } else {
            if (!req.file) {
                console.log('no fileeeee');
                res.json({ success: false, message: 'No file was selected' });
            }
            res.json({ success: true, message: 'File uploaded!' });
            console.log('AAAAAAAAAAA');
            //}
        }
    });
}