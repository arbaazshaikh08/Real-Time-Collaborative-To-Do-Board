import { asyncHandler } from "../utils/asyncHandlar.js";
import { Action } from "../model/action.model.js";
import { ApiResponce } from "../utils/ApiResponce.js";

const getLatestActions = asyncHandler(async (req, res) => {
  const actions = await Action.find()
    .sort({ createdAt: -1 })
    .limit(20)
    .populate("user", "name email")
    .populate("task", "title description");

  return res
    .status(200)
    .json(new ApiResponce(200, actions, "Latest actions fetched successfully"));
});

export { getLatestActions };
