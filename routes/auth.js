const express = require('express');
const router = express.Router();
const path = require('path');
const { signup, login, logout } = require('../controllers/users_controller');

/* SignUp */
router.get('/signup', (req, res) => {
    const userConnected = req.session.userConnected ? req.session.userConnected : null;
    res.status(200).render(path.join(__dirname, `../pages/signup.ejs`), { userConnected });
})

router.post('/signup/sign', signup);

/* SignIn */

router.get('/signin', (req, res) => {
    const userConnected = req.session.userConnected ? req.session.userConnected : null;
    res.status(200).render(path.join(__dirname, `../pages/signin.ejs`), { userConnected });
})

router.post('/signin/login', login);

/* LogOut */
router.get('/logout', (req, res) => {
    const userConnected = req.session.userConnected ? req.session.userConnected : null;
    res.status(200).render(path.join(__dirname, `../pages/logout.ejs`), { userConnected });
})

router.post('/logout/disconnect', logout);

module.exports = router;