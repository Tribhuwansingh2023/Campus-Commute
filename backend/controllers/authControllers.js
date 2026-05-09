const userModel = require("../models/UserModel");
const generateToken = require("../utils/generateToken");
const bcrypt = require("bcrypt");
const otpModel = require("../models/otpModel");
const nodemailer = require("nodemailer");

module.exports.register = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({ error: "Request body is missing" });
    }
    
    let { fullname, regdNo, email, password, role, routeNo, timing, phone, profileImage } = req.body;
    
    // Check required base fields
    if (!fullname || !email || !password) {
      return res.status(400).json({ error: "Fullname, email, and password are required" });
    }

    // Role specific validation
    const assignedRole = role || 'student';
    if (assignedRole === 'student' && !regdNo) {
      return res.status(400).json({ error: "Registration number is required for students" });
    }
    if (assignedRole === 'driver' && (!routeNo || !timing)) {
      return res.status(400).json({ error: "Route number and timing are required for drivers" });
    }
    
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      // User already exists — return their data so frontend can log them in
      let token = generateToken(existingUser);
      res.cookie("token", token, { httpOnly: true, secure: true, sameSite: "none" });
      return res.status(200).json({
        success: true,
        alreadyExists: true,
        message: "Account already registered",
        user: {
          id: existingUser._id,
          _id: existingUser._id,
          fullname: existingUser.fullname,
          email: existingUser.email,
          role: existingUser.role,
          routeNo: existingUser.routeNo,
        },
        token: token
      });
    }

    // Ensure regdNo is unique (one per student)
    if (assignedRole === 'student' && regdNo) {
      const existingRegd = await userModel.findOne({ regdNo });
      if (existingRegd) {
        return res.status(400).json({ error: "This registration number is already in use" });
      }
    }
    
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    let newUser = await userModel.create({
      fullname,
      email,
      password: hashedPassword,
      regdNo,
      role: assignedRole,
      routeNo,
      timing,
      phone,
      profileImage
    });

    let token = generateToken(newUser);
    res.cookie("token", token, { httpOnly: true, secure: true, sameSite: "none" });
    
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: newUser._id,
        _id: newUser._id,
        fullname: newUser.fullname,
        email: newUser.email,
        role: newUser.role,
        routeNo: newUser.routeNo
      },
      token: token
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "An error occurred while registering the user" });
  }
};

module.exports.login = async (req, res) => {
  try {
    let { email, password } = req.body;

    let user = await userModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Check if user is blocked by admin
    if (user.isBlocked) {
      return res.status(403).json({ error: "Your account has been suspended. Please contact the administrator." });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    let token = generateToken(user);
    res.cookie("token", token, { httpOnly: true, secure: true, sameSite: "none" });
    res.status(200).json({ 
      message: "Login successful", 
      user: {
        _id: user._id,
        fullname: user.fullname,
        email: user.email,
        role: user.role,
        routeNo: user.routeNo,
        profileImage: user.profileImage
      },
      token: token
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "An error occurred during login" });
  }
};

module.exports.logout = (req, res) => {
  try {
    res.clearCookie("token", { httpOnly: true, secure: true, sameSite: "none" });
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    return res.status(500).json({ error: "Logout failed" });
  }
};

module.exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    // Generate a real random 4-digit OTP
    const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
    console.log(`\n=============================\nGENERATED OTP FOR ${email} : ${otpCode}\n=============================\n`);

    // Save OTP to DB (delete old ones first)
    await otpModel.deleteMany({ email });
    await otpModel.create({ email, otp: otpCode });

    const senderEmail = process.env.EMAIL || "";
    const rawPass = (process.env.EMAIL_PASS || "").replace(/\s/g, "");
    const resendKey = process.env.RESEND_API_KEY || "";

    const htmlBody = `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:12px">
        <h2 style="color:#0f766e;margin-bottom:8px">Campus Commute</h2>
        <p style="color:#374151">Your email verification code is:</p>
        <div style="background:#f0fdfa;border:2px solid #0f766e;border-radius:8px;padding:20px;text-align:center;margin:16px 0">
          <span style="font-size:40px;font-weight:bold;letter-spacing:16px;color:#0f766e;font-family:monospace">${otpCode}</span>
        </div>
        <p style="color:#6b7280;font-size:13px">Expires in <strong>5 minutes</strong>. Do not share this code.</p>
      </div>
    `;

    let emailSent = false;

    // ── METHOD 1: Resend HTTP API (Railway-safe, no SMTP ports needed) ────────
    if (!emailSent && resendKey) {
      try {
        const { Resend } = require("resend");
        const resend = new Resend(resendKey);
        const { error: resendError } = await resend.emails.send({
          from: "Campus Commute <onboarding@resend.dev>",
          to: email,
          subject: "Your Campus Commute Verification Code",
          html: htmlBody,
        });
        if (!resendError) {
          emailSent = true;
          console.log(`[OTP] Email sent via Resend to ${email}`);
        } else {
          console.warn(`[OTP] Resend failed:`, resendError.message || resendError);
        }
      } catch (e) {
        console.warn(`[OTP] Resend error:`, e.message);
      }
    }

    // ── METHOD 2: Gmail SMTP port 587 (STARTTLS) ──────────────────────────────
    if (!emailSent && senderEmail && rawPass) {
      try {
        const transporter = nodemailer.createTransport({
          host: "smtp.gmail.com", port: 587, secure: false, requireTLS: true,
          auth: { user: senderEmail, pass: rawPass },
          tls: { rejectUnauthorized: false },
          connectionTimeout: 10000, greetingTimeout: 10000, socketTimeout: 12000,
        });
        await transporter.sendMail({
          from: `"Campus Commute" <${senderEmail}>`,
          to: email,
          subject: "Your Campus Commute Verification Code",
          html: htmlBody,
          text: `Your verification code is: ${otpCode}. Expires in 5 minutes.`,
        });
        emailSent = true;
        console.log(`[OTP] Email sent via Gmail SMTP-587 to ${email}`);
      } catch (e1) {
        console.warn(`[OTP] Gmail SMTP-587 failed:`, e1.message);
        // Try port 465 (SSL) as last resort
        try {
          const t465 = nodemailer.createTransport({
            host: "smtp.gmail.com", port: 465, secure: true,
            auth: { user: senderEmail, pass: rawPass },
            connectionTimeout: 10000, greetingTimeout: 10000, socketTimeout: 12000,
          });
          await t465.sendMail({
            from: `"Campus Commute" <${senderEmail}>`,
            to: email,
            subject: "Your Campus Commute Verification Code",
            html: htmlBody,
            text: `Your verification code is: ${otpCode}. Expires in 5 minutes.`,
          });
          emailSent = true;
          console.log(`[OTP] Email sent via Gmail SMTP-465 to ${email}`);
        } catch (e2) {
          console.warn(`[OTP] Gmail SMTP-465 also failed:`, e2.message);
        }
      }
    }

    if (emailSent) {
      return res.status(200).json({ success: true, message: "OTP sent to your email." });
    } else {
      // All methods failed — delete OTP so stale code is not in DB
      await otpModel.deleteMany({ email });
      console.error(`[OTP] ALL delivery methods failed for ${email}`);
      return res.status(503).json({
        error: "Failed to send OTP. Email delivery is currently unavailable. Please try again later.",
      });
    }

  } catch (error) {
    console.error("sendOTP critical error:", error);
    res.status(500).json({ error: "Failed to generate OTP. Please try again." });
  }
};

