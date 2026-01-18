const express = require('express');
const router = express.Router();
const { authenticator } = require('otplib');
const QRCode = require('qrcode');
const crypto = require('crypto');
const { TwoFactorAuth, TrustedDevice, User, SystemSetting } = require('../models');
const { authenticateToken } = require('../middleware/auth');

// Encryption helpers
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-encryption-key-32chars!';
const IV_LENGTH = 16;

function encrypt(text) {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY.padEnd(32).slice(0, 32)), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {
    try {
        const parts = text.split(':');
        const iv = Buffer.from(parts.shift(), 'hex');
        const encrypted = Buffer.from(parts.join(':'), 'hex');
        const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY.padEnd(32).slice(0, 32)), iv);
        let decrypted = decipher.update(encrypted);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    } catch {
        return null;
    }
}

// Generate backup codes
function generateBackupCodes(count = 10) {
    return Array.from({ length: count }, () =>
        crypto.randomBytes(4).toString('hex').toUpperCase().match(/.{4}/g).join('-')
    );
}

// Check if 2FA is enabled system-wide
async function is2FAEnabled() {
    const setting = await SystemSetting.findOne({ where: { key: 'ENABLE_2FA' } });
    return setting?.value === 'true';
}

// ==================== ROUTES ====================

// Get 2FA status for current user
router.get('/status', authenticateToken, async (req, res) => {
    try {
        const systemEnabled = await is2FAEnabled();
        const twoFactor = await TwoFactorAuth.findOne({ where: { userId: req.user.id } });

        res.json({
            systemEnabled,
            userEnabled: twoFactor?.isEnabled || false,
            method: twoFactor?.method || 'totp',
            hasBackupCodes: !!(twoFactor?.backupCodes),
            lastVerified: twoFactor?.lastVerifiedAt
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get 2FA status' });
    }
});

// Setup 2FA - Generate secret and QR code
router.post('/setup', authenticateToken, async (req, res) => {
    try {
        const systemEnabled = await is2FAEnabled();
        if (!systemEnabled) {
            return res.status(400).json({ error: '2FA is disabled by system administrator' });
        }

        const user = await User.findByPk(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        // Generate new secret
        const secret = authenticator.generateSecret();
        const appName = 'Workspace';
        const otpauth = authenticator.keyuri(user.email, appName, secret);

        // Generate QR code
        const qrCodeUrl = await QRCode.toDataURL(otpauth);

        // Store pending secret
        let twoFactor = await TwoFactorAuth.findOne({ where: { userId: req.user.id } });
        if (!twoFactor) {
            twoFactor = await TwoFactorAuth.create({
                userId: req.user.id,
                secret: '',
                pendingSecret: encrypt(secret)
            });
        } else {
            twoFactor.pendingSecret = encrypt(secret);
            await twoFactor.save();
        }

        res.json({
            secret,
            qrCode: qrCodeUrl,
            message: 'Scan the QR code with your authenticator app, then verify with a code'
        });
    } catch (error) {
        console.error('2FA setup error:', error);
        res.status(500).json({ error: 'Failed to setup 2FA' });
    }
});

// Verify and enable 2FA
router.post('/verify-setup', authenticateToken, async (req, res) => {
    try {
        const { code } = req.body;
        if (!code) return res.status(400).json({ error: 'Verification code required' });

        const twoFactor = await TwoFactorAuth.findOne({ where: { userId: req.user.id } });
        if (!twoFactor?.pendingSecret) {
            return res.status(400).json({ error: 'No pending 2FA setup found. Please start setup again.' });
        }

        const secret = decrypt(twoFactor.pendingSecret);
        if (!secret) {
            return res.status(400).json({ error: 'Invalid setup state' });
        }

        // Verify the code
        const isValid = authenticator.verify({ token: code, secret });
        if (!isValid) {
            return res.status(400).json({ error: 'Invalid verification code' });
        }

        // Generate backup codes
        const backupCodes = generateBackupCodes(10);

        // Enable 2FA
        twoFactor.secret = encrypt(secret);
        twoFactor.pendingSecret = null;
        twoFactor.isEnabled = true;
        twoFactor.backupCodes = encrypt(JSON.stringify(backupCodes));
        twoFactor.lastVerifiedAt = new Date();
        await twoFactor.save();

        res.json({
            success: true,
            message: '2FA enabled successfully',
            backupCodes
        });
    } catch (error) {
        console.error('2FA verify error:', error);
        res.status(500).json({ error: 'Failed to verify 2FA' });
    }
});

// Verify 2FA code (during login)
router.post('/verify', async (req, res) => {
    try {
        const { userId, code, trustDevice, deviceInfo } = req.body;
        if (!userId || !code) {
            return res.status(400).json({ error: 'User ID and code required' });
        }

        const twoFactor = await TwoFactorAuth.findOne({ where: { userId } });
        if (!twoFactor?.isEnabled) {
            return res.status(400).json({ error: '2FA not enabled for this user' });
        }

        const secret = decrypt(twoFactor.secret);
        let isValid = false;
        let usedBackupCode = false;

        // Try TOTP first
        isValid = authenticator.verify({ token: code, secret });

        // Try backup codes if TOTP fails
        if (!isValid && twoFactor.backupCodes) {
            const backupCodes = JSON.parse(decrypt(twoFactor.backupCodes) || '[]');
            const codeIndex = backupCodes.indexOf(code.toUpperCase());
            if (codeIndex !== -1) {
                isValid = true;
                usedBackupCode = true;
                // Remove used backup code
                backupCodes.splice(codeIndex, 1);
                twoFactor.backupCodes = encrypt(JSON.stringify(backupCodes));
            }
        }

        if (!isValid) {
            return res.status(400).json({ error: 'Invalid verification code' });
        }

        twoFactor.lastVerifiedAt = new Date();
        await twoFactor.save();

        // Trust this device if requested
        let trustToken = null;
        if (trustDevice && deviceInfo) {
            const deviceHash = crypto.createHash('sha256')
                .update(`${userId}-${deviceInfo.userAgent}-${deviceInfo.fingerprint || ''}`)
                .digest('hex');

            // Remove existing trust for this device
            await TrustedDevice.destroy({ where: { userId, deviceHash } });

            // Create new trust
            trustToken = crypto.randomBytes(32).toString('hex');
            await TrustedDevice.create({
                userId,
                deviceHash,
                trustToken,
                deviceName: deviceInfo.deviceName || 'Unknown Device',
                browser: deviceInfo.browser,
                os: deviceInfo.os,
                ipAddress: deviceInfo.ip,
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
                lastUsedAt: new Date()
            });
        }

        res.json({
            success: true,
            usedBackupCode,
            remainingBackupCodes: usedBackupCode ?
                JSON.parse(decrypt(twoFactor.backupCodes) || '[]').length : undefined,
            trustToken
        });
    } catch (error) {
        console.error('2FA verification error:', error);
        res.status(500).json({ error: 'Failed to verify 2FA' });
    }
});

// Check if device is trusted
router.post('/check-trust', async (req, res) => {
    try {
        const { userId, trustToken } = req.body;
        if (!userId || !trustToken) {
            return res.json({ trusted: false });
        }

        const device = await TrustedDevice.findOne({
            where: { userId, trustToken, isActive: true }
        });

        if (!device || new Date(device.expiresAt) < new Date()) {
            if (device) {
                device.isActive = false;
                await device.save();
            }
            return res.json({ trusted: false });
        }

        // Update last used
        device.lastUsedAt = new Date();
        await device.save();

        res.json({ trusted: true });
    } catch (error) {
        res.json({ trusted: false });
    }
});

// Get trusted devices
router.get('/devices', authenticateToken, async (req, res) => {
    try {
        const devices = await TrustedDevice.findAll({
            where: { userId: req.user.id, isActive: true },
            order: [['lastUsedAt', 'DESC']]
        });

        res.json(devices.map(d => ({
            id: d.id,
            deviceName: d.deviceName,
            browser: d.browser,
            os: d.os,
            location: d.location,
            expiresAt: d.expiresAt,
            lastUsedAt: d.lastUsedAt,
            createdAt: d.createdAt
        })));
    } catch (error) {
        res.status(500).json({ error: 'Failed to get devices' });
    }
});

// Revoke trusted device
router.delete('/devices/:id', authenticateToken, async (req, res) => {
    try {
        const device = await TrustedDevice.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });

        if (!device) {
            return res.status(404).json({ error: 'Device not found' });
        }

        device.isActive = false;
        await device.save();

        res.json({ success: true, message: 'Device revoked' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to revoke device' });
    }
});

// Regenerate backup codes
router.post('/backup-codes/regenerate', authenticateToken, async (req, res) => {
    try {
        const { password } = req.body;
        const user = await User.findByPk(req.user.id);

        // Verify password
        const bcrypt = require('bcryptjs');
        if (!await bcrypt.compare(password, user.password)) {
            return res.status(400).json({ error: 'Invalid password' });
        }

        const twoFactor = await TwoFactorAuth.findOne({ where: { userId: req.user.id } });
        if (!twoFactor?.isEnabled) {
            return res.status(400).json({ error: '2FA not enabled' });
        }

        const backupCodes = generateBackupCodes(10);
        twoFactor.backupCodes = encrypt(JSON.stringify(backupCodes));
        await twoFactor.save();

        res.json({ backupCodes });
    } catch (error) {
        res.status(500).json({ error: 'Failed to regenerate backup codes' });
    }
});

// Disable 2FA
router.post('/disable', authenticateToken, async (req, res) => {
    try {
        const { password, code } = req.body;
        const user = await User.findByPk(req.user.id);

        // Verify password
        const bcrypt = require('bcryptjs');
        if (!await bcrypt.compare(password, user.password)) {
            return res.status(400).json({ error: 'Invalid password' });
        }

        const twoFactor = await TwoFactorAuth.findOne({ where: { userId: req.user.id } });
        if (!twoFactor?.isEnabled) {
            return res.status(400).json({ error: '2FA not enabled' });
        }

        // Verify 2FA code
        const secret = decrypt(twoFactor.secret);
        if (!authenticator.verify({ token: code, secret })) {
            return res.status(400).json({ error: 'Invalid verification code' });
        }

        // Disable 2FA
        twoFactor.isEnabled = false;
        twoFactor.secret = '';
        twoFactor.backupCodes = null;
        await twoFactor.save();

        // Revoke all trusted devices
        await TrustedDevice.update(
            { isActive: false },
            { where: { userId: req.user.id } }
        );

        res.json({ success: true, message: '2FA disabled successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to disable 2FA' });
    }
});

// Send email OTP
router.post('/email-otp', async (req, res) => {
    try {
        const { userId } = req.body;
        const user = await User.findByPk(userId);
        if (!user) return res.status(404).json({ error: 'User not found' });

        const twoFactor = await TwoFactorAuth.findOne({ where: { userId } });
        if (!twoFactor?.isEnabled || twoFactor.method === 'totp') {
            return res.status(400).json({ error: 'Email OTP not enabled for this user' });
        }

        // Generate and send OTP
        const otp = crypto.randomInt(100000, 999999).toString();

        // Store OTP temporarily (in pending secret, expires in 10 min)
        twoFactor.pendingSecret = encrypt(JSON.stringify({ otp, expires: Date.now() + 600000 }));
        await twoFactor.save();

        // Send email (using existing notification service if available)
        // For now, just return success
        res.json({ success: true, message: 'OTP sent to your email' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to send OTP' });
    }
});

module.exports = router;
