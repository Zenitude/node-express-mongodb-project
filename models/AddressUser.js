const mongoose = require('mongoose');

const addressUserSchema = mongoose.Schema({
    street: {
        type: String,
        required: true,
    },
    zipcode: {
        type: Number,
        required: true,
    },
    city: {
        type: String,
        required: true,
    }
});

module.exports = mongoose.model('AddressUser', addressUserSchema);