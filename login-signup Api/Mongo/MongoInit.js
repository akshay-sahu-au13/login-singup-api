const mongoose = require('mongoose');
const URI = 'mongodb://localhost:27017/test';
const MongoInit = () => {
    mongoose.connect(URI, (err, connection) => {
        if (err){
            console.log("Error connecting to DB!");
        } else {
            console.log("DB Connected successfully!");
        }
    })
        
}

module.exports = MongoInit;