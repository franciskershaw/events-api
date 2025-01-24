import { Request, Response, NextFunction } from "express";
import User, { IUser } from "./user.model";
import { generateAccessToken } from "../../core/utils/jwt";
import { NotFoundError } from "../../core/utils/errors";
import { generateConnectionId } from "./user.helper";
import dayjs from "dayjs";

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

export const createTempUserConnectionId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById(req.user as IUser);

    if (!user) {
      throw new NotFoundError("User not found");
    }

    const connectionId = await generateConnectionId();

    user.connectionId = {
      id: connectionId,
      expiry: dayjs().add(1, "hour").toDate(),
    };

    await user.save();

    res.json({ connectionId });
  } catch (err) {
    next(err);
  }
};
