import { Request, Response, NextFunction } from "express";
import User, { IUser } from "../models/User";
import { generateAccessToken } from "../utils/jwt";

export const getUserInfo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user as IUser;

    const userInfo = await User.findById(user._id).lean();

    if (!userInfo) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const accessToken = generateAccessToken(user);

    res.json({ ...userInfo, accessToken });
  } catch (err) {
    next(err);
  }
};
