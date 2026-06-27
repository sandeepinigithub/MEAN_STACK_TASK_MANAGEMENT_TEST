const { User, Task } = require("../models");
const ApiError = require("../utils/apiError");

/**
 * Manager: get all users with optional role filter.
 * Team Lead: get their assigned employees.
 */
const getUsers = async (requestingUser, query = {}) => {
  const { role: filterRole, page = 1, limit = 20 } = query;
  const skip = (page - 1) * limit;

  let filter = {};

  if (requestingUser.role === "manager") {
    // Manager sees everyone except themselves
    filter._id = { $ne: requestingUser._id };
    if (filterRole) filter.role = filterRole;
  } else if (requestingUser.role === "teamlead") {
    // Team Lead sees only their employees
    filter.teamLeadId = requestingUser._id;
    filter.role = "employee";
  } else {
    throw new ApiError(403, "Access denied");
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .select("-password")
      .populate("teamLeadId", "username email")
      .populate("managerId", "username email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    User.countDocuments(filter),
  ]);

  return {
    users,
    meta: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Manager: get all team leads with their task statistics and employee counts.
 */
const getTeamLeadsWithStats = async () => {
  const teamLeads = await User.find({ role: "teamlead" })
    .select("-password")
    .populate("managerId", "username email")
    .lean();

  const teamLeadIds = teamLeads.map((tl) => tl._id);

  // Aggregate task counts per team lead
  const taskStats = await Task.aggregate([
    { $match: { teamLeadId: { $in: teamLeadIds } } },
    {
      $group: {
        _id: "$teamLeadId",
        total: { $sum: 1 },
        pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
        inprogress: { $sum: { $cond: [{ $eq: ["$status", "inprogress"] }, 1, 0] } },
        completed: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
      },
    },
  ]);

  // Employee counts per team lead
  const employeeCounts = await User.aggregate([
    { $match: { teamLeadId: { $in: teamLeadIds }, role: "employee" } },
    { $group: { _id: "$teamLeadId", count: { $sum: 1 } } },
  ]);

  const taskStatsMap = Object.fromEntries(taskStats.map((s) => [s._id.toString(), s]));
  const employeeCountMap = Object.fromEntries(employeeCounts.map((e) => [e._id.toString(), e.count]));

  return teamLeads.map((tl) => ({
    ...tl,
    taskStats: taskStatsMap[tl._id.toString()] || { total: 0, pending: 0, inprogress: 0, completed: 0 },
    employeeCount: employeeCountMap[tl._id.toString()] || 0,
  }));
};

/**
 * Manager: assign a team lead to an employee.
 */
const assignTeamLead = async (employeeId, teamLeadId) => {
  const [employee, teamLead] = await Promise.all([
    User.findById(employeeId),
    User.findById(teamLeadId),
  ]);

  if (!employee) throw new ApiError(404, "Employee not found");
  if (employee.role !== "employee") throw new ApiError(400, "Target user is not an employee");
  if (!teamLead) throw new ApiError(404, "Team lead not found");
  if (teamLead.role !== "teamlead") throw new ApiError(400, "Target user is not a team lead");

  employee.teamLeadId = teamLeadId;
  await employee.save();

  return employee;
};

/**
 * Get a single user by ID (with role-based visibility).
 */
const getUserById = async (requestingUser, targetUserId) => {
  const targetUser = await User.findById(targetUserId)
    .select("-password")
    .populate("teamLeadId", "username email role")
    .populate("managerId", "username email role");

  if (!targetUser) throw new ApiError(404, "User not found");

  if (requestingUser.role === "manager") return targetUser;

  if (requestingUser.role === "teamlead") {
    if (
      targetUser._id.equals(requestingUser._id) ||
      (targetUser.role === "employee" && targetUser.teamLeadId && targetUser.teamLeadId._id.equals(requestingUser._id))
    ) {
      return targetUser;
    }
    throw new ApiError(403, "Access denied");
  }

  throw new ApiError(403, "Access denied");
};

/**
 * Manager: create a new user with any role.
 * - teamlead role → stores managerId (set to creating manager if omitted)
 * - employee role → stores teamLeadId (optional)
 */
const createUser = async (requestingUser, payload) => {
  const { username, email, password, role, teamLeadId, managerId } = payload;

  const existing = await User.findOne({ email });
  if (existing) throw new ApiError(409, "A user with this email already exists");

  if (role === "employee" && teamLeadId) {
    const tl = await User.findById(teamLeadId);
    if (!tl || tl.role !== "teamlead") {
      throw new ApiError(400, "Provided teamLeadId does not belong to a team lead");
    }
  }

  if (role === "teamlead" && managerId) {
    const mgr = await User.findById(managerId);
    if (!mgr || mgr.role !== "manager") {
      throw new ApiError(400, "Provided managerId does not belong to a manager");
    }
  }

  const user = await User.create({
    username,
    email,
    password,
    role,
    teamLeadId: role === "employee" ? teamLeadId || null : null,
    managerId: role === "teamlead" ? managerId || requestingUser._id : null,
    isActive: true,
  });

  return User.findById(user._id)
    .select("-password")
    .populate("teamLeadId", "username email role")
    .populate("managerId", "username email role");
};

/**
 * Manager: update any user's details.
 * Password is only hashed if explicitly provided (handled by model pre-save).
 */
const updateUser = async (targetUserId, payload) => {
  const user = await User.findById(targetUserId);
  if (!user) throw new ApiError(404, "User not found");

  const { username, email, role, isActive, teamLeadId, managerId } = payload;

  if (email && email !== user.email) {
    const existing = await User.findOne({ email });
    if (existing) throw new ApiError(409, "A user with this email already exists");
    user.email = email;
  }

  if (username !== undefined) user.username = username;
  if (role !== undefined) user.role = role;
  if (isActive !== undefined) user.isActive = isActive;

  if (teamLeadId !== undefined) user.teamLeadId = teamLeadId || null;
  if (managerId !== undefined) user.managerId = managerId || null;

  await user.save();

  return User.findById(user._id)
    .select("-password")
    .populate("teamLeadId", "username email role")
    .populate("managerId", "username email role");
};

/**
 * Manager: delete a user. Prevents self-deletion.
 */
const deleteUser = async (requestingUser, targetUserId) => {
  if (requestingUser._id.equals(targetUserId)) {
    throw new ApiError(400, "You cannot delete your own account");
  }

  const user = await User.findById(targetUserId);
  if (!user) throw new ApiError(404, "User not found");

  await User.findByIdAndDelete(targetUserId);
};

module.exports = {
  getUsers,
  getTeamLeadsWithStats,
  getUserById,
  assignTeamLead,
  createUser,
  updateUser,
  deleteUser,
};
