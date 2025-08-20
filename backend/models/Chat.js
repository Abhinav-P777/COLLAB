const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    roomId: { type: String, required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    messageType: { type: String, enum: ['text', 'file', 'image'], default: 'text' },
    createdAt: { type: Date, default: Date.now },
});

chatSchema.index({ roomId: 1, createdAt: -1 });

module.exports = mongoose.model('Chat', chatSchema);
