const mongoose = require('mongoose');

const userSchema =  mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    email:{
        type: String,
        required: true
    },
    password: {
        type:String,
        required:true
    },
     about: {
        type: String,
        required: true
    },
    profileImage: {
        type:String,
        required:true
    },
    createdAt: {
        type:Date,
        default: Date.now()
    }
})

module.exports = mongoose.model("user", userSchema);