const Joi = require("joi");

const assignTeamLeadSchema = Joi.object({
  teamLeadId: Joi.string().hex().length(24).required().messages({
    "any.required": "teamLeadId is required",
    "string.hex": "teamLeadId must be a valid user ID",
  }),
});

const updateUserSchema = Joi.object({
  username: Joi.string().min(3).max(30).trim().optional(),
  isActive: Joi.boolean().optional(),
  teamLeadId: Joi.string().hex().length(24).optional().allow(null),
  managerId: Joi.string().hex().length(24).optional().allow(null),
}).min(1);

module.exports = { assignTeamLeadSchema, updateUserSchema };
