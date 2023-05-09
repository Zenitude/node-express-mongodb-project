const express = require('express');
const router = express.Router();
const path = require('path');

router.get('/', (req, res) => {
    const userConnected = req.session.userConnected ? req.session.userConnected : null;
    res.status(200).render(path.join(__dirname, `../pages/contact.ejs`), { userConnected });
})

module.exports = router;