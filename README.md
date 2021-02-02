# Token

Token is a websocket based chat app experiment that allows users to find connections based on their gender, preference, and location. Swipe right to send a chat invitation to that user, swipe left to shuffle the database. 

Create test account in Kansas City for populated demo search results.

[Live Site](http://tokenapp-backend.herokuapp.com)

Frontend repo:
https://github.com/tylerdance/SEI-project4-frontend

Backend repo:
https://github.com/tylerdance/SEI-project4-backend

### Tech Stack
```
MongoDB / Express / React.js / Node
```

### Installation
- Confirm installation of MongoDB
- After cloning both the frontend and backend repos, run `npm i` to install node package dependencies
- Create a `.env` file on the backend with a `JWT_SECRET` and a `MONGO_URI`

#### Example backend `.env`:
```
JWT_SECRET="thiscanbeanything"
MONGO_URI="mongodb://127.0.0.1:27017/nameOfYourDatabase"
```
- Create a `.env` file on the frontend to create a variable to connect to your backend server

#### Example frontend `.env`:
```
REACT_APP_SERVER_URL=http://localhost:8000
```

### User model
Token's backend database stores the information from the sign up form that is required to accurately sort your unique swipe results based on your preferences and location. Notifications are saved in a subscemema array to save chat history between users.

Swipe result routes are automated based on an individual users gender, preference, and location. Multiple instances of `props` are interpolated in the frontend `Axios` requests for the backend to accept as randomization instructions.

`~and` operator is used to pass a series of conditional checks to sort results for different combinations of user gender, preferences, and location. The results are then randomized and reduced to 1

```js
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
```

Notifications are handled with a `post` route that flips the `read` boolean in the `notificationsSchema` to truthy if the user hides a notification in their notifications window.

```js
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
```
