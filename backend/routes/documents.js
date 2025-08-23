const express = require('express');
const router = express.Router();
const Document = require('../models/Document');
const { verifyToken } = require('../middleware/auth'); // Use verifyToken

// Get all documents (with sharing access)
router.get('/', verifyToken, async (req, res) => {
  try {
    const documents = await Document.find({
      $or: [
        { owner: req.user.id },           // Documents owned by user
        { sharedWith: req.user.id }       // Documents shared with user
      ]
    }).populate('owner', 'username')
      .populate('sharedWith', 'username email')
      .sort({ updatedAt: -1 });
    
    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single document (with sharing access)
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate('owner', 'username')
      .populate('sharedWith', 'username email');
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Check if user has access (owner or shared with)
    const hasAccess = document.owner._id.toString() === req.user.id || 
                     document.sharedWith.some(user => user._id.toString() === req.user.id);
    
    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(document);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create document
router.post('/', verifyToken, async (req, res) => {
  try {
    const { title, content } = req.body;
    const document = new Document({
      title,
      content,
      owner: req.user.id
    });
    await document.save();
    res.status(201).json(document);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update document (with sharing access)
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Check if user has edit access (owner or shared with)
    const hasAccess = document.owner.toString() === req.user.id || 
                     document.sharedWith.includes(req.user.id);
    
    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Update the document
    const { title, content } = req.body;
    document.title = title || document.title;
    document.content = content || document.content;
    document.updatedAt = new Date();
    
    await document.save();
    
    res.json(document);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete document (only owner can delete)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Only owner can delete
    if (document.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only document owner can delete' });
    }

    await Document.findByIdAndDelete(req.params.id);
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get shared users for a document
router.get('/:id/shared', verifyToken, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate('sharedWith', 'username email');
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Check if user is owner or has access
    if (document.owner.toString() !== req.user.id && 
        !document.sharedWith.some(user => user._id.toString() === req.user.id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ sharedWith: document.sharedWith });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Share document with a user
router.post('/:id/share', verifyToken, async (req, res) => {
  try {
    const { userId } = req.body;
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Check if user is owner
    if (document.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only document owner can share' });
    }

    // Check if already shared
    if (document.sharedWith.includes(userId)) {
      return res.status(400).json({ message: 'Document already shared with this user' });
    }

    document.sharedWith.push(userId);
    await document.save();

    res.json({ message: 'Document shared successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Remove share from a user
router.delete('/:id/share/:userId', verifyToken, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Check if user is owner
    if (document.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only document owner can remove shares' });
    }

    document.sharedWith = document.sharedWith.filter(
      userId => userId.toString() !== req.params.userId
    );
    await document.save();

    res.json({ message: 'Share removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
