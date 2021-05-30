const mongoose = require('mongoose');
const URI = 'mongodb+srv://akshay:admin@cluster0.3sl2w.mongodb.net/BackendApr?retryWrites=true&w=majority';
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