const { User } = require("../models");
const ApiError = require("../utils/apiError");

/**
 * Manager: get all users with optional role filter.
 * Team Lead: get their assigned employees.
 */
const getUsers = async (requestingUser, query = {}) => {
  const { role: filterRole, page = 1, limit = 20 } = query;

  let filter = {};

  if (requestingUser.role === "manager") {
    filter._id = { $ne: requestingUser._id };
    if (filterRole) filter.role = filterRole;
  } else if (requestingUser.role === "teamlead") {
    filter.teamLeadId = requestingUser._id;
    filter.role = "employee";
  } else {
    throw new ApiError(403, "Access denied");
  }

  const options = {
    page: Number(page),
    limit: Number(limit),
    sort: { createdAt: -1 },
    select: "-password",
    populate: [
      { path: "teamLeadId", select: "username email" },
      { path: "managerId", select: "username email" },
    ],
  };

  const result = await User.paginate(filter, options);

  return {
    users: result.docs,
    meta: {
      total: result.totalDocs,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    },
  };
};

/**
 * Manager: get paginated team leads with task statistics and employee counts.
 * Uses a single aggregate pipeline via mongoose-aggregate-paginate-v2.
 */
const getTeamLeadsWithStats = async (query = {}) => {
  const { page = 1, limit = 20 } = query;

  const pipeline = [
    { $match: { role: "teamlead" } },
    // Lookup tasks owned by this team lead
    {
      $lookup: {
        from: "tasks",
        localField: "_id",
        foreignField: "teamLeadId",
        as: "teamTasks",
      },
    },
    // Lookup employees under this team lead
    {
      $lookup: {
        from: "users",
        let: { tlId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$teamLeadId", "$$tlId"] },
                  { $eq: ["$role", "employee"] },
                ],
              },
            },
          },
          { $count: "count" },
        ],
        as: "employeeData",
      },
    },
    // Lookup manager details
    {
      $lookup: {
        from: "users",
        let: { mgrId: "$managerId" },
        pipeline: [
          { $match: { $expr: { $eq: ["$_id", "$$mgrId"] } } },
          { $project: { username: 1, email: 1 } },
        ],
        as: "managerInfo",
      },
    },
    // Build computed fields
    {
      $addFields: {
        taskStats: {
          total: { $size: "$teamTasks" },
          pending: {
            $size: {
              $filter: {
                input: "$teamTasks",
                as: "t",
                cond: { $eq: ["$$t.status", "pending"] },
              },
            },
          },
          inprogress: {
            $size: {
              $filter: {
                input: "$teamTasks",
                as: "t",
                cond: { $eq: ["$$t.status", "inprogress"] },
              },
            },
          },
          completed: {
            $size: {
              $filter: {
                input: "$teamTasks",
                as: "t",
                cond: { $eq: ["$$t.status", "completed"] },
              },
            },
          },
        },
        employeeCount: {
          $ifNull: [{ $arrayElemAt: ["$employeeData.count", 0] }, 0],
        },
        managerId: { $arrayElemAt: ["$managerInfo", 0] },
      },
    },
    // Remove intermediate lookup arrays and password
    {
      $project: {
        teamTasks: 0,
        employeeData: 0,
        managerInfo: 0,
        password: 0,
      },
    },
  ];

  const options = {
    page: Number(page),
    limit: Number(limit),
    sort: { createdAt: -1 },
  };

  const result = await User.aggregatePaginate(User.aggregate(pipeline), options);

  return {
    teamLeads: result.docs,
    meta: {
      total: result.totalDocs,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    },
  };
};

/**
 * Master user list — returns all users with only id and username.
 */
const getMasterUserList = async () => {
  const users = await User.find({}).select("_id username role").lean();
  return users.map((u) => ({ _id: u._id, username: u.username, role: u.role }));
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

  return User.findById(employee._id)
    .select("-password")
    .populate("teamLeadId", "username email role")
    .populate("managerId", "username email role");
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
  getMasterUserList,
  getUserById,
  assignTeamLead,
  createUser,
  updateUser,
  deleteUser,
};
