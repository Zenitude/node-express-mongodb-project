const AddressUser = require('../models/AddressUser');
const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const findUserByMail = async (req) => {
    return await User.findOne({ email: req.body.email })
}

const findUserById = async (id) => {
    return await User.findOne({ _id: id })
}

const findAddress = async (req) => {
    return await AddressUser.findOne({
        street: req.body.street,
        zipcode: req.body.zipcode,
        city: req.body.city
    })
}

const verifInputs = async (req, res) => {
    body('lastname', 'Le nom est obligatoire').isString().notEmpty();
    body('firstname', 'Le prénom est obligatoire').isString().notEmpty();
    body('email', 'Le mail est obligatoire').isEmail().notEmpty();
    body('birth', 'La date de naissance est obligatoire').isDate().notEmpty();
    body('street', 'L\'adresse est obligatoire').isString().notEmpty();
    body('zipcode', 'Le code postal est obligatoire').isPostalCode('FR').notEmpty();
    body('city', 'La commune est obligatoire').isString().notEmpty();
    
    const errors = validationResult(req);
    
    if(!errors.isEmpty()) {
        return res.status(422).json({errors : errors.array()});
    }
}

const createAddress = async (req) => {
    const newAddress = new AddressUser({
        street: req.body.street,
        zipcode: req.body.zipcode,
        city: req.body.city
    })

    return await newAddress.save();
}

const newUser = async (idAddress, req, res) => {
    const hash = await bcrypt.hash(req.body.password, 10);

    const user = new User({
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        email: req.body.email,
        password: hash,
        birth: req.body.birth,
        address: idAddress
    });

    user.save().then(result => {
        req.session.successCreateUser = `Utilisateur ${result.lastname} ${result.firstname} créé avec succès.`
        res.redirect('/users/create');
    }).catch(error => {
        res.status(500).json({error: error})
    })
}

const signUser = async (idAddress, req, res) => {
    const hash = await bcrypt.hash(req.body.password, 10);

    const user = new User({
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        email: req.body.email,
        password: hash,
        birth: req.body.birth,
        address: idAddress
    });

    user.save().then(result => {
        req.session.userConnected = `Bienvenue ${result.lastname} ${result.firstname}.`
        jwt.sign(
            { userId: result._id},
            process.env.SECRET_KEY_TOKEN,
            { expiresIn: '24h'}
        );
        res.redirect('/');
    }).catch(error => {
        res.status(500).json({error: error})
    })
}

const modidfyUser = async (idAddress, req, res, user) => {
    const updatedUser = {
        _id: req.params.id,
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        email: req.body.email,
        password: user.password,
        birth: req.body.birth,
        address: idAddress
    }

    await User.updateOne({ _id: req.params.id}, {...updatedUser})
        .then(result => {
            req.session.successUpdateUser = `Utilisateur ${updatedUser.lastname} ${updatedUser.firstname} mis à jour avec succès.`;
            res.redirect(`/users/${req.params.id}/update`);
        })
        .catch(error => {
            console.log(error.message)
            console.log('utilisateur non mis à jour Address trouvé');
        })  
}

/* Management */
exports.createUser = (req, res, next) => {
    verifInputs(req, res);

    try{
        findUserByMail(req).then(user => {
            if(user) {
                return res.status(409).json({message : 'User already exists'});
            } else {
                findAddress(req).then(address => {
                    if(address) {
                        newUser(address.id, req, res);
                    } else {
                        createAddress(req).then(result => {
                            newUser(result.id, req, res);
                        }).catch(error => {
                            console.log('createAddress', error);
                            res.status(500).json({error: error})
                        })
                    }
                }).catch(error => {
                    console.log('findAddress', error);
                    res.status(500).json({error: error})
                })
            }
        }).catch(error => {
                    console.log('findUser', error);
                    res.status(500).json({error: error})
                })
    } catch(error) {
        console.log('try error', error);
    }
}

