const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const validator = require('validator'); 

const saltSecret = 'crcgcrew5@4^t4%grtg67b$#%*g4v5T';

userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        unique: true,
        validate: {
            validator: validator.isEmail,
            message: '{VALUE} is not a valid email'
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    tokens: [{
        access: {
            type: String,
            required: true
        },
        token: {
            type: String,
            required: true
        }
    }]
});

userSchema.methods.generateAuthToken = function () {
    var user = this;
    var access = 'auth';
    var token = jwt.sign({_id: user._id.toHexString(), access}, saltSecret).toString();

    user.tokens.push({access, token});

    return user.save().then(() => {
        return token;
    })
};

userSchema.statics.findByToken = function (token) {
    var User = this;
    var decodedJwt;

    try {
        decodedJwt = jwt.verify(token, saltSecret);
    } catch (e) {
        return Promise.reject();
    }

    return User.findOne({
        '_id': decodedJwt._id,
        'tokens.token': token,
        'tokens.access': 'auth'
    });
};

var User = mongoose.model('user', userSchema);

module.exports = {
    User
};