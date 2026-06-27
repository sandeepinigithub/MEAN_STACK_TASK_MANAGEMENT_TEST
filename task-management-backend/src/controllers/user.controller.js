const userService = require("../services/user.service");
const { successResponse, errorResponse } = require("../utils/apiResponse");

const getUsers = async (req, res) => {
  try {
    const { users, meta } = await userService.getUsers(req.user, req.query);
    return successResponse(res, 200, "Users retrieved successfully", { users }, meta);
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

const getMasterUserList = async (req, res) => {
  try {
    const users = await userService.getMasterUserList();
    return successResponse(res, 200, "Master user list retrieved successfully", { users });
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

const getTeamLeadsWithStats = async (req, res) => {
  try {
    const { teamLeads, meta } = await userService.getTeamLeadsWithStats(req.query);
    return successResponse(res, 200, "Team leads retrieved successfully", { teamLeads }, meta);
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await userService.getUserById(req.user, req.params.id);
    return successResponse(res, 200, "User retrieved successfully", { user });
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

const createUser = async (req, res) => {
  try {
    const user = await userService.createUser(req.user, req.body);
    return successResponse(res, 201, "User created successfully", { user });
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

const updateUser = async (req, res) => {
  try {
    const user = await userService.updateUser(req.params.id, req.body);
    return successResponse(res, 200, "User updated successfully", { user });
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

const deleteUser = async (req, res) => {
  try {
    await userService.deleteUser(req.user, req.params.id);
    return successResponse(res, 200, "User deleted successfully", null);
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

const assignTeamLead = async (req, res) => {
  try {
    const employee = await userService.assignTeamLead(req.params.id, req.body.teamLeadId);
    return successResponse(res, 200, "Team lead assigned successfully", { user: employee });
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

module.exports = {
  getUsers,
  getTeamLeadsWithStats,
  getMasterUserList,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  assignTeamLead,
};
