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
    
    if (!fullname || !email || !password) {
      return res.status(400).json({ error: "Fullname, email, and password are required" });
    }

    const assignedRole = role || 'student';
    if (assignedRole === 'student' && !regdNo) {
      return res.status(400).json({ error: "Registration number is required for students" });
    }
    if (assignedRole === 'driver' && (!routeNo || !timing)) {
      return res.status(400).json({ error: "Route number and timing are required for drivers" });
    }
    
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      if (existingUser.role !== assignedRole && existingUser.role !== 'admin') {
        return res.status(409).json({
          error: `This email is already registered as a ${existingUser.role}. Please log in with your existing ${existingUser.role} account, or use a different email address.`,
          existingRole: existingUser.role,
          crossRole: true
        });
      }
      // Same role — log them in directly
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
      return res.status(400).json({ 
        error: "No account found with this email. Please sign up first.",
        notFound: true
      });
    }

    if (user.isBlocked) {
      return res.status(403).json({ error: "Your account has been suspended. Please contact the administrator." });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Incorrect password. Please try again." });
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

    const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
    console.log(`\n=============================\nGENERATED OTP FOR ${email} : ${otpCode}\n=============================\n`);

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
    let lastError = "";

    // ── METHOD 1: Brevo SMTP (Railway-compatible, any recipient) ─────────────
    const brevoHost = process.env.BREVO_HOST || "smtp-relay.brevo.com";
    const brevoPort = parseInt(process.env.BREVO_PORT || "587");
    const brevoUser = process.env.BREVO_USER || "";
    const brevoPass = process.env.BREVO_PASS || "";
    const brevoFrom = process.env.BREVO_FROM || senderEmail;

    if (!emailSent && brevoUser && brevoPass) {
      try {
        const brevoTransport = nodemailer.createTransport({
          host: brevoHost,
          port: brevoPort,
          secure: false,
          auth: { user: brevoUser, pass: brevoPass },
          connectionTimeout: 10000,
          greetingTimeout: 10000,
          socketTimeout: 12000,
        });
        await brevoTransport.sendMail({
          from: `"Campus Commute" <${brevoFrom}>`,
          to: email,
          subject: "Your Campus Commute Verification Code",
          html: htmlBody,
          text: `Your verification code is: ${otpCode}. Expires in 5 minutes.`,
        });
        emailSent = true;
        console.log(`[OTP] ✅ Brevo SMTP success to ${email}`);
      } catch (eb) {
        lastError = eb.message;
        console.warn(`[OTP] ❌ Brevo SMTP failed:`, eb.message);
      }
    }

    // ── METHOD 2: Resend HTTP API (free plan: only to Resend account email) ──
    if (!emailSent && resendKey) {
      try {
        const { Resend } = require("resend");
        const resend = new Resend(resendKey);
        const { data: resendData, error: resendError } = await resend.emails.send({
          from: "Campus Commute <onboarding@resend.dev>",
          to: [email],
          subject: "Your Campus Commute Verification Code",
          html: htmlBody,
        });
        if (!resendError && resendData?.id) {
          emailSent = true;
          console.log(`[OTP] ✅ Resend success to ${email}, id=${resendData.id}`);
        } else {
          lastError = resendError?.message || JSON.stringify(resendError) || "Resend unknown error";
          console.warn(`[OTP] ❌ Resend failed for ${email}:`, lastError);
        }
      } catch (e) {
        lastError = e.message;
        console.warn(`[OTP] ❌ Resend exception:`, e.message);
      }
    }

    // ── METHOD 3: Gmail SMTP port 587 (STARTTLS) ──────────────────────────────
    if (!emailSent && senderEmail && rawPass) {
      try {
        const t587 = nodemailer.createTransport({
          host: "smtp.gmail.com", port: 587, secure: false, requireTLS: true,
          auth: { user: senderEmail, pass: rawPass },
          tls: { rejectUnauthorized: false },
          connectionTimeout: 10000, greetingTimeout: 10000, socketTimeout: 12000,
        });
        await t587.sendMail({
          from: `"Campus Commute" <${senderEmail}>`,
          to: email, subject: "Your Campus Commute Verification Code",
          html: htmlBody, text: `Your code: ${otpCode}. Expires in 5 minutes.`,
        });
        emailSent = true;
        console.log(`[OTP] ✅ Gmail SMTP-587 success to ${email}`);
      } catch (e1) {
        lastError = e1.message;
        console.warn(`[OTP] ❌ Gmail SMTP-587 failed:`, e1.message);
        try {
          const t465 = nodemailer.createTransport({
            host: "smtp.gmail.com", port: 465, secure: true,
            auth: { user: senderEmail, pass: rawPass },
            connectionTimeout: 10000, greetingTimeout: 10000, socketTimeout: 12000,
          });
          await t465.sendMail({
            from: `"Campus Commute" <${senderEmail}>`,
            to: email, subject: "Your Campus Commute Verification Code",
            html: htmlBody, text: `Your code: ${otpCode}. Expires in 5 minutes.`,
          });
          emailSent = true;
          console.log(`[OTP] ✅ Gmail SMTP-465 success to ${email}`);
        } catch (e2) {
          lastError = e2.message;
          console.warn(`[OTP] ❌ Gmail SMTP-465 also failed:`, e2.message);
        }
      }
    }

    if (emailSent) {
      // ✅ CRITICAL: Only update DB AFTER email is confirmed sent.
      // If we delete first then email fails → user is stuck with no valid OTP.
      await otpModel.deleteMany({ email });
      await otpModel.create({ email, otp: otpCode });
      return res.status(200).json({ success: true, message: "OTP sent to your email." });
    } else {
      // All methods failed — keep old OTP in DB so user can still verify with previous code
      console.error(`[OTP] ALL delivery methods failed for ${email}. Last: ${lastError}`);
      return res.status(503).json({
        error: "Failed to send OTP email. Please check your email address or try again in a moment.",
        debug: lastError
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

    const record = await otpModel.findOne({ email }).sort({ createdAt: -1 });

    if (!record) {
      return res.status(400).json({ error: "OTP expired or not found. Please request a new one." });
    }

    if (record.otp === otp) {
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

    const response = await fetch(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${accessToken}`, {
      headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' }
    });
    
    if (!response.ok) {
        return res.status(401).json({ error: "Invalid Google token" });
    }
    
    const googleUser = await response.json();
    const assignedRole = role || 'student';
    
    let user = await userModel.findOne({ email: googleUser.email });
    
    // ── SECURITY: Drivers must sign up via the driver form (with secret key) ──
    if (!user && assignedRole === 'driver') {
      return res.status(403).json({ 
        error: "Driver accounts must be registered via the Driver Sign Up form with the admin-issued secret key. Google login is only available for existing driver accounts.",
        requiresSignup: true
      });
    }
    
    if (!user) {
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

    const effectiveRole = user.role;
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
        role: effectiveRole,
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
    const user = req.user;

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
