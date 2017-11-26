const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const validator = require('validator'); 
const bcrypt = require('bcryptjs');

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

userSchema.methods.removeToken = function (tokenToDelete) {
    var user = this;
    
    return user.update({
        $pull: {
            tokens: {
                token: tokenToDelete
            }
        }
    });
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

userSchema.statics.findByCredentials = function (email, password) {
    var User = this;

    return User.findOne({email}).then((user) => {
        if (!user) {
            return Promise.reject();
        }

        return new Promise((resolve, reject) => {
            bcrypt.compare(password, user.password, (err, res) => {
                if (res) resolve(user);
                else reject();
            });
        });
    });
};

userSchema.pre('save', function (next) {
    var user = this;

    if (user.isModified('password')) {
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(user.password, salt, (err, hashedPassword) => {
                user.password = hashedPassword;
                next();
            });
        });
    } else {
        next();
    }
});

var User = mongoose.model('user', userSchema);

module.exports = {
    User
};