const express = require('express');
const Notification = require('../models/Notification');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

// Get user's notifications
router.get('/', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate('actor', 'username avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);
    
    const totalNotifications = await Notification.countDocuments({ recipient: req.user._id });
    const unreadCount = await Notification.countDocuments({ 
      recipient: req.user._id, 
      isRead: false 
    });
    
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
    res.status(500).json({ error: error.message });
  }
});

// Mark notification as read
router.put('/:id/read', authenticate, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    // Check if user owns this notification
    if (notification.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'You can only mark your own notifications as read' });
    }
    
    notification.isRead = true;
    await notification.save();
    
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark all notifications as read
router.put('/read-all', authenticate, async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { isRead: true }
    );
    
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete notification
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    // Check if user owns this notification
    if (notification.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'You can only delete your own notifications' });
    }
    
    await Notification.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 