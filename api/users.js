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
                image_url: req.body.photo,
                location: req.body.location
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
                        image_url: user.image_url,
                        gender: user.gender,
                        preference: user.preference,
                        bio: user.bio,
                        location: user.location
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
router.post('/notifications', (req, res) => {
    console.log('i am req.body', req.body);
    const from_sender = req.body.id
    const content = req.body.content;
    const date = req.body.time;
    const my_id = req.body.my_id;
    const type = req.body.type;
    const read = req.body.read;
    const pic = req.body.pic;
    const email = req.body.email
    const name = req.body.name
    console.log('i am email', email);
    db.User.update(
        { _id: my_id },
        { $push: { "notifications":
            {
                "from_sender": from_sender,
                "content": content,
                "date": date,
                "my_id": my_id,
                "type": type,
                "read": read,
                "pic": pic, 
                "email": email,
                "name": name
            }
        }}
    ).then((response) => {
        res.status(201).json({ response })
    }).catch((error) => res.send({ error }))
})
// READ NOTIF
router.post('/notifications/read', (req, res) => {
    const { email, id, user } = req.body;
    // const id = req.body.id;
    const truthy = true
    db.User.findOneAndUpdate(
        { '_id': user, 'notifications._id': id },
        { $set: { "notifications.$.read": truthy }}
    ).then((response) => {
        res.status(201).json({ response })
    }).catch((error) => res.send({ error }))
})
router.get('/getnotifications/:id', (req, res) =>{ 
    console.log('i am notifications', req.body.content);
    db.User.find({ email: req.params.id })
    .then((user) => {
        res.status(201).json({ user })
        console.log('dexter is driving');
    }).catch((error) => res.send({ error }))
})
///////////////////////////////////////////// RANDOM ROUTES //////////////////////////////////////////////////////
/// new random route for males with prefs both
router.get('/users/random/male/:id/:location', (req, res) => {
    db.User.find({ $and:
        [
            { preference: { $ne: "Female" }},
            { "email": { $ne: req.params.id }}, 
            { "location": { $eq: req.params.location }} 
        ]
    })
    .then((user) => {
        // console.log(`These are all the users -  ${user}`)
        let num = Math.floor(Math.random() * user.length)
        const profile = user[num]
        // console.log(`This is the random profile - ${profile}`)
        res.status(201).json({ profile })
    }).catch((error) => { res.send({ error })})
})
/// new random route for females with prefs both
router.get('/users/random/female/:id/:location', (req, res) => {
    db.User.find({ $and:
        [
            { preference: { $ne: "Male" }},
            { "email": { $ne: req.params.id }}, 
            { "location": { $eq: req.params.location }} 
        ]
    })
    .then((user) => {
        // console.log(`These are all the users -  ${user}`)
        let num = Math.floor(Math.random() * user.length)
        const profile = user[num]
        // console.log(`This is the random profile - ${profile}`)
        res.status(201).json({ profile })
    }).catch((error) => { res.send({ error })})
})
// original random route
// router.get('/users/random', (req, res) => {
// // db.User.count().then((user) => {
//     db.User.aggregate([{ $sample: { size: 1 } }]).then((user) => {
//     // console.log(Math.floor(Math.random() * user));
//         // const randomUser = Math.floor(Math.random() * user)
//         let profile = user[0];
//         console.log(user);   
//         res.status(201).json({ profile })
//     }).catch((error) => { res.send({ error })})
// })
// get one random female user with male preference
router.get('/users/male/Female/:id/:location', (req, res) => {
    db.User.find({ $and: 
        [
            { gender: { $ne: "male" }}, 
            { preference: { $ne: "Female" }}, 
            { "email": { $ne: req.params.id }}, 
            { "location": { $eq: req.params.location }} 
        ]
    })
    .then((user) => {
        console.log('i am user ', user);
        if (user.length === 0) {
            // res.status(200).json({ msg: 'Sorry, we could not find anyone in your area' })
        } else {
            let num = Math.floor(Math.random() * user.length)
            const profile = user[num]
            console.log(profile);
            // console.log(user);
            res.status(201).json({ profile })
        }
    }).catch((error) => { res.send({ error })})
})
// get one random male user with female preference
router.get('/users/female/Male/:id/:location', (req, res) => {
    db.User.find( { $and: 
        [
            { gender: { $ne: "female" }}, 
            { preference: { $ne: "Male" }}, 
            { "email": { $ne: req.params.id }},
            { "location": { $eq: req.params.location }}
        ]
    })
    .then((user) => {
        console.log('i am user ', user);
        if (user.length === 0) {
            // res.status(200).json({ msg: 'Sorry, we could not find anyone in your area' })
        } else {
            let num = Math.floor(Math.random() * user.length)
            const profile = user[num]
            console.log(profile);
            // console.log(user);
            res.status(201).json({ profile })
        }
    }).catch((error) => { res.send({ error })})
})
// get one random female user with female preference
router.get('/users/female/Female/:id/:location', (req, res) => {
    db.User.find( { $and:
        [
            { gender: { $ne: "male" }}, 
            { preference: { $ne: "Male" }}, 
            { "email": { $ne: req.params.id }},
            { "location": { $eq: req.params.location }}
        ]
    })
    .then((user) => {
        let num = Math.floor(Math.random() * user.length)
        const profile = user[num]
        console.log(profile);
        // console.log(user);
        res.status(201).json({ profile })
    }).catch((error) => { res.send({ error })})
})
// get one random male user with male preference
router.get('/users/male/Male/:id/:location', (req, res) => {
    db.User.find( { $and: 
        [
            { gender: { $ne: "female" }}, 
            { preference: { $ne: "Female" }}, 
            { "email": {$ne: req.params.id }},
            { "location": { $eq: req.params.location }}
        ]
    })
    .then((user) => {
        let num = Math.floor(Math.random() * user.length)
        const profile = user[num]
        console.log(profile);
        // console.log(user);
        res.status(201).json({ profile })
    }).catch((error) => { res.send({ error })})
})
router.post('/profile/status', (req, res) => {
    console.log(req)
    const email = req.body.email;
    const online = req.body.online
    db.User.updateOne(
      { email: email },
      { $set: { "online": online }
      }
    ).then((response) => {
      res.status(201).json({ response })
    }).catch((error) => res.send({ error }))
  })
module.exports = router;