"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const User_1 = __importDefault(require("../Models/User"));
const express_validator_1 = require("express-validator");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
require("dotenv").config();
const secret_key = process.env.SECRET_KEY;
if (!secret_key) {
    console.error("Secret key is not defined.");
    process.exit(1); // Exit the process with an error code
}
const router = express_1.default.Router();
// signup endpoint for user signup using POST method route /user/auth/signup
router.post("/signup", [
    (0, express_validator_1.body)("name", "Name will be required").isLength({ min: 1 }),
    (0, express_validator_1.body)("email").isEmail(),
    (0, express_validator_1.body)("password", "Password length will be 6 or greater").isLength({
        min: 6,
    }),
], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // express validation result
    const error = (0, express_validator_1.validationResult)(req);
    // if error is accured then
    if (!error.isEmpty()) {
        return res.status(400).json({ err: true, msg: error });
    }
    try {
        let user = yield User_1.default.findOne({ email: req.body.email }).select("-password -_id -name -__v");
        if (user) {
            return res.status(409).json({ err: true, msg: "User already exists" });
        }
        //hash password with bcrypt
        const salt = yield bcrypt_1.default.genSalt(10);
        const hashPassword = yield bcrypt_1.default.hash(req.body.password, salt);
        user = yield User_1.default.create(Object.assign(Object.assign({}, req.body), { password: hashPassword }));
        // create token and send response to client side
        const data = {
            user: {
                id: user._id,
            },
        };
        const token = jsonwebtoken_1.default.sign(data, secret_key);
        const _a = user.toObject(), { password, _id } = _a, userData = __rest(_a, ["password", "_id"]);
        return res.status(200).json({
            err: false,
            token: token,
            user: userData,
            msg: "Login Succesfully",
        });
    }
    catch (error) {
        return res.status(401).json({ err: true, msg: error });
    }
}));
// login endpoint for user login using POST method route /user/auth/login
router.post("/login", [
    // express validation requirement field
    (0, express_validator_1.body)("email", "Please fill the email field").isEmail(),
    (0, express_validator_1.body)("password", "Password minimum 6 characters").isLength({ min: 6 }),
], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // express validation result
    const error = (0, express_validator_1.validationResult)(req);
    // if error is occurred then
    if (!error.isEmpty()) {
        return res.status(400).json({ err: true, message: error });
    }
    try {
        let user = yield User_1.default.findOne({ email: req.body.email }).select(" -__v");
        // if user not exist in the database
        if (!user) {
            return res.status(400).json({
                err: true,
                msg: "Please use the correct UserId and Password",
            });
        }
        const comparePass = yield bcrypt_1.default.compare(req.body.password, user.password);
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
        const token = jsonwebtoken_1.default.sign(data, secret_key);
        const _b = user.toObject(), { password, _id } = _b, userData = __rest(_b, ["password", "_id"]);
        return res.status(201).json({
            err: false,
            msg: `Welcome Again ${userData.name}`,
            user: userData,
            token: token,
        });
    }
    catch (error) {
        return res.status(400).json({ err: true, msg: error });
    }
}));
exports.default = router;
