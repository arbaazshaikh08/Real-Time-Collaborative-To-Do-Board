import { Router } from "express";
import { verifyJWT } from "../middlewere/auth.middlewere.js";
import { getLatestActions } from "../controllers/action.controller.js";

const router = Router();

router.route("/letest-action").get(verifyJWT, getLatestActions);
export default router;
