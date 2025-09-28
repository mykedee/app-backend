const express = require('express')
const {  signup, signin, logout, verifyEmail, resendVerifyToken, forgotPassword, resetPassword } = require("../controllers/auth");
const { protect } = require('../middleware/auth');

const router = express.Router()

// router.get('/users', getUsers)
// router.get('/users/:id', getUser)
router.post('/auth/signup', signup)
router.post('/auth/signin', signin )
router.get('/auth/logout', logout )
router.patch("/verify/:genToken", protect, verifyEmail);
router.patch("/resend-verify-token", protect, resendVerifyToken);
router.post("/forget-password", forgotPassword);
router.patch("/reset-password/:genForgotPasswordToken",  resetPassword);


module.exports = router

