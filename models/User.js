const mongoose = require('mongoose');
const AddressUser = require('./AddressUser');
const uniqueValidator = require('mongoose-unique-validator');

const userSchema = mongoose.Schema({
    lastname: {
        type: String,
        required: true,
        trim: true
    },
    firstname: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    birth: {
        type: Date,
        required: true,
        trim: true
    },
    address: {
        type: mongoose.Schema.Types.ObjectId,
        ref: AddressUser
    }
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);