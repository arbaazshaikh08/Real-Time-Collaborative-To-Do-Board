import { Task } from "../model/task.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponce } from "../utils/ApiResponce.js";
import { asyncHandler } from "../utils/asyncHandlar.js";
import { Action } from "../model/action.model.js";
import { User } from "../model/user.model.js";

//  Create new task
const createTask = asyncHandler(async (req, res) => {
  const { title, description, status, priority, assignedTo } = req.body;

  if (
    [title, description, status, priority, assignedTo].some(
      (field) => field?.trim() === ""
    )
  ) {
    throw new Error("All fields are required");
  }

  const existingTask = await Task.findOne({ title });
  if (existingTask) {
    throw new ApiError(400, "Task with this title already exists");
  }

  const task = await Task.create({
    title,
    description,
    status,
    priority,
    assignedTo,
  });

  // Emit event to all clients
  const io = req.app.get("io");
  io.emit("task-created", task);

  await Action.create({
    user: req.user._id,
    actionType: "CREATE_TASK",
    task: task._id,
  });

  return res
    .status(200)
    .json(new ApiResponce(200, task, "Task created successfully"));
});

//  Get all tasks
const getAllTasks = asyncHandler(async (req, res) => {
  const tasks = await Task.find().populate("assignedTo", "name email");
  return res
    .status(200)
    .json(new ApiResponce(200, tasks, "Tasks fetched successfully"));
});

//  Update task
const updateTask = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!id) {
    throw new ApiError(400, "Task ID not received");
  }
  const updated = await Task.findByIdAndUpdate(id, req.body, { new: true });

  if (!updated) {
    throw new ApiError(404, "Task not found");
  }
  const io = req.app.get("io");
  io.emit("task-updated", updated);

  // action Log
  await Action.create({
    user: req.user._id,
    actionType: "UPDATE_TASK",
    task: updated._id,
  });
  return res
    .status(200)
    .json(new ApiResponce(200, updated, "Task updated successfully"));
});

//  Delete task
const deleteTask = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!id) {
    throw new ApiError(400, "Task ID not received");
  }

  const deletetask = await Task.findByIdAndDelete(id);

  if (!deletetask) {
    throw new ApiError(404, "Task not found");
  }

  const io = req.app.get("io");
  io.emit("task-deleted", { taskId: id });

  await Action.create({
    user: req.user._id,
    actionType: "DELETE_TASK",
    task: id,
  });

  return res
    .status(200)
    .json(new ApiResponce(200, null, "Task deleted successfully"));
});

// smart Assign task
const smartAssignTask = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!id) {
    throw new ApiError(400, "Task ID not received");
  }

  //  Find active tasks from DB
  const activeTasks = await Task.aggregate([
    {
      $match: {
        status: { $ne: "Done" },
        assignedTo: { $ne: null },
      },
    },
    {
      $group: {
        _id: "$assignedTo",
        count: { $sum: 1 },
      },
    },
  ]);

  // Convert into easy-to-read map

  const taskCountMap = {};
  activeTasks.forEach((entry) => {
    taskCountMap[entry._id.toString()] = entry.count;
  });

  // all users from db
  const users = await User.find();

  if (users.length === 0) {
    throw new ApiError(404, "No users found");
  }

  // Find user with minimum active tasks
  let minUser = users[0];

  users.forEach((user) => {
    const currentCount = taskCountMap[user._id.toString()] || 0;
    const minCount = taskCountMap[minUser._id.toString()] || 0;
    if (currentCount < minCount) {
      minUser = user;
    }
  });

  // Assign the task to that user
  const task = await Task.findByIdAndUpdate(
    id,
    {
      assignedTo: minUser._id,
      updatedAt: new Date(),
    },
    { new: true }
  );

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  // Emit event for real-time update

  const io = req.app.get("io");
  io.emit("task-updated", task);

  return res
    .status(200)
    .json(
      new ApiResponce(
        200,
        task,
        "Task assigned to user with fewest active tasks"
      )
    );
});

export { createTask, getAllTasks, updateTask, deleteTask, smartAssignTask };
