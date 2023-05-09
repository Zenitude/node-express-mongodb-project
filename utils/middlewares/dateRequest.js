const dataRequest = (req, res, next) => {
    console.log(new Date().toLocaleString());
    next();
};

module.exports = dataRequest;