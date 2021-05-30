const express = require('express');
const Router = express.Router();
const User = require('../Model/users');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const auth = require('../Auth/auth');


// -- setting up Storage for mukter -- //
const Storage = multer.diskStorage({
    destination: "./public/uploads/",
    filename: (req, file, cb) => {
        cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname))
    }
});

const imageFilter = function (req, file, cb) {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
        req.fileValidationError = 'Only image files are allowed!';
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};


// -- Init file upload -- //
let upload = multer({ storage: Storage, limits: { fileSize: 0.5 * 1024 * 1024 }, fileFilter: imageFilter }).single('profileImage');
// let upload = multer({
//     storage: Storage,
// }).single('dp');

Router.post('/signup', upload, async (req, res) => {
    const data = req.body;

    console.log(data)


    try {
        let user = await User.findOne({ email: req.body.email });
        console.log("USER EMAIL:: ", user.email)
        if (user.email === data.email) {
            // console.log(user)
            return res.send({ message: "User already exists, please login or signup with different email" })
        }
        user = new User({
            ...data, profileImage: req.file.path
        });

        const hashedPwd = await bcrypt.hash(data.password, 10)
        user.password = hashedPwd;

        await user.save();

        res.send({ message: "User registered!", UserInfo: user })
    } catch (error) {
        if (error) {
            console.log(error.message)
            res.send({ message: "Error while registering the user", error: error.message })
        }
    }

});

Router.post('/login', async (req, res) => {

    try {
        if (req.body.email && req.body.password) {
            const user = await User.findOne({ email: req.body.email });
            console.log("user:", user);
            if (!user) {
                return res.status(404).send({ message: "This email is not registered. Kindly signup first!" })
            }
            const pwd = await bcrypt.compare(req.body.password, user.password);
            if (!pwd) {
                return res.status(400).send({ message: "Invalid password..." })
            }

            const token = await jwt.sign({ id: user._id, email: user.email }, "my_login_secret")

            res.status(200).send({ message: "Login Success", userInfo: user, token })

        } else {
            return res.status(400).send({ message: "Enter both email and password!" })
        }
    }
    catch (error) {
        console.log(error.message)
        res.send({ message: "Error during Login", error: error.message });
    }
})

// Router.get('/profile', auth, (req, res)=> {

// })



module.exports = Router;