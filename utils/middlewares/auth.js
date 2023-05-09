const jwt = require('jsonwebtoken');
const User = require('../../models/User');

exports.authMiddleware = async (req, res, next) => {
    try {   
        const token = req.cookies.token;

        if(!token) {
            return res.status(401).json({ message: 'Non autorisé' });
        }

        const decodedToken = jwt.verify(token, process.env.SECRET_KEY_TOKEN);

        const user = await User.findById(decodedToken.userId);

        if(!user) {
            return res.status(401).json({ error: 'Token invalide' });
        }

        req.decodedToken = decodedToken;
        req.session.userId = decodedToken.userId;
        next();

    } catch(error) {
        res.status(401).send('Error auth ' + error.message);
    }
}