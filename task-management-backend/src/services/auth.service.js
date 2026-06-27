const { User } = require("../models");
const { generateToken } = require("../utils/jwt.utils");
const ApiError = require("../utils/apiError");

const register = async (payload) => {
  const { username, email, password, role, teamLeadId, managerId } = payload;
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, "A user with this email already exists");
  }

  // Validate hierarchy references
  if (role === "employee" && teamLeadId) {
    const teamLead = await User.findById(teamLeadId);
    if (!teamLead || teamLead.role !== "teamlead") {
      throw new ApiError(400, "Provided teamLeadId does not belong to a team lead");
    }
  }

  if (role === "teamlead" && managerId) {
    const manager = await User.findById(managerId);
    if (!manager || manager.role !== "manager") {
      throw new ApiError(400, "Provided managerId does not belong to a manager");
    }
  }

  const user = await User.create({
    username,
    email,
    password,
    role: role,
    teamLeadId: role === "employee" ? teamLeadId || null : null,
    managerId: role === "teamlead" ? managerId || null : null,
  });

  const token = generateToken({ id: user._id, role: user.role });

  const userObj = user.toJSON();
  return { user: userObj, token };
};

const login = async (payload) => {
  const { email, password } = payload;
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }
  if (!user.isActive) {
    throw new ApiError(403, "Your account has been deactivated");
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(401, "Invalid email or password");
  }

  const token = generateToken({ id: user._id, role: user.role });

  const userObj = user.toJSON();
  return { user: userObj, token };
};

const getProfile = async (userId) => {
  const user = await User.findById(userId)
    .populate("teamLeadId", "username email role")
    .populate("managerId", "username email role");

  if (!user) {
    throw new ApiError(404, "User not found");
  }
  return user;
};

module.exports = { register, login, getProfile };
