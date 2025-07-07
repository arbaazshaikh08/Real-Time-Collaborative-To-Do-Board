import { Router } from "express";
import {
  getCurrentUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewere/auth.middlewere.js";

const router = Router();
router.route("/register").post(registerUser);

router.route("/login-user").post(loginUser);

router.route("/refresh-token").get(refreshAccessToken);

// secure routes
router.route("/logout-user").post(verifyJWT, logoutUser);

router.route("/current-user").get(verifyJWT, getCurrentUser);

export default router;
