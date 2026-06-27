const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const { authorize } = require("../middlewares/role.middleware");
const { validate } = require("../middlewares/validate.middleware");
const {
  createUserSchema,
  updateUserSchema,
  assignTeamLeadSchema,
} = require("../validations/user.validation");

// All user routes require authentication
router.use(authenticate);

// GET  /api/users          — Manager: all users | Team Lead: their employees
router.get("/", authorize("manager", "teamlead"), userController.getUsers);

// POST /api/users          — Manager only: create a new user
router.post("/", authorize("manager"), validate(createUserSchema), userController.createUser);

// GET  /api/users/team-leads — Manager only: team leads with task/employee stats
// Must be placed BEFORE /:id to prevent "team-leads" being treated as an id
router.get("/team-leads", authorize("manager"), userController.getTeamLeadsWithStats);

// GET  /api/users/master-list — All roles: flat list of all users (id + username, role only)
router.get("/master-list", authorize("manager", "teamlead"), userController.getMasterUserList);

// GET    /api/users/:id    — Manager or Team Lead (scoped)
router.get("/:id", authorize("manager", "teamlead"), userController.getUserById);

// PATCH  /api/users/:id    — Manager only: update user details
router.patch("/:id", authorize("manager"), validate(updateUserSchema), userController.updateUser);

// DELETE /api/users/:id    — Manager only: remove a user
router.delete("/:id", authorize("manager"), userController.deleteUser);

// PATCH  /api/users/:id/assign-team-lead — Manager only: quick team-lead assignment
router.patch(
  "/:id/assign-team-lead",
  authorize("manager"),
  validate(assignTeamLeadSchema),
  userController.assignTeamLead
);

module.exports = router;
