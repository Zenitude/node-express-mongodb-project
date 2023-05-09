const express = require('express');
const path = require('path');
const router = express.Router();

const { getUsers, getUserById, createUser, updateUser, deleteUser } = require('../controllers/users_controller');

const verifUSer = (req, res, next) => {
    const userId = req.session.userId ? req.session.userId : null;
    if(userId) { next(); }
    else{ 
        res.session.userConnected = `Vous n'êtes pas autorisé à accéder à cette page.`;
        res.redirect('/');
    }
}

// CREATE
router.get('/create', verifUSer, (req, res) => {
    const successCreateUser = req.session.successCreateUser ? req.session.successCreateUser : null;
    const userConnected = req.session.userConnected ? req.session.userConnected : null;
    res.status(200).render(path.join(__dirname, `../pages/management/users/createUsers.ejs`), { successCreateUser, userConnected });
})

router.post('/create', createUser);

// READ
router.get('/', verifUSer, getUsers, (req, res, next) => {
    const users = res.locals.listUsers;
    const successDeleteUser = req.session.successDeleteUser ? req.session.successDeleteUser : null;
    const userConnected = req.session.userConnected ? req.session.userConnected : null;
    res.status(200).render(path.join(__dirname, `../pages/management/users/users.ejs`), { users, successDeleteUser, userConnected });
})

router.get('/:id', verifUSer, getUserById, (req, res, next) => {
    const user = res.locals.detailsUser;
    const userConnected = req.session.userConnected ? req.session.userConnected : null;
    res.status(200).render(path.join(__dirname, `../pages/management/users/detailsUser.ejs`), { user, userConnected })
});

// UPDATE
router.get('/:id/update', verifUSer, getUserById, (req, res, next) => {
    const user = res.locals.detailsUser;
    const successUpdateUser = req.session.successUpdateUser ? req.session.successUpdateUser : null;
    const userConnected = req.session.userConnected ? req.session.userConnected : null;
    res.status(200).render(path.join(__dirname, `../pages/management/users/updateUser.ejs`), { user, successUpdateUser, userConnected });
});

router.put('/:id/update', verifUSer, updateUser);

// DELETE
router.get('/:id/delete', verifUSer, getUserById, (req, res, next) => {
    const user = res.locals.detailsUser;
    const userConnected = req.session.userConnected ? req.session.userConnected : null;
    res.status(200).render(path.join(__dirname, `../pages/management/users/deleteUser.ejs`), { user, userConnected })
})

router.delete('/:id/delete', verifUSer, deleteUser);

module.exports = router;