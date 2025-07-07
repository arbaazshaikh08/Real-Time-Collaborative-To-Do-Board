import mongoose from "mongoose";

const actionLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    actionType: {
      type: String,
      enum: ["CREATE_TASK", "UPDATE_TASK", "DELETE_TASK", "SMART_ASSIGN"],
      required: true,
    },
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Action = mongoose.model("Action", actionLogSchema);
