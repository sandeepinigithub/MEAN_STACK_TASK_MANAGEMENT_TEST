const { Task, User } = require("../models");
const ApiError = require("../utils/apiError");

/**
 * Build a task filter based on the requesting user's role.
 */
const buildTaskFilter = async (requestingUser, queryFilters = {}) => {
  const filter = {};
  const { status, assignedTo } = queryFilters;

  if (requestingUser.role === "manager") {
    // Manager sees all tasks
    if (assignedTo) filter.assignedTo = assignedTo;
  } else if (requestingUser.role === "teamlead") {
    // Team lead sees tasks within their team (including their own)
    const teamMembers = await User.find({ teamLeadId: requestingUser._id }).select("_id");
    const teamMemberIds = teamMembers.map((m) => m._id);
    teamMemberIds.push(requestingUser._id);
    filter.assignedTo = assignedTo ? assignedTo : { $in: teamMemberIds };
  } else {
    // Employee sees only tasks assigned to themselves
    filter.assignedTo = requestingUser._id;
  }

  if (status) filter.status = status;

  return filter;
};

/**
 * Get paginated task list.
 */
const getTasks = async (requestingUser, query = {}) => {
  const { page = 1, limit = 10, status, assignedTo } = query;

  const filter = await buildTaskFilter(requestingUser, { status, assignedTo });

  const options = {
    page: Number(page),
    limit: Number(limit),
    sort: { createdAt: -1 },
    populate: [
      { path: "assignedTo", select: "username email role" },
      { path: "createdBy", select: "username email role" },
      { path: "teamLeadId", select: "username email" },
    ],
  };

  const result = await Task.paginate(filter, options);

  return {
    tasks: result.docs,
    meta: {
      total: result.totalDocs,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    },
  };
};

/**
 * Get a single task by ID.
 */
const getTaskById = async (requestingUser, taskId) => {
  const task = await Task.findById(taskId)
    .populate("assignedTo", "username email role")
    .populate("createdBy", "username email role")
    .populate("teamLeadId", "username email");

  if (!task) throw new ApiError(404, "Task not found");

  await assertTaskAccess(requestingUser, task, "read");

  return task;
};

/**
 * Create a new task.
 * - Employee: auto-assigned to self; teamLeadId derived from their profile.
 * - Team Lead: can assign to self or their team members.
 * - Manager: can assign to anyone.
 */
const createTask = async (requestingUser, taskData) => {
  const { title, description, status, assignedTo } = taskData;

  let finalAssignedTo = requestingUser._id;
  let teamLeadId = null;

  if (requestingUser.role === "employee") {
    finalAssignedTo = requestingUser._id;
    teamLeadId = requestingUser.teamLeadId || null;
  } else if (requestingUser.role === "teamlead") {
    if (assignedTo) {
      await assertTeamLeadCanAssign(requestingUser, assignedTo);
      const assignee = await User.findById(assignedTo);
      finalAssignedTo = assignedTo;
      teamLeadId = requestingUser._id;
      if (assignee && assignee.role === "teamlead" && assignee._id.equals(requestingUser._id)) {
        teamLeadId = requestingUser._id;
      }
    } else {
      finalAssignedTo = requestingUser._id;
      teamLeadId = requestingUser._id;
    }
  } else if (requestingUser.role === "manager") {
    if (assignedTo) {
      const assignee = await User.findById(assignedTo);
      if (!assignee) throw new ApiError(404, "Assigned user not found");
      finalAssignedTo = assignedTo;
      teamLeadId = assignee.teamLeadId || null;
      if (assignee.role === "teamlead") teamLeadId = assignee._id;
    } else {
      finalAssignedTo = requestingUser._id;
    }
  }

  const task = await Task.create({
    title,
    description,
    status,
    assignedTo: finalAssignedTo,
    createdBy: requestingUser._id,
    teamLeadId,
  });

  return Task.findById(task._id)
    .populate("assignedTo", "username email role")
    .populate("createdBy", "username email role")
    .populate("teamLeadId", "username email");
};

/**
 * Update a task's title, description, status, and/or assignedTo.
 * assignedTo follows the same role-based rules as reassignTask.
 */
