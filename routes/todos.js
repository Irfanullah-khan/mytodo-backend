const express = require('express');
const router = express.Router();
const Todo = require('../models/Todo');
const multer = require('multer');
const cloudinary = require('../config/cloudinaryConfig');
const { Readable } = require('stream');
const auth = require('../middleware/auth');

// Configure Multer (Memory Storage)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Helper to upload to Cloudinary from buffer
const uploadToCloudinary = (buffer) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            { folder: 'todo_app_uploads' },
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );
        const stream = Readable.from(buffer);
        stream.pipe(uploadStream);
    });
};

// GET all todos
router.get('/', auth, async (req, res) => {
    try {
        const todos = await Todo.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(todos);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST a new todo (with optional image)
router.post('/', auth, upload.single('image'), async (req, res) => {
    try {
        let imageUrl = null;
        let publicId = null;

        console.log('Received Create Todo Request');
        console.log('Body:', req.body);
        console.log('File:', req.file ? 'Received file' : 'No file');

        if (req.file) {
            try {
                const result = await uploadToCloudinary(req.file.buffer);
                imageUrl = result.secure_url;
                publicId = result.public_id;
            } catch (pUploadError) {
                console.error('Cloudinary Upload Failed:', pUploadError);
                return res.status(400).json({
                    message: `Cloudinary Error: ${pUploadError.message || 'Unknown upload error'}. Check server logs.`
                });
            }
        }

        const todo = new Todo({
            title: req.body.title, // Required
            description: req.body.description || '',
            imageUrl: imageUrl,
            publicId: publicId,
            user: req.user.id
        });

        const newTodo = await todo.save();
        res.status(201).json(newTodo);
    } catch (err) {
        console.error('Error creating todo:', err);
        res.status(400).json({ message: err.message });
    }
});

// PUT (update) a todo
router.put('/:id', auth, upload.single('image'), async (req, res) => {
    try {
        const todo = await Todo.findOne({ _id: req.params.id, user: req.user.id });
        if (!todo) return res.status(404).json({ message: 'Todo not found' });

        // Update Text Fields
        if (req.body.title) todo.title = req.body.title;
        if (req.body.description) todo.description = req.body.description;
        if (req.body.isCompleted !== undefined) todo.isCompleted = req.body.isCompleted === 'true' || req.body.isCompleted === true;

        // Handle Image Update
        if (req.file) {
            // Delete old image if exists
            if (todo.publicId) {
                await cloudinary.uploader.destroy(todo.publicId);
            }
            // Upload new image
            const result = await uploadToCloudinary(req.file.buffer);
            todo.imageUrl = result.secure_url;
            todo.publicId = result.public_id;
        }

        const updatedTodo = await todo.save();
        res.json(updatedTodo);
    } catch (err) {
        console.error('Error updating todo:', err);
        res.status(400).json({ message: err.message });
    }
});

// DELETE a todo
router.delete('/:id', auth, async (req, res) => {
    try {
        const todo = await Todo.findOne({ _id: req.params.id, user: req.user.id });
        if (!todo) return res.status(404).json({ message: 'Todo not found' });

        // Delete image from Cloudinary if exists
        if (todo.publicId) {
            await cloudinary.uploader.destroy(todo.publicId);
        }

        await todo.deleteOne();
        res.json({ message: 'Todo deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
