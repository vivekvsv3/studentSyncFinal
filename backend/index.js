const cors = require('cors');
const express = require('express');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const Users = require('./models/Users');
const FoodVendors = require('./models/FoodVendors'); // Assuming you need this

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB connection
mongoose
    .connect('mongodb://localhost:27017/flutterappdb', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.error(err));

// Registration Route
app.post('/register', async (req, res) => {
    const { email, password, role } = req.body;

    try {
        // Check if user already exists
        const existingUser = await Users.findOne({ email:email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already registered" });
        }


        const newUser = new Users({
            email,
            password,
            role: role || "user",
        });

        await newUser.save();
        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        res.status(500).json({ error: "Error registering user", details: error.message });
    }
});

// Login Route
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await Users.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Password check (if hashed passwords are implemented)
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        res.status(200).json({ message: "Login successful", user });
    } catch (error) {
        res.status(500).json({ error: "Error logging in", details: error.message });
    }
});

// Example: Food Vendor Routes (if needed)
app.post('/add-food-vendor', async (req, res) => {
    const { name, location, contact } = req.body;

    try {
        const newVendor = new FoodVendors({ name, location, contact });
        await newVendor.save();
        res.status(201).json({ message: "Food vendor added successfully" });
    } catch (error) {
        res.status(500).json({ error: "Error adding food vendor", details: error.message });
    }
});

app.get('/food-vendors', async (req, res) => {
    try {
        const vendors = await FoodVendors.find();
        res.status(200).json(vendors);
    } catch (error) {
        res.status(500).json({ error: "Error fetching food vendors", details: error.message });
    }
});

// Start server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
