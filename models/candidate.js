const mongoose = require("mongoose");
// const bcrypt = require("bcrypt");

// define a candidate schema
const candidateSchema = new mongoose.Schema({
    name: {
        type: String,
        requird: true,
    },
    party: {
        type: String,
        required: true,
    },
    age: {
        type: Number,
        required: true,
    },
    votes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        votedAt: {
            type: Date,
            default: Date.now(),
        }
    }],
    voteCount: {

        type: Number,
        default: 0,
    },
});

// create candidate model
const Candidate = mongoose.model("Candidate", candidateSchema);
module.exports = Candidate;
