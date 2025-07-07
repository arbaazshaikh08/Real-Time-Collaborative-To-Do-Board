import { Router } from "express";
import {
  createTask,
  deleteTask,
  getAllTasks,
  smartAssignTask,
  updateTask,
} from "../controllers/task.controller.js";
import { verifyJWT } from "../middlewere/auth.middlewere.js";

const router = Router();

router.route("/create-task").post(verifyJWT, createTask);

router.route("/getAll-task").get(verifyJWT, getAllTasks);

router.route("/update-task/:id").put(verifyJWT, updateTask);

router.route("/delete-task/:id").delete(verifyJWT, deleteTask);

router.route("/smart-assign/:id").put(verifyJWT, smartAssignTask);

export default router;
