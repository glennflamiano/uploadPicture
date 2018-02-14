//THIS added by dyano for uploading image please change variable names

// Dependencies
var mongo = require('mongoskin');
var mongoose  = require('mongoose');
var Superhero = require('../models/models');
var Superhero = mongoose.model('superhero');

// App routes
module.exports = function() {
    return {
        /*
         * Get route to retrieve all the superheroes.
         */
        getAll : function(req, res){
            //Query the DB and if no errors, send all the superheroes
            var query = Superhero.find({});
            query.exec(function(err, superheroes){
                if(err) res.send(err);
                //If no errors, send them back to the client
                res.json(superheroes);
            });
        },
        /*
         * Post route to save a new superhero into the DB.
         */
        /*post: function(req, res){
            console.log(req.body.email);
            //Creates a new superhero
            var newSuperhero = new Superhero(req.body);
            //Save it into the DB.
            newSuperhero.save(function(err){
                if(err) res.send(err);
                //If no errors, send it back to the client
                res.json(req.body);
            });
        },*/
        post: function(req, res){
            console.log('eemailllll isss ', req.body.email);


            Superhero.findOne(
                { email: req.body.email },
                function (err, results) {
                    if(err){
                        res.send(err);
                    }
                    if(!results){
                        console.log('created new profile pic');
                        var newSuperhero = new Superhero(req.body);
                        //Save it into the DB.
                        newSuperhero.save(function(err){
                            if(err) res.send(err);
                            //If no errors, send it back to the client
                            res.json(req.body);
                        });
                    }else{
                        console.log('updated image file');
                        //Update by email
                        Superhero.update({email: req.body.email}, {$set: { picture: req.body.picture }}, function(err){
                            if(err) res.send(err);
                            //If no errors, send it back to the client
                            res.json(req.body);
                        });
                    }
                }
            );

            //Update by email
            /*Superhero.update({email: req.body.email}, {$set: { picture: req.body.picture }}, function(err){
                if(err) res.send(err);
                //If no errors, send it back to the client
                res.json(req.body);
            });*/
            //Creates a new superhero
            //var newSuperhero = new Superhero(req.body);
            /*Superhero.findOne(
                { email: req.body.email },
                function (err, user) {
                    if(err) res.send(err);
                    //If no errors, send it back to the client
                    Superhero.update({email: req.body.email}, {$set: set}, function(err){
                        if(err) res.send(err);
                        //If no errors, send it back to the client
                        res.json(req.body);
                    });
                }
            ); */ 
        },
        /*
         * Get a single superhero based on id.
         */
        getOne: function(req, res){
            Superhero.findById(req.params.id, function(err, superhero){
                if(err) res.send(err);
                //If no errors, send it back to the client
                res.json(superhero);
            });     
        },
        /*
         * Get a single superhero based on email.
         */
        getOneByEmail: function(req, res){
            Superhero.findById(req.params.email, function(err, superhero){
                if(err) res.send(err);
                //If no errors, send it back to the client
                res.json(superhero);
            });     
        }
    }
};  