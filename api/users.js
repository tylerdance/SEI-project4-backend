require('dotenv').config();
const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const passport = require('passport')
const JWT_SECRET = process.env.JWT_SECRET

const db = require('../models')

router.get('/test', (req, res) => {
    res.json({ message: 'User endpoint' })
})

// get all users from database
router.get('/users', (req, res) => {
    db.User.find().then((user) => {
        console.log(user);
        res.status(201).json({ user })
    }).catch((error) => { res.send({ error })})
})

// POST api/users/register (Public route)
router.post('/register', (req, res) => {
    // find user by email
    db.User.findOne({ email: req.body.email })
    .then(user => {
        // if email already exists, send a 400 response
        if (user) {
            return res.status(400).json({ msg: 'Email already exists' })
        } else {
            // create new user
            const newUser = new User({
                name: req.body.name,
                email: req.body.email,
                password: req.body.password,
                age: req.body.age,
                gender: req.body.gender,
                bio: req.body.bio,
                preference: req.body.preference,
                image_url: req.body.photo
            })
            // Salt and hash the password, then save the user
            bcrypt.genSalt(10, (err, salt) => {
                if (err) throw Error;
                bcrypt.hash(newUser.password, salt, (error, hash) => {
                    if (error) throw Error;
                    // change password in new User to the hash
                    newUser.password = hash;
                    newUser.save()
                    .then(createdUser => res.json(createdUser))
                    .catch(err => console.log(err));
                })
            })
        }
    })
})

// POST api/users/login (public)
router.post('/login', (req, res) => {
    const email = req.body.email
    const password = req.body.password
    // find user via email
    db.User.findOne({ email })
    .then(user => {
        // check if there is NOT a user
        console.log(user);
        if (!user) {
            res.status(400).json({ msg: 'User not found'})
        } else {
            bcrypt.compare(password, user.password)
            .then(isMatch => {
                if (isMatch) {
                    console.log(isMatch);
                    const payload = {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        age: user.age,
                        bio: user.bio,
                        gender: user.gender,
                        preference: user.preference
                    }
                    // sign token
                    jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' }, (error, token) => {
                        res.json({
                            success: true,
                            token: `Bearer ${token}`,
                        })
                    })
                } else {
                    return res.status(400).json({ msg: 'Email or password is incorrect' })
                }
            })
        }
    })
})

// GET api/users/current (private)
router.get('/current', passport.authenticate('jwt', { session: false }), (req, res) => {
    res.json({
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
    })
})

router.get('/myphoto/:id', (req,res)=>{
    db.User.find({ email: req.params.id }).then((user) => {
      res.status(201).json({ user })
    }).catch((error) => res.send({ error }))
  })

router.post('/profile/setup/image', (req, res) => {
    const email = req.body.email;
    db.User.update(
      { email: email },
      { $set: { "image_url": req.body.image_url }
      }
    ).then((response) => {
      res.status(201).json({ response })
    }).catch((error) => res.send({ error }))
  })

  
router.get('/myinfo/:id', (req,res)=>{
    db.User.find({ email: req.params.id }).then((user) => {
        res.status(201).json({ user })
    }).catch((error) => res.send({ error }))
})

router.get('/users/random', (req, res) => {
// db.User.count().then((user) => {
    db.User.aggregate([{ $sample: { size: 1 } }]).then((user) => {
    // console.log(Math.floor(Math.random() * user));
        // const randomUser = Math.floor(Math.random() * user)
        let profile = user[0];
        console.log(user);
        res.status(201).json({ profile })
    }).catch((error) => { res.send({ error })})
})

// get one random female user with male preference
router.get('/users/male/Female', (req, res) => {
    db.User.find( { $and: [{ gender: { $ne: "male" } }, { preference: { $ne: "Female" } }]})
    .then((user) => {
        let num = Math.floor(Math.random() * user.length)
        const profile = user[num]
        console.log(profile);
        // console.log(user);
        res.status(201).json({ profile })
    }).catch((error) => { res.send({ error })})
})
// get one random male user with female preference
router.get('/users/female/Male', (req, res) => {
    db.User.find( { $and: [{ gender: { $ne: "female" } }, { preference: { $ne: "Male" } }]})
    .then((user) => {
        let num = Math.floor(Math.random() * user.length)
        const profile = user[num]
        console.log(profile);
        // console.log(user);
        res.status(201).json({ profile })
    }).catch((error) => { res.send({ error })})
})

// get one random female user with female preference
router.get('/users/female/Female', (req, res) => {
    db.User.find( { $and: [{ gender: { $ne: "male" } }, { preference: { $ne: "Male" } }]})
    .then((user) => {
        let num = Math.floor(Math.random() * user.length)
        const profile = user[num]
        console.log(profile);
        // console.log(user);
        res.status(201).json({ profile })
    }).catch((error) => { res.send({ error })})
})
// get one random male user with male preference
router.get('/users/male/Male', (req, res) => {
    db.User.find( { $and: [{ gender: { $ne: "female" } }, { preference: { $ne: "Female" } }]})
    .then((user) => {
        let num = Math.floor(Math.random() * user.length)
        const profile = user[num]
        console.log(profile);
        // console.log(user);
        res.status(201).json({ profile })
    }).catch((error) => { res.send({ error })})
})

// get one random male user
// router.get('/users/male', (req, res) => {
//     db.User.aggregate([{ $match: { gender: "male" }}])
//     .then((user) => {
//         let num = Math.floor(Math.random() * user.length)
//         const profile = user[num]
//         console.log(profile);
//         // console.log(user);
//         res.status(201).json({ profile })
//     }).catch((error) => { res.send({ error })})
// })
// // get one random female user
// router.get('/users/female', (req, res) => {
//     db.User.aggregate([{ $match: { gender: "female" }}])
//     .then((user) => {
//         let num = Math.floor(Math.random() * user.length)
//         const profile = user[num]
//         console.log(profile);
//         // console.log(user);
//         res.status(201).json({ profile })
//     }).catch((error) => { res.send({ error })})
// })

module.exports = router;