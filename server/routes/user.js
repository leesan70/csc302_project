const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
import validateRegisterInput from '../validation/register';
import validateLoginInput from '../validation/login';
import util from '../util'

const User = require('../models/User');

export default passport => {
    router.post('/register', function(req, res) {

        const { errors, isValid } = validateRegisterInput(req.body);

        if(!isValid) {
            return res.status(400).json(errors);
        }
        User.findOne({
            username: req.body.username
        }).then(user => {
            if(user) {
                return res.status(400).json({
                    username: 'Username already exists'
                });
            }
            else {
                const newUser = new User({
                    username: req.body.username,
                    email: req.body.email,
                    password: req.body.password,
                });
                
                bcrypt.genSalt(10, (err, salt) => {
                    if(err) util.errorMessage(res, "Error has occured while generating salt for password", null, 500);
                    else {
                        bcrypt.hash(newUser.password, salt, (err, hash) => {
                            if(err) util.errorMessage(res, "Error has occured while generating hashing password", null, 500);
                            else {
                                newUser.password = hash;
                                newUser
                                    .save()
                                    .then(user => {
                                        res.json(user)
                                    }); 
                            }
                        });
                    }
                });
            }
        });
    });

    router.post('/login', (req, res) => {
        const { errors, isValid } = validateLoginInput(req.body);

        if(!isValid) {
            return res.status(400).json(errors);
        }

        const username = req.body.username;
        const password = req.body.password;

        console.log(username);
        User.findOne({username})
            .then(user => {
                if(!user) {
                    errors.username = 'User not found'
                    return res.status(400).json(errors);
                }
                bcrypt.compare(password, user.password)
                    .then(isMatch => {
                        if(isMatch) {
                            const payload = {
                                id: user.id,
                                username: user.username,
                            }
                            jwt.sign(payload, 'secret', {
                                expiresIn: 3600
                            }, (err, token) => {
                                if(err) util.errorMessage(res, "Error has occured while signing JWT token", null, 500);
                                else {
                                    res.json({
                                        success: true,
                                        token: `Bearer ${token}`
                                    });
                                }
                            });
                        }
                        else {
                            errors.password = 'Incorrect Password';
                            return res.status(400).json(errors);
                        }
                    });
            });
    });

    router.get('/me', passport.authenticate('jwt', { session: false }), (req, res) => {
        return res.json({
            id: req.user.id,
            username: req.user.username,
            email: req.user.email
        });
    });
    
    return router;
}
