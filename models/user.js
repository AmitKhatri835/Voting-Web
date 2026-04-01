const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// define a user schema
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        requird: true,
    },

    age: {
        type: Number,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    mobile: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    aadharCardNumber: {
        type: Number,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ["admin", "voter"],
        default: "voter",
        required: true,
    },
    isVoted: {
        type: Boolean,
        default: false,
    },

});


userSchema.pre('save', async function () {
  const user = this;
  // hash the password only if it has been modified (or is new)
  if (!user.isModified('password')) return;
  try {
    //hash password generation
    const salt = await bcrypt.genSalt(5);

    // hash password
    const hashedPassword = await bcrypt.hash(user.password, salt);

    // override the plain text password with the hashed one
    user.password = hashedPassword;

  } catch (err) {
    return err;
  }
})

userSchema.methods.comparePassword = async function (userPassword) {
  try {
    // use bcrypt to compare the candidate password with the stored hashed password
    const isMatch = await bcrypt.compare(userPassword, this.password)
    return isMatch;
  } catch (err) {
    throw err;
  }
}


// create person model
const User = mongoose.model("User", userSchema);
module.exports = User;
