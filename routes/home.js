const express = require('express');
const router = express.Router();
const path = require('path');

router.get('/', (req, res) => {
    const userConnected = req.session.userConnected ? req.session.userConnected : null;
    res.status(200).render(path.join(__dirname, `../index.ejs`), { userConnected });
})

module.exports = router;