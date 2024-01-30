import express from "express";
import User from "../Models/User";
import { body, validationResult } from "express-validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { errorToJSON } from "next/dist/server/render";

require("dotenv").config();

const secret_key = process.env.SECRET_KEY;

if (!secret_key) {
  console.error("Secret key is not defined.");
  process.exit(1); // Exit the process with an error code
}

const router: express.Router = express.Router();

// signup endpoint for user signup using POST method route /user/auth/signup
router.post(
  "/signup",
  [
    body("name", "Name will be required").isLength({ min: 1 }),
    body("email").isEmail(),
    body("password", "Password length will be 6 or greater").isLength({
      min: 6,
    }),
  ],
  async (req: express.Request, res: express.Response) => {
    // express validation result
    const error = validationResult(req);
    // if error is accured then
    if (!error.isEmpty()) {
      return res.status(400).json({ err: true, msg: error });
    }

    try {
      let user = await User.findOne({ email: req.body.email }).select(
        "-password -_id -name -__v"
      );

      if (user) {
        return res.status(409).json({ err: true, msg: "User already exists" });
      }

      //hash password with bcrypt
      const salt = await bcrypt.genSalt(10);
      const hashPassword = await bcrypt.hash(req.body.password, salt);

      user = await User.create({
        ...req.body,
        password: hashPassword,
      });

      // create token and send response to client side
      const data = {
        user: {
          id: user._id,
        },
      };

      const token = jwt.sign(data, secret_key);

      const { password, _id, ...userData } = user.toObject();

      return res.status(200).json({
        err: false,
        token: token,
        user: userData,
        msg: "Login Succesfully",
      });
    } catch (error) {
      return res.status(401).json({ err: true, msg: error });
    }
  }
);

// login endpoint for user login using POST method route /user/auth/login
router.post(
  "/login",
  [
    // express validation requirement field
    body("email", "Please fill the email field").isEmail(),
    body("password", "Password minimum 6 characters").isLength({ min: 6 }),
  ],
  async (req: express.Request, res: express.Response) => {
    // express validation result
    const error = validationResult(req);
    // if error is occurred then
    if (!error.isEmpty()) {
      return res.status(400).json({ err: true, message: error });
    }

    try {
      let user = await User.findOne({ email: req.body.email }).select(" -__v");
      // if user not exist in the database
      if (!user) {
        return res.status(400).json({
          err: true,
          msg: "Please use the correct UserId and Password",
        });
      }

      const comparePass = await bcrypt.compare(
        req.body.password,
        user.password
      );

      if (!comparePass) {
        return res
          .status(400)
          .json({ err: true, msg: "Please use correct UserId and Password" });
      }

      // jwt authentication
      const data = {
        user: {
          id: user._id,
        },
      };
      const token = jwt.sign(data, secret_key);

      const { password, _id, ...userData } = user.toObject();
      return res.status(201).json({
        err: false,
        msg: `Welcome Again ${userData.name}`,
        user: userData,
        token: token,
      });
    } catch (error) {
      return res.status(400).json({ err: true, msg: error });
    }
  }
);

export default router;
