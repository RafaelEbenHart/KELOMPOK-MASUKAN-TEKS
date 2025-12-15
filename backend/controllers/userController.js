import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// REGISTER USER
export const registerUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "Email already used" });

        const hashedPass = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPass,
            role
        });

        res.status(201).json({
            message: "User registered",
            user
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// LOGIN USER
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Wrong password" });

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({
            message: "Login success",
            token,
            user
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// GET ALL USERS
export const getUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password");
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// GET USER BY ID
export const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password");
        if (!user) return res.status(404).json({ message: "User not found" });

        res.json(user);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// UPDATE USER
export const updateUser = async (req, res) => {
    try {
        const { name, email, role } = req.body;

        const updated = await User.findByIdAndUpdate(
            req.params.id,
            { name, email, role },
            { new: true }
        );

        res.json({
            message: "User updated",
            updated
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// DELETE USER
export const deleteUser = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);

        res.json({
            message: "User deleted"
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
