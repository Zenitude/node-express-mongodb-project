
const express = require('express');  
const app = express(); 
const morgan = require ('morgan'); 
const session = require('express-session');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');
const { authMiddleware } = require('./utils/middlewares/auth');

const homeRoutes = require('./routes/home'); 
const contactRoutes = require('./routes/contact'); 
const userRoutes = require('./routes/users'); 
const authRoutes = require('./routes/auth');

const dotenv = require('dotenv');
dotenv.config(); 

const connectDb = require('./utils/database/db'); 
connectDb(); 

app.use((req, res, next) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

app.use(cookieParser());
app.use(methodOverride('_method'));
app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: process.env.SECRET_KEY_AUTH,
    resave: false,
    saveUninitialized: false
}))

app.use('/images', express.static(`${__dirname}/public/images`));
app.use('/styles', express.static(`${__dirname}/public/styles/css`));
app.use('/scripts', express.static(`${__dirname}/public/scripts`));

app.use(require('./utils/middlewares/dateRequest'));
app.use(morgan('dev')); 

app.use('/', homeRoutes);
app.use('/contact', contactRoutes);
app.use('/users', authMiddleware, userRoutes);
app.use(authRoutes);

app.use((req, res) => {
    const userConnected = req.session.userConnected ? req.session.userConnected : null;
    try{ res.status(404).render(`${__dirname}/pages/error.ejs`, {userConnected}); } 
    catch(error) { console.log(error); }
})

app.listen((process.env.PORT || 3000), () => {
    console.log(`Le serveur est disponible à l'adresse : http://${process.env.HOST}:${process.env.PORT ? process.env.PORT : 3000}`);
});