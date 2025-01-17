const express = require('express');
const multer = require('multer');
const Candidate = require('../models/Candidate');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Setup file upload destination
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir); // Create directory if it doesn't exist
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Set upload directory
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname); // Add timestamp to filename
  },
});

// Initialize multer with file size and type limits
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Limit file size
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.includes('pdf')) {
      return cb(new Error('Only PDF files are allowed.'));
    }
    cb(null, true);
  },
}).single('resume'); 

// Get all candidates
router.get('/', async (req, res) => {
  try {
    const candidates = await Candidate.find();
    res.json(candidates);
  } catch (error) {
    console.error('Error fetching candidates:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Post a new candidate
router.post('/', upload.single('resume'), async (req, res) => {
  const { name, email, phone, jobTitle } = req.body;
  const resume = req.file ? req.file.path : null; // Handle file upload

  // Validate required fields
  if (!name || !email || !phone || !jobTitle) {
    return res.status(400).json({ message: 'All fields (name, email, phone, jobTitle) are required' });
  }

  // Validate email format
  const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  // Validate phone number format (10 digits)
  const phoneRegex = /^[0-9]{10}$/;
  if (!phoneRegex.test(phone)) {
    return res.status(400).json({ message: 'Invalid phone number format' });
  }

  try {
    // Check if candidate with the same email already exists
    const existingCandidate = await Candidate.findOne({ email });
    if (existingCandidate) {
      return res.status(400).json({ message: 'Candidate with this email already exists' });
    }

    // Create a new candidate document
    const newCandidate = new Candidate({
      name,
      email,
      phone,
      jobTitle,
      resume,
    });

    // Save the new candidate to the database
    await newCandidate.save();
    res.status(201).json(newCandidate); // Respond with the new candidate

  } catch (error) {
    console.error('Error referring candidate:', error); // Log detailed error
    res.status(500).json({ message: 'Server error, please try again later', error: error.message }); // Send error response
  }
});

// Update candidate status
router.put('/:id/status', async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['Pending', 'Reviewed', 'Hired'];

  // Validate status
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    const candidate = await Candidate.findByIdAndUpdate(req.params.id, { status }, { new: true });
    
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    res.json(candidate);
  } catch (error) {
    console.error('Error updating candidate:', error);
    res.status(500).json({ message: 'Server error, please try again later' });
  }
});

// Delete a candidate
router.delete('/:id', async (req, res) => {
  const candidateId = req.params.id;

  try {
    const candidate = await Candidate.findByIdAndDelete(candidateId);
    
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    res.json({ message: 'Candidate deleted' });
  } catch (error) {
    console.error('Error deleting candidate:', error);
    res.status(500).json({ message: 'Server error, please try again later' });
  }
});

module.exports = router;
