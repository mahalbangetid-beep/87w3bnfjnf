import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { HiOutlinePhone, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff, HiOutlineArrowLeft } from 'react-icons/hi';
import { authAPI } from '../services/api';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const [step, setStep] = useState(1); // 1: phone, 2: OTP, 3: new password
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [resetToken, setResetToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Step 1: Request OTP
    const handleRequestOTP = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await authAPI.forgotPassword(phone);
            setSuccess(response.message);
            // In development, show OTP for testing
            if (response.otp) {
                setSuccess(`OTP sent! (Dev mode: ${response.otp})`);
            }
            setStep(2);
        } catch (err) {
            setError(err.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Verify OTP
    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await authAPI.verifyOTP(phone, otp);
            setResetToken(response.resetToken);
            setSuccess('OTP verified successfully!');
            setStep(3);
        } catch (err) {
            setError(err.message || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    // Step 3: Reset Password
    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            await authAPI.resetPassword(resetToken, newPassword);
            setSuccess('Password reset successfully! Redirecting to login...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #0f0f23 100%)',
        }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                    width: '100%',
                    maxWidth: '420px',
                }}
            >
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', duration: 0.8 }}
                        style={{
                            width: '72px',
                            height: '72px',
                            borderRadius: '20px',
                            background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 16px',
                            fontSize: '32px',
                        }}
                    >
                        🔐
                    </motion.div>
                    <h1 style={{ fontSize: '28px', fontWeight: '700', color: 'white', margin: 0 }}>
                        {t('forgotPassword.title', 'Reset Password')}
                    </h1>
                    <p style={{ color: '#9ca3af', marginTop: '8px', fontSize: '14px' }}>
                        {step === 1 && t('forgotPassword.step1Subtitle', 'Enter your phone number to receive OTP')}
                        {step === 2 && t('forgotPassword.step2Subtitle', 'Enter the OTP sent to your phone')}
                        {step === 3 && t('forgotPassword.step3Subtitle', 'Create your new password')}
                    </p>
                </div>

                {/* Card */}
                <div className="glass-card" style={{ padding: '32px' }}>
                    {/* Progress Indicator */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '24px' }}>
                        {[1, 2, 3].map((s) => (
                            <div
                                key={s}
                                style={{
                                    width: s === step ? '32px' : '10px',
                                    height: '10px',
                                    borderRadius: '5px',
                                    backgroundColor: s <= step ? '#8b5cf6' : 'rgba(255,255,255,0.1)',
                                    transition: 'all 0.3s',
                                }}
                            />
                        ))}
                    </div>

                    {/* Error Message */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{
                                padding: '12px 16px',
                                borderRadius: '10px',
                                backgroundColor: 'rgba(239,68,68,0.1)',
                                border: '1px solid rgba(239,68,68,0.3)',
                                marginBottom: '20px',
                            }}
                        >
                            <p style={{ color: '#f87171', fontSize: '13px', margin: 0 }}>{error}</p>
                        </motion.div>
                    )}

                    {/* Success Message */}
                    {success && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{
                                padding: '12px 16px',
                                borderRadius: '10px',
                                backgroundColor: 'rgba(16,185,129,0.1)',
                                border: '1px solid rgba(16,185,129,0.3)',
                                marginBottom: '20px',
                            }}
                        >
                            <p style={{ color: '#34d399', fontSize: '13px', margin: 0 }}>{success}</p>
                        </motion.div>
                    )}

                    {/* Step 1: Phone Number */}
                    {step === 1 && (
                        <form onSubmit={handleRequestOTP}>
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>
                                    Phone Number
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <HiOutlinePhone style={{
                                        position: 'absolute',
                                        left: '14px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        color: '#6b7280',
                                        width: '18px',
                                        height: '18px',
                                    }} />
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="08123456789"
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '14px 14px 14px 44px',
                                            borderRadius: '12px',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            backgroundColor: 'rgba(255,255,255,0.03)',
                                            color: 'white',
                                            fontSize: '14px',
                                            outline: 'none',
                                        }}
                                    />
                                </div>
                            </div>

                            <motion.button
                                type="submit"
                                disabled={loading}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="btn-glow"
                                style={{
                                    width: '100%',
                                    padding: '14px',
                                    fontSize: '15px',
                                    fontWeight: '600',
                                    opacity: loading ? 0.7 : 1,
                                }}
                            >
                                {loading ? 'Sending OTP...' : 'Send OTP'}
                            </motion.button>
                        </form>
                    )}

                    {/* Step 2: OTP Verification */}
                    {step === 2 && (
                        <form onSubmit={handleVerifyOTP}>
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>
                                    Enter OTP
                                </label>
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    placeholder="000000"
                                    required
                                    maxLength={6}
                                    style={{
                                        width: '100%',
                                        padding: '14px',
                                        borderRadius: '12px',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        backgroundColor: 'rgba(255,255,255,0.03)',
                                        color: 'white',
                                        fontSize: '24px',
                                        fontWeight: '600',
                                        textAlign: 'center',
                                        letterSpacing: '8px',
                                        outline: 'none',
                                    }}
                                />
                                <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px', textAlign: 'center' }}>
                                    OTP will expire in 15 minutes
                                </p>
                            </div>

                            <motion.button
                                type="submit"
                                disabled={loading || otp.length !== 6}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="btn-glow"
                                style={{
                                    width: '100%',
                                    padding: '14px',
                                    fontSize: '15px',
                                    fontWeight: '600',
                                    opacity: loading || otp.length !== 6 ? 0.7 : 1,
                                }}
                            >
                                {loading ? 'Verifying...' : 'Verify OTP'}
                            </motion.button>

                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                style={{
                                    width: '100%',
                                    marginTop: '12px',
                                    padding: '12px',
                                    borderRadius: '10px',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    backgroundColor: 'transparent',
                                    color: '#9ca3af',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                }}
                            >
                                Resend OTP
                            </button>
                        </form>
                    )}

                    {/* Step 3: New Password */}
                    {step === 3 && (
                        <form onSubmit={handleResetPassword}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>
                                    New Password
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <HiOutlineLockClosed style={{
                                        position: 'absolute',
                                        left: '14px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        color: '#6b7280',
                                        width: '18px',
                                        height: '18px',
                                    }} />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Min. 6 characters"
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '14px 44px 14px 44px',
                                            borderRadius: '12px',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            backgroundColor: 'rgba(255,255,255,0.03)',
                                            color: 'white',
                                            fontSize: '14px',
                                            outline: 'none',
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{
                                            position: 'absolute',
                                            right: '14px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            background: 'none',
                                            border: 'none',
                                            color: '#6b7280',
                                            cursor: 'pointer',
                                            padding: 0,
                                        }}
                                    >
                                        {showPassword ? <HiOutlineEyeOff style={{ width: '18px', height: '18px' }} /> : <HiOutlineEye style={{ width: '18px', height: '18px' }} />}
                                    </button>
                                </div>
                            </div>

                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>
                                    Confirm Password
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <HiOutlineLockClosed style={{
                                        position: 'absolute',
                                        left: '14px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        color: '#6b7280',
                                        width: '18px',
                                        height: '18px',
                                    }} />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Re-enter password"
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '14px 14px 14px 44px',
                                            borderRadius: '12px',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            backgroundColor: 'rgba(255,255,255,0.03)',
                                            color: 'white',
                                            fontSize: '14px',
                                            outline: 'none',
                                        }}
                                    />
                                </div>
                            </div>

                            <motion.button
                                type="submit"
                                disabled={loading}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="btn-glow"
                                style={{
                                    width: '100%',
                                    padding: '14px',
                                    fontSize: '15px',
                                    fontWeight: '600',
                                    opacity: loading ? 0.7 : 1,
                                }}
                            >
                                {loading ? 'Resetting...' : 'Reset Password'}
                            </motion.button>
                        </form>
                    )}

                    {/* Back to Login */}
                    <p style={{ textAlign: 'center', marginTop: '24px', color: '#9ca3af', fontSize: '14px' }}>
                        <Link to="/login" style={{ color: '#a78bfa', textDecoration: 'none', fontWeight: '500', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <HiOutlineArrowLeft style={{ width: '16px', height: '16px' }} />
                            Back to Login
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
