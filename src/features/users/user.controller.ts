import { Request, Response, NextFunction } from "express";
import User, { IUser } from "./user.model";
import { generateAccessToken } from "../../core/utils/jwt";
import { NotFoundError } from "../../core/utils/errors";

export const getUserInfo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user as IUser;

    const userInfo = await User.findById(user._id).lean();

    if (!userInfo) {
      throw new NotFoundError("User not found");
    }

    const accessToken = generateAccessToken(user);

    res.json({ ...userInfo, accessToken });
  } catch (err) {
    next(err);
  }
};
