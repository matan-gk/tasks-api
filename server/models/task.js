var mongoose = require('mongoose');

var Task = mongoose.model('Task', {
    title: {
        type: String,
        required: true,
        minlength: 1,
        trim: true
    },
    notes: {
        type: String,
        default: ''
    },
    completed: {
        type: Boolean,
        default: false
    },
    completedAt: {
        type: Number,
        default: null
    }
});

module.exports = {
    Task
};