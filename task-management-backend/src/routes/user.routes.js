const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const { authorize } = require("../middlewares/role.middleware");
const { validate } = require("../middlewares/validate.middleware");
const { assignTeamLeadSchema } = require("../validations/user.validation");

// All user routes require authentication
router.use(authenticate);

// GET /api/users  - Manager: all users | Team Lead: their employees
router.get("/", authorize("manager", "teamlead"), userController.getUsers);

// GET /api/users/team-leads  - Manager: team leads with task stats (placed before /:id)
router.get("/team-leads", authorize("manager"), userController.getTeamLeadsWithStats);

// GET /api/users/:id  - Manager or Team Lead can view a user
router.get("/:id", authorize("manager", "teamlead"), userController.getUserById);

// PATCH /api/users/:id/assign-team-lead  - Manager only
router.patch(
  "/:id/assign-team-lead",
  authorize("manager"),
  validate(assignTeamLeadSchema),
  userController.assignTeamLead
);

module.exports = router;
