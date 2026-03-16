const User = require('../models/User');
const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Email Template Wrapper
const getEmailTemplate = (title, body, buttonText, buttonUrl) => {
  return `
    <div style="background-color: #1a1a1e; padding: 40px 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #ffffff; text-align: center;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #27272c; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; padding: 40px; box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);">
        <h1 style="color: #0ca5a7; margin-bottom: 24px; font-size: 28px; letter-spacing: -0.5px;">${title}</h1>
        <div style="color: #a1a1aa; font-size: 16px; line-height: 1.6; margin-bottom: 32px;">
          ${body}
        </div>
        ${buttonText && buttonUrl ? `
          <a href="${buttonUrl}" style="background: linear-gradient(135deg, #0ca5a7 0%, #00767e 100%); color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; transition: all 0.3s ease;">
            ${buttonText}
          </a>
        ` : ''}
        <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid rgba(255, 255, 255, 0.05); font-size: 12px; color: #a1a1aa;">
          &copy; ${new Date().getFullYear()} Nasfat Contribution. All rights reserved.
        </div>
      </div>
    </div>
  `;
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  const { fullName, email, password, paymentFrequency } = req.body;

  try {
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const profileImage = req.file ? req.file.path : "";

    user = await User.create({
      fullName,
      email,
      password,
      paymentFrequency,
      profileImage,
      otp,
      otpExpires
    });

    // Send OTP Email
    await sendEmail({
      email: user.email,
      subject: 'Verify your email - Nasfat Contribution',
      message: `Your verification code is ${otp}. It expires in 10 minutes.`,
      html: getEmailTemplate(
        'Welcome to Nasfat!',
        `Hey ${fullName.split(' ')[0]},<br><br>We're excited to have you! To get started, please use the 6-digit verification code below to confirm your account:
        <div style="font-size: 32px; font-weight: bold; color: #0ca5a7; background: rgba(12, 165, 167, 0.1); padding: 16px; border-radius: 12px; margin: 24px 0; border: 1px dashed #0ca5a7;">
          ${otp}
        </div>
        This code is valid for <strong>10 minutes</strong>. If you didn't create an account, you can safely ignore this email.`
      )
    });

    res.status(201).json({
      success: true,
      message: "Registration successful. Please check your email for the verification code."
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: 'Please provide email and OTP' });
  }

  try {
    const user = await User.findOne({ email }).select('+otp +otpExpires');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Email already verified' });
    }

    if (user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Email verified successfully. You can now login.'
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Public
exports.resendOTP = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Email already verified' });
    }

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendEmail({
      email: user.email,
      subject: 'New Verification Code - Nasfat Contribution',
      message: `Your new verification code is ${otp}.`,
      html: getEmailTemplate(
        'New Verification Code',
        `You requested a new verification code. Please use the one below to verify your account:
        <div style="font-size: 32px; font-weight: bold; color: #0ca5a7; background: rgba(12, 165, 167, 0.1); padding: 16px; border-radius: 12px; margin: 24px 0; border: 1px dashed #0ca5a7;">
          ${otp}
        </div>
        This code is valid for <strong>10 minutes</strong>.`
      )
    });

    res.status(200).json({
      success: true,
      message: 'OTP resent successfully'
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }

  try {
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.status === 'inactive') {
      return res.status(403).json({ message: 'Your account has been deactivated. Please contact support.' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ 
        message: 'Please verify your email before logging in.',
        isVerified: false 
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      token,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        profileImage: user.profileImage,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
// @access  Public
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken field
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Set expire
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save({ validateBeforeSave: false });

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Password Reset Token',
        message,
        html: `
          <div style="background-color: #1a1a1e; padding: 40px 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #ffffff; text-align: center;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #27272c; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; padding: 40px; box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);">
              <h1 style="color: #f05a28; margin-bottom: 24px; font-size: 28px; letter-spacing: -0.5px;">Password Reset</h1>
              <div style="color: #a1a1aa; font-size: 16px; line-height: 1.6; margin-bottom: 32px;">
                You requested a password reset for your Nasfat account. Click the button below to set a new password:
              </div>
              <a href="${resetUrl}" style="background: linear-gradient(135deg, #f05a28 0%, #cc4518 100%); color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
                Reset Password
              </a>
              <p style="color: #a1a1aa; font-size: 14px; margin-top: 24px;">This link is valid for <strong>10 minutes</strong>. If you didn't request this, you can ignore this email.</p>
              <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid rgba(255, 255, 255, 0.05); font-size: 12px; color: #a1a1aa;">
                &copy; ${new Date().getFullYear()} Nasfat Contribution. All rights reserved.
              </div>
            </div>
          </div>
        `
      });

      res.status(200).json({ success: true, message: 'Email sent' });
    } catch (err) {
      console.error(err);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;

      await user.save({ validateBeforeSave: false });

      return res.status(500).json({ message: 'Email could not be sent' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Reset password
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resettoken)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid token' });
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Admin login
// @route   POST /api/auth/admin-login
// @access  Public
exports.adminLogin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }

  try {
    const admin = await Admin.findOne({ email }).select('+password');

    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (admin.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Not an admin.' });
    }

    const token = generateToken(admin._id);

    res.status(200).json({
      token,
      admin: {
        email: admin.email,
        role: admin.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};