module.exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ error: "Email and OTP are required" });

    // Find the latest OTP
    const record = await otpModel.findOne({ email }).sort({ createdAt: -1 });

    if (!record) {
      return res.status(400).json({ error: "OTP expired or not found. Please request a new one." });
    }

    if (record.otp === otp) {
      // Correct OTP — clear it
      await otpModel.deleteMany({ email });
      return res.status(200).json({ success: true, message: "OTP verified correctly" });
    } else {
      return res.status(400).json({ error: "Incorrect OTP. Please check your email and try again." });
    }
  } catch (error) {
    console.error("verifyOTP error:", error);
    res.status(500).json({ error: "Failed to verify OTP" });
  }
};

module.exports.googleLogin = async (req, res) => {
  try {
    const { accessToken, role } = req.body;
    if (!accessToken) return res.status(400).json({ error: "Access token is required" });

    // Fetch user details from Google
    const response = await fetch(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${accessToken}`, {
      headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' }
    });
    
    if (!response.ok) {
        return res.status(401).json({ error: "Invalid Google token" });
    }
    
    const googleUser = await response.json();
    const assignedRole = role || 'student';
    
    let user = await userModel.findOne({ email: googleUser.email });
    
    if (!user) {
      // Auto-register via Google
      const hashedDummyPassword = await bcrypt.hash("OAuthGeneratedPassword!123", 10);
      user = await userModel.create({
        fullname: googleUser.name,
        email: googleUser.email,
        password: hashedDummyPassword,
        profileImage: googleUser.picture,
        role: assignedRole,
        routeNo: assignedRole === 'driver' ? 'UNASSIGNED' : undefined
      });
    }

    let token = generateToken(user);
    res.cookie("token", token, { httpOnly: true, secure: true, sameSite: "none" });
    
    res.status(200).json({
      success: true,
      message: "Google OAuth successful",
      user: {
        id: user._id,
        _id: user._id,
        fullname: user.fullname,
        email: user.email,
        role: user.role,
        routeNo: user.routeNo,
        profileImage: user.profileImage
      },
      token: token
    });
  } catch (error) {
    console.error("Google Auth Error:", error);
    res.status(500).json({ error: "Failed to authenticate with Google" });
  }
};

module.exports.deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;
    const user = req.user; // from isLoggedIn middleware

    if (!password) {
      return res.status(400).json({ error: "Password is required to delete account" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Incorrect password" });
    }

    await userModel.findByIdAndDelete(user._id);
    res.clearCookie("token", { httpOnly: true, secure: true, sameSite: "none" });
    res.status(200).json({ success: true, message: "Account deleted successfully" });
  } catch (error) {
    console.error("Delete Account Error:", error);
    res.status(500).json({ error: "Failed to delete account" });
  }
};

module.exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      return res.status(400).json({ error: "Email and new password are required" });
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ error: "Failed to reset password" });
  }
};
