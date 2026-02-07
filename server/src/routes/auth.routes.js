import { Router } from "express";
import {
    signup,
    signin,
    updatePassword,
    getInfo,
    refreshToken,
    generate2FA,
    verify2FA,
    validate2FA,
    disable2FA,
    migrateEncryption
} from "../controllers/user.controller.js";
import { signinValidator, signupValidator, updatePasswordValidator } from "../validators/user.validator.js";
import { verifyJWT } from "../middlewares/token.middleware.js";

const router = Router();

router.post("/signin", signinValidator, signin);
router.post("/signup", signupValidator, signup);
router.post("/update-password", verifyJWT, updatePasswordValidator, updatePassword);
router.post("/get-info", verifyJWT, getInfo);
router.post("/refresh-token", refreshToken);
router.post("/migrate-encryption", verifyJWT, migrateEncryption);

// 2FA Routes
router.post("/2fa/generate", verifyJWT, generate2FA);
router.post("/2fa/verify", verifyJWT, verify2FA);
router.post("/2fa/validate", validate2FA);
router.post("/2fa/disable", verifyJWT, disable2FA);

export default router;