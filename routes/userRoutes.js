const express = require("express");
const router = express.Router();
const User = require("./../models/user"); // Import the user model
const { jwtAuthMiddleware, generateToken } = require("./../jwt")

// POST route to add a user
router.post("/signup", async (req, res) => {
    try {
        const data = req.body; // assuming the request body contains the user data

        // create a new user document using the mongoose model
        const newUser = new User(data);

        // save the new userto the database
        const response = await newUser.save();
        console.log("Data Saved");

        const payload = {
            id: response.id,
        }
        console.log(JSON.stringify(payload))

        const token = generateToken(payload);
        console.log("Token is: ", token)
        return res.status(200).json({
            response: response,
            token: token,
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});



// login route
router.post('/login', async (req, res) => {
    try {
        // extract aadharCardNumber and password from request body
        const { aadharCardNumber, password } = req.body;

        // find the user by aadharCardNumber
        const user = await User.findOne({ aadharCardNumber: aadharCardNumber });

        // if user does not exist or password does not match return error
        const isMatch = await user.comparePassword(password);
        if (!user || !isMatch) {
            return res.status(401).json({ error: "invalid aadharCardNumber or password" });
        }

        // generate token
        const payload = {
            id: user.id,
        }
        const token = generateToken(payload)

        // return token as response
        res.json({ token })

    } catch (err) {
        console.log(err)
        return res.status(500).json({ error: "Internal Server Error" })
    }
})


// GET method to get the user
router.get("/", async (req, res) => {
    try {
        const data = await User.find();
        console.log("Data Fetched");
        res.status(200).json(data);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});



// profile route
router.get('/profile', jwtAuthMiddleware, async (req, res) => {
    try {
        const userData = req.user;
        console.log("User data from token: ", userData)
        const userId = userData.id;
        const user = await user.findById(userId)
        return res.status(200).json({ user })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ error: "Internal Server Error" })
    }

})



router.put('/profile/password', async (req, res) => {
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;
        // find the user by userId
        const user = await User.findById(userId);

        // if password does not match return error
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({ error: "invalid aadharCardNumber or password" });
        }

        // update the users password
        user.password = newPassword;
        const response = await user.save();


        console.log("password updated")
        res.status(200).json(response)

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
})


module.exports = router;
