const express = require("express");
const router = express.Router();
const Candidate = require("../models/candidate"); // Import the user model
const { jwtAuthMiddleware, generateToken } = require("./../jwt")
const User = require("../models/user");

const checkAdminRole = async (userId) => {
    try {
        const user = await User.findById(userId);
        return user.role === "admin";
    } catch (err) {
        return false;
    }
}

// POST route to add a candidate
router.post("/", jwtAuthMiddleware, async (req, res) => {
    try {
        if (! await checkAdminRole(req.user.id))
            return res.status(403).json({ error: "Access Denied You Are Not Admin" });


        const data = req.body; // assuming the request body contains the candidate data

        // create a new user document using the mongoose model
        const newCandidate = new Candidate(data);

        // save the new userto the database
        const response = await newCandidate.save();
        console.log("Candidate Saved");
        return res.status(201).json({ response: response });


    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});


router.put('/:candidateID', jwtAuthMiddleware, async (req, res) => {
    try {
        if (!checkAdminRole(req.user.id))
            return res.status(404).json({ error: "Access Denied You Are Not Admin" });

        const candidateID = req.params.candidateID;
        const updatedCandidateData = req.body;
        const response = await Candidate.findByIdAndUpdate(candidateID, updatedCandidateData, {
            new: true, // return the updated document
            runValidators: true, //Run mongoose Validations
        })
        if (!response) {
            return res.status(403).json({ error: "Candidate not found" })
        }
        console.log("Candidate updated")
        return res.status(200).json(response)

    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
})


router.delete('/:candidateID', jwtAuthMiddleware, async (req, res) => {
    try {
        if (!checkAdminRole(req.user.id))
            return res.status(403).json({ error: "Access Denied You Are Not Admin" });

        const candidateID = req.params.candidateID;

        const response = await Candidate.findByIdAndDelete(candidateID);
        if (!response) {
            return res.status(404).json({ error: "Candidate not found" })
        }
        console.log("Candidate Deleted")
        return res.status(200).json(response)

    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
})


// start voting for a candidate
router.post('/vote/:candidateID', jwtAuthMiddleware, async (req, res) => {
    // no admin can vote
    // only voters can vote once

    const candidateID = req.params.candidateID;
    const userID = req.user.id;

    try {
        // find candidate by id
        const candidate = await Candidate.findById(candidateID);
        if (!candidate) {
            return res.status(404).json({ message: "Candidate Not Found" })
        }

        // find user by id
        const user = await User.findById(userID);
        if (!user) {
            return res.status(404).json({ message: "User Not Found" })
        }
        if (user.isVoted) {
            return res.status(403).json({ message: "You Already Have Voted" })
        } else {
            // update the the candidate document to record the vote
            candidate.votes.push(userID);
            candidate.voteCount++;
            await candidate.save();
        }

        if (user.role === "admin") {
            return res.status(403).json({ message: "Admin Cannot Vote" });
        }
        // update the user Document
        user.isVoted = true;
        await user.save();

        return res.status(200).json({ message: "Vote Casted Successfully" });

    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});


// vote count
router.get('/vote/count', async (req, res) => {
    try {
        // find all candidates and sort them by vote count in descending order
        const candidate = await Candidate.find().sort({ voteCount: 'desc' });

        // map the candidates to include only the name and vote count
        const voteRecord = candidate.map((data) => {
            return {
                party: data.party,
                count: data.voteCount
            }
        })

        return res.status(200).json(voteRecord);

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// GET method to get the user
router.get("/", jwtAuthMiddleware, async (req, res) => {
    try {
        const data = await Candidate.find();
        console.log("Data Fetched");
        res.status(200).json(data);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});



module.exports = router;


// 69cd1ae5cd5660a008815b98 - BJP
// 69cd1c90cd5660a008815ba2 - INC

// voter - eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5Y2QzOGExNzNiNGUwMDgxOTlhODZhMiIsImlhdCI6MTc3NTA1NzA1NywiZXhwIjoxNzc1MTAwMjU3fQ.yHe_0ILfKIcT2MjX6vkyNRuHpiulFG4cdKX9va_sXdI
// admin - eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5Y2QzYmIxMzhjYjg4MDEyODUwNzY0OSIsImlhdCI6MTc3NTA1Nzg0MSwiZXhwIjoxNzc1MTAxMDQxfQ.B1OjX6vw4x2sXm5dCDL-X-ZjWXhpDgHjiHs3ZtGGlCA
