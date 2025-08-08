const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
}, {
  timestamps: true // Add this for createdAt/updatedAt
});

module.exports = mongoose.model('UserOld', userSchema);
