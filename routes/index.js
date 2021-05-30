const express = require('express');
const Router = express.Router();
const User = require('../Model/users');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const auth = require('../Auth/auth');
const { body, validationResult } = require('express-validator');

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


Router.post('/signup',
    upload,
    body('name').not().isEmpty().withMessage('Name must be provided'),
    body('password', 'Your password must be at least 5 characters').isLength({ min: 5 }),
    body('email', "Enter a valid email").isEmail(),
    body("about", "Write something about you").not().isEmpty(),
    async (req, res) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).send({ Errors: errors.array() })
        }

        try {
            const data = req.body;
            // console.log(data)
            let user = await User.findOne({ email: req.body.email });
            console.log("USER EMAIL:: ", user)
            if (user) {
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

Router.post('/login',
    body('password', 'Your password must be at least 5 characters').isLength({ min: 5 }),
    body('email', "Enter a valid email").isEmail(),
    async (req, res) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).send({ Errors: errors.array() })
        }

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

                res.cookie('token', token, { httpOnly: true, maxAge: 1000000 })

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

Router.get('/profile', auth, async (req, res) => {
    try {
        console.log("Body from profile:: ", req.body)
        const user = await User.findById(req.body.id);
        res.send({ message: "Welcomre to the profile page", UserDetails: user })
    } catch (error) {
        console.log(error.message);
        res.send({ message: "Error while fetching the profile", error: error.message });
    }
})



module.exports = Router;