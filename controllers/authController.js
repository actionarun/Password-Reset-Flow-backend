import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import sendEmail from "../utils/sendEmail.js";


// REGISTER

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword
    });

    res.status(201).json({
      message: "User Registered Successfully",
      user
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};


// LOGIN

export const login = async (req, res) => {
  try {

    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "User not found"
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid Password"
      });
    }

    const token = jwt.sign(
      {
        id: user._id
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d"
      }
    );

    res.status(200).json({
      message: "Login Successful",
      token
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};


// FORGOT PASSWORD

export const forgotPassword = async (req, res) => {
  try {

    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const resetToken = uuidv4();

    user.resetToken = resetToken;

    user.resetTokenExpiry =
      Date.now() + 10 * 60 * 1000;

    await user.save();

    const resetLink =
      `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    await sendEmail(email, resetLink);

    res.status(200).json({
      message: "Reset link sent to email"
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};


// VERIFY TOKEN

export const verifyResetToken = async (req, res) => {
  try {

    const { token } = req.params;

    const user = await User.findOne({
      resetToken: token
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid Token"
      });
    }

    if (user.resetTokenExpiry < Date.now()) {
      return res.status(400).json({
        message: "Token Expired"
      });
    }

    res.status(200).json({
      message: "Token Valid"
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};


// RESET PASSWORD

export const resetPassword = async (req, res) => {
  try {

    const { token } = req.params;

    const { password } = req.body;

    const user = await User.findOne({
      resetToken: token
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid Token"
      });
    }

    if (user.resetTokenExpiry < Date.now()) {
      return res.status(400).json({
        message: "Token Expired"
      });
    }

    const hashedPassword =
      await bcrypt.hash(password, 10);

    user.password = hashedPassword;

    user.resetToken = "";

    user.resetTokenExpiry = null;

    await user.save();

    res.status(200).json({
      message: "Password Reset Successful"
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};