exports.getUsers = async (req, res, next) => {
    try{
        const users = await User.find().populate('address');
        res.locals.listUsers = users;
        next();
    }
    catch(error){
        console.error(error.message);
        res.status(500).send('Server Error');
    }
}

exports.getUserById = async (req, res, next) => {
    try{
        const user = await User.findById({ _id: req.params.id }).populate('address');
        
        if(!user) {
            return res.status(404).send('User not found');
        } else {
            res.locals.detailsUser = user;
            next();
        }

    }
    catch(error){
        console.error(error.message);
        res.status(500).send('Server Error GetUserById');
    }
}

exports.updateUser = async (req, res, next) => {

    try{
        verifInputs(req, res);

        await findUserById(req.params.id)
        .then(user => {
            findAddress(req).then(address => {
                if(address) {
                    modidfyUser(address._id, req, res, user);
                }
                else {
                    createAddress(req).then(newAddress => {
                        modidfyUser(newAddress.id, req, res, user);
                    })
                }
            }).catch(error => { 
                res.status(404).send('Error Find Address' + error.message);
            })    
        }) 
        .catch(error => { 
            console.log(error.message)
            res.status(404).send('Error Find User');
        })
    }
    catch(error){
        console.error(error.message);
        res.status(500).send('Server Error controller');
    }
}

exports.deleteUser = async (req, res, next) => {
    try{
        await findUserById(req.params.id)
        .then(user => {
            if(!user) {
                res.status(404).send('User not found');
            } else {
                user.deleteOne({_id: req.params.id})
                .then(() => {
                    req.session.successDeleteUser = `Utilisateur ${user.lastname} ${user.firstname} supprimé avec succès.`;
                    res.redirect(`/users`);
                })
                .catch(error => 
                    res.status(400).send('Error Delete User ' + error.message)
                )
            }
        })
        .catch(error => 
            res.status(400).send('Error Find User ' + error.message)
        )   
    } catch(error) {
        res.status(404).send('Error delete' + error.message);
    }
}

/* SignUp */
exports.signup = async (req, res, next) => {
    try{
        if(req.body.password === req.body.passwordConfirm) {

            verifInputs(req, res);

            findUserByMail(req).then(user => {
                if(user) { res.status(400).send('User Already Exist'); } 
                else {
                    findAddress(req).then(address => {
                        if(address) { signUser(address.id, req, res) } 
                        else {
                            createAddress(req)
                            .then(result => signUser(result.id, req, res))
                            .catch(error => res.status(400).send('Erreur Create Address ' + error.message))
                        }
                    }).catch(error => res.status(400).send('Erreur Find Address ' + error.message))
                }
            }).catch(error => res.status(404).send('User Already Exist : ' + error.message))
        } else {
            res.status(500).send('Le mot de passe ne correspond pas à sa confirmation')
        }
        
    } catch(error) {
        res.status(500).send('Erreur Find User Try ' + error.message)
    }
}

/* SignIn */
exports.login = async (req, res, next) => {
    try{
          
        await findUserByMail(req).then(user => {
            const compare = bcrypt.compare(req.body.password, user.password);
        
            if(compare) {
                req.session.userConnected = `Bienvenue ${user.lastname} ${user.firstname}`;
                const token = jwt.sign(
                    { userId: user._id},
                    process.env.SECRET_KEY_TOKEN,
                    { expiresIn: '24h'}
                );

                res.cookie('token', token, {
                    httpOnly: true,
                    secure: true,
                    maxAge: 86400
                });
                
                res.status(200).redirect('/');
            } 
            else { res.status(401).send('Mot de passe ou Email incorrect'); }
        
        })
        .catch(error => res.status(404).send('User not found ' + error.message))

    } catch(error) {
        res.status(500).send('Erreur Inscription Try ' + error.message)
    }
}

/* Logout */
exports.logout = async (req, res, next) => {
    try{
        res.clearCookie('token');
        req.session.destroy();
        res.redirect('/');
    } catch(error) {
        res.status(500).send('Erreur Inscription Try ' + error.message)
    }
}