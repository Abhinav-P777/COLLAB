const express = require('express');
const router = express.Router();
const Document = require('../models/Document');
const { verifyToken } = require('../middleware/auth');

// Get all documents (with sharing access)
router.get('/', verifyToken, async (req, res) => {
  try {
    const documents = await Document.find({
      $or: [
        { owner: req.user.id },           // Documents owned by user
        { sharedWith: req.user.id }       // Documents shared with user
      ]
    })
    .populate('owner', 'email')          // Populate with email instead of username
    .populate('sharedWith', 'email')     // Populate with email instead of username
    .sort({ updatedAt: -1 });
    
    res.json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get single document (with sharing access)
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate('owner', 'email')
      .populate('sharedWith', 'email');
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Check if user has access (owner or shared with)
    const isOwner = document.owner._id.toString() === req.user.id;
    const isSharedWith = document.sharedWith.some(user => user._id.toString() === req.user.id);
    
    if (!isOwner && !isSharedWith) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(document);
  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create document
router.post('/', verifyToken, async (req, res) => {
  try {
    const { title, content } = req.body;
    
    if (!title || title.trim() === '') {
      return res.status(400).json({ message: 'Document title is required' });
    }
    
    const document = new Document({
      title: title.trim(),
      content: content || '',
      owner: req.user.id,
      sharedWith: [] // Initialize as empty array
    });
    
    const savedDocument = await document.save();
    
    // Populate the saved document before returning
    const populatedDocument = await Document.findById(savedDocument._id)
      .populate('owner', 'email')
      .populate('sharedWith', 'email');
    
    res.status(201).json(populatedDocument);
  } catch (error) {
    console.error('Error creating document:', error);
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
    const isOwner = document.owner.toString() === req.user.id;
    const isSharedWith = document.sharedWith.includes(req.user.id);
    
    if (!isOwner && !isSharedWith) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Update the document
    const { title, content } = req.body;
    
    if (title !== undefined) {
      if (title.trim() === '') {
        return res.status(400).json({ message: 'Document title cannot be empty' });
      }
      document.title = title.trim();
    }
    
    if (content !== undefined) {
      document.content = content;
    }
    
    document.updatedAt = new Date();
    await document.save();
    
    // Return populated document
    const updatedDocument = await Document.findById(document._id)
      .populate('owner', 'email')
      .populate('sharedWith', 'email');
    
    res.json(updatedDocument);
  } catch (error) {
    console.error('Error updating document:', error);
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
    console.error('Error deleting document:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get shared users for a document
router.get('/:id/shared', verifyToken, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate('sharedWith', 'email');
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Check if user has access to see sharing info (owner or shared user)
    const isOwner = document.owner.toString() === req.user.id;
    const isSharedWith = document.sharedWith.some(user => user._id.toString() === req.user.id);
    
    if (!isOwner && !isSharedWith) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ sharedWith: document.sharedWith });
  } catch (error) {
    console.error('Error fetching shared users:', error);
    res.status(500).json({ message: error.message });
  }
});

// Share document with a user
router.post('/:id/share', verifyToken, async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Only owner can share
    if (document.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only document owner can share' });
    }

    // Check if user is trying to share with themselves
    if (userId === req.user.id) {
      return res.status(400).json({ message: 'Cannot share document with yourself' });
    }

    // Check if already shared
    if (document.sharedWith.includes(userId)) {
      return res.status(400).json({ message: 'Document already shared with this user' });
    }

    // Add user to sharedWith array
    document.sharedWith.push(userId);
    await document.save();

    res.json({ 
      message: 'Document shared successfully',
      sharedWith: document.sharedWith 
    });
  } catch (error) {
    console.error('Error sharing document:', error);
    res.status(500).json({ message: error.message });
  }
});

// Remove share from a user
router.delete('/:id/share/:userId', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Only owner can remove shares
    if (document.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only document owner can remove shares' });
    }

    // Check if user is actually shared with
    if (!document.sharedWith.includes(userId)) {
      return res.status(400).json({ message: 'Document is not shared with this user' });
    }

    // Remove user from sharedWith array
    document.sharedWith = document.sharedWith.filter(
      id => id.toString() !== userId
    );
    await document.save();

    res.json({ 
      message: 'Share removed successfully',
      sharedWith: document.sharedWith 
    });
  } catch (error) {
    console.error('Error removing share:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get document permissions for current user (useful for UI)
router.get('/:id/permissions', verifyToken, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    const isOwner = document.owner.toString() === req.user.id;
    const isSharedWith = document.sharedWith.includes(req.user.id);
    
    if (!isOwner && !isSharedWith) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const permissions = {
      canRead: isOwner || isSharedWith,
      canWrite: isOwner || isSharedWith,
      canShare: isOwner,
      canDelete: isOwner,
      isOwner: isOwner
    };

    res.json(permissions);
  } catch (error) {
    console.error('Error getting permissions:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
