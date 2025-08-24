import bcrypt from "bcrypt";
import customer from "../schema/sign.js";
import { generateTokens } from "../utils/utils.js";
import jwt from "jsonwebtoken";
const time = "7d";
const refreshTime = "15d";

export const customerRegister = async (req, res) => {
  try {
    const { fullname, email, password } = req.body;

    // Check if user exists
    const existingUser = await customer.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Create user
    const user = await customer.create({ fullname, email, password });

    res.status(201).json({
      success: true,
      message: "customer registered successfully",
      user: {
        id: user._id,
        fullname: user.fullname,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Server Error" });
  }
};

export const customerLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await customer.findOne({ email }).select("+password");
    console.log("user", user);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const { accessToken, refreshToken } = generateTokens(
      user,
      time,
      refreshTime
    );

    user.accessToken = accessToken;
    user.refreshToken = refreshToken;
    await user.save();

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 15 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        fullname: user.fullname,
        email: user.email,
      },
    });
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ message: error.message || "Server Error" });
  }
};

export const customerAuth = async (req, res) => {

  const accessToken = req.cookies.accessToken;
  const refreshToken = req.cookies.refreshToken;

  try {
    // 1. Try verifying access token
    if (accessToken) {
      try {
        const getToken = jwt.verify(
          accessToken,
          process.env.ACCESS_TOKEN_SECRET
        );

        const user = await customer.findById(getToken.id);

        return res.json({ loggedIn: true, customer: user });

      } catch (err) {
        console.log("Access token expired or invalid:", err.message);
      }
    }

    // 2. Check refresh token
    if (!refreshToken) {
      return res.status(401).json({
        loggedIn: false,
        message: "No tokens provided, please log in",
      });
    }

    try {
      const decodedRefresh = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );

      // Find user in DB
      const user = await customer.findById(decodedRefresh.id);

      console.log("user", user);
      if (!user) {
        return res.status(401).json({
          loggedIn: false,
          message: "User not found, please log in again",
        });
      }

      // Generate new access token
      const { accessToken: newAccessToken } = generateTokens({
        id: user._id,
        email: user.email,
      });

      // Set new access token cookie
      res.cookie("accessToken", newAccessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 15 * 60 * 1000, // 15 mins
      });

      return res.json({
        loggedIn: true,
        customer: user,
      });
      
    } catch (err) {
      // Refresh token also expired or invalid
      console.log("Refresh token expired/invalid:", err.message);

      // Clear cookies
      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");

      return res.status(401).json({
        loggedIn: false,
        message: "Session expired, please log in again",
      });
    }
  } catch (err) {
    console.log("Auth error:", err.message);
    return res.status(401).json({ loggedIn: false, message: "Unauthorized" });
  }
};
