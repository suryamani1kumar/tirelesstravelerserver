import jwt from "jsonwebtoken";

export const userLogin = async (req, res) => {
  const { password, userIdOrmail } = req.body;

  if (!userIdOrmail || !password) {
    return res
      .status(400)
      .json({ message: "Email/Username and Password are required" });
  }

  // Dummy user validation
  if (userIdOrmail !== "admin@tireless.net") {
    return res.status(404).json({ message: "User does not exist" });
  }

  if (password !== "tireless@Admin") {
    return res.status(400).json({ message: "Password not match" });
  }

  const payload = { user: userIdOrmail };

  const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "1d",
  });

  const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "5d",
  });

  res.cookie("a_token", accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
  });

  res.cookie("r_token", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
  });

  res.status(200).json({ message: "Login successful!" });
};
