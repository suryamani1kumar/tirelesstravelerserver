import { generateTokens } from "../utils/utils.js";

const User = {
  _id: "123456",
  fullname: "Assignment Project",
  email: "tirelesstraveler@gmail.com",
  password: "tirelesstraveler",
};

export const userLogin = async (req, res) => {
  try {
    const { password, email } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email/Username and Password are required" });
    }

    // Dummy user validation
    if (email !== User.email) {
      return res.status(404).json({ message: "User does not exist" });
    }

    if (password !== User.password) {
      return res.status(400).json({ message: "Password does not match" });
    }

    const payload = { email: User.email, id: User._id, fullname: User.fullname };

    const { accessToken, refreshToken } = generateTokens(
      payload,
      process.env.ACCESS_TOKEN_TIME,
      process.env.REFRESH_TOKEN_TIME
    );

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: User._id,
        fullname: User.fullname,
        email: User.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const verifyToken = (req, res) => {
  try {
    const token = req.cookies.accessToken; // ✅ token from cookie
    if (!token) return res.status(401).json({ success: false, message: "No token" });

    const data = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    return res.status(200).json({ success: true, user: data });
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};