const updateTask = async (requestingUser, taskId, updates) => {
  const task = await Task.findById(taskId);
  if (!task) throw new ApiError(404, "Task not found");

  await assertTaskAccess(requestingUser, task, "write");

  const { title, description, status, assignedTo } = updates;

  if (title !== undefined) task.title = title;
  if (description !== undefined) task.description = description;
  if (status !== undefined) task.status = status;

  // Handle reassignment — employees cannot reassign so assignedTo is ignored for them
  if (assignedTo !== undefined && assignedTo !== null && requestingUser.role !== "employee") {
    const newAssignee = await User.findById(assignedTo);
    if (!newAssignee) throw new ApiError(404, "Assigned user not found");

    if (requestingUser.role === "manager") {
      task.assignedTo = assignedTo;
      task.teamLeadId = newAssignee.role === "teamlead"
        ? newAssignee._id
        : newAssignee.teamLeadId || null;
    } else if (requestingUser.role === "teamlead") {
      await assertTeamLeadCanAssign(requestingUser, assignedTo);
      task.assignedTo = assignedTo;
      task.teamLeadId = requestingUser._id;
    }
  }

  await task.save();

  return Task.findById(task._id)
    .populate("assignedTo", "username email role")
    .populate("createdBy", "username email role")
    .populate("teamLeadId", "username email");
};

/**
 * Reassign a task to a different user.
 */
const reassignTask = async (requestingUser, taskId, newAssigneeId) => {
  const task = await Task.findById(taskId);
  if (!task) throw new ApiError(404, "Task not found");

  const newAssignee = await User.findById(newAssigneeId);
  if (!newAssignee) throw new ApiError(404, "Target user not found");

  if (requestingUser.role === "manager") {
    // Manager can reassign to anyone
    task.assignedTo = newAssigneeId;
    task.teamLeadId = newAssignee.teamLeadId || null;
    if (newAssignee.role === "teamlead") task.teamLeadId = newAssignee._id;
  } else if (requestingUser.role === "teamlead") {
    await assertTeamLeadCanAssign(requestingUser, newAssigneeId);
    task.assignedTo = newAssigneeId;
    task.teamLeadId = requestingUser._id;
  } else {
    throw new ApiError(403, "Employees cannot reassign tasks");
  }

  await task.save();

  return Task.findById(task._id)
    .populate("assignedTo", "username email role")
    .populate("createdBy", "username email role")
    .populate("teamLeadId", "username email");
};

/**
 * Delete a task.
 * - Manager: can delete any task.
 * - Team Lead / Employee: can delete tasks they created.
 */
const deleteTask = async (requestingUser, taskId) => {
  const task = await Task.findById(taskId);
  if (!task) throw new ApiError(404, "Task not found");

  if (requestingUser.role === "manager") {
    await Task.findByIdAndDelete(taskId);
    return;
  }

  if (!task.createdBy.equals(requestingUser._id)) {
    throw new ApiError(403, "You can only delete tasks you created");
  }

  await Task.findByIdAndDelete(taskId);
};

// Private helpers

/**
 * Verify the requesting user can access the task.
 */
const assertTaskAccess = async (requestingUser, task, mode = "read") => {
  if (requestingUser.role === "manager") return;

  if (requestingUser.role === "teamlead") {
    const teamMembers = await User.find({ teamLeadId: requestingUser._id }).select("_id");
    const allowedIds = [
      requestingUser._id.toString(),
      ...teamMembers.map((m) => m._id.toString()),
    ];
    if (!allowedIds.includes(task.assignedTo.toString())) {
      throw new ApiError(403, "Access denied: task not in your team");
    }
    return;
  }

  // Employee: can only access tasks assigned to them
  if (!task.assignedTo.equals(requestingUser._id)) {
    throw new ApiError(403, "Access denied: task not assigned to you");
  }
};

/**
 * Assert that a team lead can assign to the given user ID.
 */
const assertTeamLeadCanAssign = async (teamLead, targetUserId) => {
  if (teamLead._id.equals(targetUserId)) return;

  const targetUser = await User.findById(targetUserId);
  if (!targetUser) throw new ApiError(404, "Target user not found");

  if (
    targetUser.role !== "employee" ||
    !targetUser.teamLeadId ||
    !targetUser.teamLeadId.equals(teamLead._id)
  ) {
    throw new ApiError(403, "You can only assign tasks to your own team members");
  }
};

module.exports = { getTasks, getTaskById, createTask, updateTask, reassignTask, deleteTask };
