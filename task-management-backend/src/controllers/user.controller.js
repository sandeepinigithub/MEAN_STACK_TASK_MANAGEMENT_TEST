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

const getTeamLeadsWithStats = async (req, res) => {
  try {
    const teamLeads = await userService.getTeamLeadsWithStats();
    return successResponse(res, 200, "Team leads retrieved successfully", { teamLeads });
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

const assignTeamLead = async (req, res) => {
  try {
    const employee = await userService.assignTeamLead(req.params.id, req.body.teamLeadId);
    return successResponse(res, 200, "Team lead assigned successfully", { user: employee });
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

module.exports = { getUsers, getTeamLeadsWithStats, getUserById, assignTeamLead };
