import bcrypt from "bcrypt";
import customer from "../schema/sign.js";
import { generateTokens, verifyCustomer } from "../utils/utils.js";

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
      process.env.ACCESS_TOKEN_TIME,
      process.env.REFRESH_TOKEN_TIME
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
  const user = await verifyCustomer(req, res);

  if (!user) {
    return res.status(401).json({
      loggedIn: false,
      message: "Unauthorized",
    });
  }

  return res.json({
    loggedIn: true,
    customer: user,
  });

};

export const GetCustomer = async (req, res) => {
  try {
    const id = req.customer._id

    const user = await customer.findOne(
      { _id: id },
    ).select("-refreshToken -accessToken");;

    if (!user) {
      return res.status(404).json({ error: "Customer not found" });
    }

    return res.status(200).json({
      message: "Customer fetch successfully",
      data: user
    });

  } catch (error) {
    console.error("Error creating order:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}