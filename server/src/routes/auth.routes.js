import { Router } from "express";
import { signup, signin, updatePassword, getInfo } from "../controllers/user.controller.js";
import { signinValidator, signupValidator, updatePasswordValidator } from "../validators/user.validator.js";
import { verifyJWT } from "../middlewares/token.middleware.js";
const router = Router();

router.post("/signin", signinValidator, signin);
router.post("/signup", signupValidator, signup);
router.post("/update-password", verifyJWT, updatePasswordValidator, updatePassword)
router.post("/get-info", verifyJWT, getInfo)

export default router;