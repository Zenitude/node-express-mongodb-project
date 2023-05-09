const connectDb = () => {
    const mongoose = require('mongoose');
    mongoose.set ('strictQuery', true);

    mongoose.connect(process.env.URL_DATABASE)
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch((error) => console.log(`${error}`));
}

module.exports = connectDb;