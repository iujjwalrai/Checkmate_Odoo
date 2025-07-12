const express = require('express');
const Notification = require('../models/Notification');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

// ==============================
// Get user's notifications route
// ==============================
router.get('/', authenticate, async (req, res) => {
  try {
    // Pagination query params with default values
    const { page = 1, limit = 20 } = req.query;
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    // Fetch paginated notifications for the authenticated user
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate('actor', 'username avatar') // Populate 'actor' field with username and avatar
      .sort({ createdAt: -1 })              // Sort notifications by most recent
      .skip(skip)                           // Skip based on current page
      .limit(limitNum);                     // Limit results per page
    
    // Total notifications count
    const totalNotifications = await Notification.countDocuments({ recipient: req.user._id });
    
    // Count of unread notifications
    const unreadCount = await Notification.countDocuments({ 
      recipient: req.user._id, 
      isRead: false 
    });
    
    // Return response with pagination data and unread count
    res.json({
      notifications,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalNotifications / limitNum),
        totalNotifications,
        hasMore: pageNum < Math.ceil(totalNotifications / limitNum)
      },
      unreadCount
    });
  } catch (error) {
    // Handle server error
    res.status(500).json({ error: error.message });
  }
});

// ==============================
// Mark a single notification as read
// ==============================
router.put('/:id/read', authenticate, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    // Check if notification exists
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    // Check if the notification belongs to the current user
    if (notification.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'You can only mark your own notifications as read' });
    }
    
    // Mark the notification as read and save
    notification.isRead = true;
    await notification.save();
    
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    // Handle server error
    res.status(500).json({ error: error.message });
  }
});

// ==============================
// Mark all notifications as read
// ==============================
router.put('/read-all', authenticate, async (req, res) => {
  try {
    // Update all unread notifications for the user
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { isRead: true }
    );
    
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    // Handle server error
    res.status(500).json({ error: error.message });
  }
});

// ==============================
// Delete a specific notification
// ==============================
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    // Check if notification exists
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    // Check if the notification belongs to the current user
    if (notification.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'You can only delete your own notifications' });
    }
    
    // Delete the notification
    await Notification.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    // Handle server error
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
