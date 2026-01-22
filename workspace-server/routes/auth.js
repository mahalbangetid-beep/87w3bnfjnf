const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { User, Role, ActivityLog } = require('../models');
const { authenticate } = require('../middleware/auth');
const { OAuth2Client } = require('google-auth-library');

// Validation rules
const registerValidation = [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('phone').trim().notEmpty().withMessage('Phone number is required')
        .matches(/^(\+62|62|0)8[1-9][0-9]{6,10}$/).withMessage('Valid Indonesian phone number is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

const loginValidation = [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
];

// Generate JWT token
const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, email: user.email, roleId: user.roleId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    );
};

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
router.post('/register', registerValidation, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, phone, password } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        // Check if phone exists
        if (phone) {
            const existingPhone = await User.findOne({ where: { phone } });
            if (existingPhone) {
                return res.status(400).json({ message: 'Phone number already registered' });
            }
        }

        // Create user with default role (user = 3)
        const user = await User.create({
            name,
            email,
            phone,
            password,
            roleId: 3 // Default to 'user' role
        });

        const token = generateToken(user);

        // Log activity
        await ActivityLog.create({
            action: 'register',
            module: 'auth',
            description: `New user registered: ${email}`,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
            userId: user.id
        });

        res.status(201).json({
            message: 'Registration successful',
            token,
            user: user.toJSON()
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', loginValidation, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        // Find user with role
        const user = await User.findOne({
            where: { email },
            include: [{ model: Role }]
        });

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Check if active
        if (!user.isActive) {
            return res.status(401).json({ message: 'Account is deactivated. Contact admin.' });
        }

        // Update last login
        await user.update({ lastLogin: new Date() });

        const token = generateToken(user);

        // Log activity
        await ActivityLog.create({
            action: 'login',
            module: 'auth',
            description: `User logged in: ${email}`,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
            userId: user.id
        });

        res.json({
            message: 'Login successful',
            token,
            user: user.toJSON()
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/auth/google
// @desc    Login/Register with Google
// @access  Public
router.post('/google', async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({ message: 'Google token is required' });
        }

        let payload;

        // Verify Google token properly
        if (process.env.GOOGLE_CLIENT_ID) {
            try {
                const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
                const ticket = await client.verifyIdToken({
                    idToken: token,
                    audience: process.env.GOOGLE_CLIENT_ID
                });
                payload = ticket.getPayload();
            } catch (verifyError) {
                console.error('Google token verification failed:', verifyError.message);
                return res.status(401).json({ message: 'Invalid Google token' });
            }
        } else {
            // Fallback for development when GOOGLE_CLIENT_ID is not set
            console.warn('WARNING: GOOGLE_CLIENT_ID not set. Using insecure token decode for development only!');
            try {
                const base64Payload = token.split('.')[1];
                payload = JSON.parse(Buffer.from(base64Payload, 'base64').toString());
            } catch (decodeError) {
                return res.status(400).json({ message: 'Invalid token format' });
            }
        }

        const { email, name, picture, sub: googleId } = payload;

        if (!email) {
            return res.status(400).json({ message: 'Invalid Google token - no email' });
        }

        // Check if user exists
        let user = await User.findOne({
            where: { email },
            include: [{ model: Role }]
        });

        if (!user) {
            // Create new user
            user = await User.create({
                name: name || email.split('@')[0],
                email,
                password: `google_${googleId}_${Date.now()}`, // Random password for Google users
                avatar: picture,
                roleId: 3, // Default to 'user' role
                isActive: true
            });

            // Reload with role
            user = await User.findByPk(user.id, {
                include: [{ model: Role }]
            });

            await ActivityLog.create({
                action: 'register_google',
                module: 'auth',
                description: `New user registered via Google: ${email}`,
                ipAddress: req.ip,
                userAgent: req.headers['user-agent'],
                userId: user.id
            });
        } else {
            // Check if active
            if (!user.isActive) {
                return res.status(401).json({ message: 'Account is deactivated. Contact admin.' });
            }

            // Update last login and avatar if changed
            await user.update({
                lastLogin: new Date(),
                avatar: picture || user.avatar
            });
        }

        const jwtToken = generateToken(user);

        // Log activity
        await ActivityLog.create({
            action: 'login_google',
            module: 'auth',
            description: `User logged in via Google: ${email}`,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
            userId: user.id
        });

        res.json({
            message: 'Login successful',
            token: jwtToken,
            user: user.toJSON()
        });
    } catch (error) {
        console.error('Google login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/auth/me

// @desc    Get current user
// @access  Private
router.get('/me', authenticate, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            include: [{ model: Role }]
        });
        res.json(user);
    } catch (error) {
        console.error('Get me error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/auth/profile
// @desc    Update profile
// @access  Private
router.put('/profile', authenticate, async (req, res) => {
    try {
        const { name, email, phone, bio, avatar, settings } = req.body;

        // Build update object
        const updateData = {};
        if (name) updateData.name = name;
        if (email) {
            // Check if email is already taken by another user
            const existingUser = await User.findOne({ where: { email } });
            if (existingUser && existingUser.id !== req.user.id) {
                return res.status(400).json({ message: 'Email already in use' });
            }
            updateData.email = email;
        }
        if (phone !== undefined) updateData.phone = phone;
        if (bio !== undefined) updateData.bio = bio;
        if (avatar) updateData.avatar = avatar;
        if (settings) updateData.settings = settings;

        await req.user.update(updateData);

        // Reload user with role
        const updatedUser = await User.findByPk(req.user.id, {
            include: [{ model: Role }]
        });

        res.json({
            message: 'Profile updated',
            user: updatedUser.toJSON()
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/auth/password
// @desc    Change password
// @access  Private
router.put('/password', authenticate, [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { currentPassword, newPassword } = req.body;

        // Verify current password
        const isMatch = await req.user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        // Update password
        req.user.password = newPassword;
        await req.user.save();

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/auth/change-password
// @desc    Change password (alias for PUT /password)
// @access  Private
router.post('/change-password', authenticate, [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { currentPassword, newPassword } = req.body;

        // Verify current password
        const isMatch = await req.user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        // Update password
        req.user.password = newPassword;
        await req.user.save();

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/auth/forgot-password
// @desc    Request password reset via phone
// @access  Public
router.post('/forgot-password', [
    body('phone').trim().notEmpty().withMessage('Phone number is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { phone } = req.body;

        // Find user by phone
        const user = await User.findOne({ where: { phone } });
        if (!user) {
            return res.status(404).json({ message: 'No account found with this phone number' });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Save OTP and expiry (15 minutes)
        await user.update({
            resetToken: otp,
            resetTokenExpiry: new Date(Date.now() + 15 * 60 * 1000)
        });

        // In production, send OTP via SMS (e.g., Twilio, Nexmo)
        // For now, we'll return it in response (ONLY FOR DEVELOPMENT)
        console.log(`OTP for ${phone}: ${otp}`);

        await ActivityLog.create({
            action: 'forgot_password',
            module: 'auth',
            description: `Password reset requested for phone: ${phone}`,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
            userId: user.id
        });

        res.json({
            message: 'OTP sent to your phone number',
            // Remove this in production - only for development
            otp: process.env.NODE_ENV === 'development' ? otp : undefined
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/auth/verify-otp
// @desc    Verify OTP for password reset
// @access  Public
router.post('/verify-otp', [
    body('phone').trim().notEmpty().withMessage('Phone number is required'),
    body('otp').trim().notEmpty().withMessage('OTP is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { phone, otp } = req.body;

        // Find user by phone
        const user = await User.findOne({ where: { phone } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check OTP
        if (user.resetToken !== otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        // Check expiry
        if (new Date() > new Date(user.resetTokenExpiry)) {
            return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
        }

        // Generate a temporary token for reset
        const resetToken = jwt.sign(
            { id: user.id, phone: user.phone, type: 'reset' },
            process.env.JWT_SECRET,
            { expiresIn: '10m' }
        );

        res.json({
            message: 'OTP verified successfully',
            resetToken
        });
    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/auth/reset-password
// @desc    Reset password with token
// @access  Public
router.post('/reset-password', [
    body('resetToken').notEmpty().withMessage('Reset token is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { resetToken, newPassword } = req.body;

        // Verify reset token
        let decoded;
        try {
            decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
        } catch (err) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }

        if (decoded.type !== 'reset') {
            return res.status(400).json({ message: 'Invalid reset token' });
        }

        // Find user
        const user = await User.findByPk(decoded.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update password and clear reset token
        user.password = newPassword;
        user.resetToken = null;
        user.resetTokenExpiry = null;
        await user.save();

        await ActivityLog.create({
            action: 'reset_password',
            module: 'auth',
            description: `Password reset completed for user: ${user.email}`,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
            userId: user.id
        });

        res.json({ message: 'Password reset successfully. You can now login with your new password.' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;

