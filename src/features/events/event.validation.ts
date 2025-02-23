import Joi from "joi";

export const createEventSchema = Joi.object({
  title: Joi.string().trim().required().messages({
    "string.empty": "Please add a title for the event.",
    "any.required": "Event title is required.",
  }),
  date: Joi.object({
    start: Joi.date().required().messages({
      "date.base": "Please add a valid start date for the event.",
      "any.required": "Start date is required for the event.",
    }),
    end: Joi.date()
      .optional()
      .min(Joi.ref("start"))
      .default(Joi.ref("start"))
      .messages({
        "date.min": "End date must be the same as or after the start date.",
      }),
  })
    .required()
    .messages({
      "any.required": "Date information is required for the event.",
    }),
  location: Joi.object({
    venue: Joi.string().trim().allow("").optional(),
    city: Joi.string().trim().allow("").optional(),
  }),
  description: Joi.string().trim().allow("").optional(),
  category: Joi.string()
    .regex(/^[a-fA-F0-9]{24}$/)
    .required()
    .messages({
      "string.base": "Please specify a valid category ID.",
      "string.pattern.base": "Category ID must be a valid ObjectId.",
      "any.required": "Event category is required.",
    }),
  additionalAttributes: Joi.object().optional(),
  private: Joi.boolean().optional().default(false),
  unConfirmed: Joi.boolean().optional().default(false),
  copiedFrom: Joi.string()
    .regex(/^[a-fA-F0-9]{24}$/)
    .optional()
    .messages({
      "string.base": "Please specify a valid event ID.",
      "string.pattern.base": "Event ID must be a valid ObjectId.",
    }),
});

export const updateEventSchema = Joi.object({
  title: Joi.string().trim().optional(),
  date: Joi.object({
    start: Joi.date().required().messages({
      "date.base": "Please add a valid start date for the event.",
      "any.required": "Start date is required when updating date.",
    }),
    end: Joi.date()
      .optional()
      .min(Joi.ref("start"))
      .default(Joi.ref("start"))
      .messages({
        "date.min": "End date must be the same as or after the start date.",
      }),
  })
    .optional()
    .messages({
      "object.base": "Start date is required; end date is optional.",
    }),
  location: Joi.object({
    venue: Joi.string().trim().allow("").optional(),
    city: Joi.string().trim().allow("").optional(),
  }),
  description: Joi.string().trim().allow("").optional(),
  category: Joi.string()
    .regex(/^[a-fA-F0-9]{24}$/)
    .optional()
    .messages({
      "string.base": "Please specify a valid category ID.",
      "string.pattern.base": "Category ID must be a valid ObjectId.",
    }),
  additionalAttributes: Joi.object().optional(),
  private: Joi.boolean().optional(),
  unConfirmed: Joi.boolean().optional(),
  copiedFrom: Joi.alternatives()
    .try(
      Joi.string()
        .regex(/^[a-fA-F0-9]{24}$/)
        .messages({
          "string.base": "Please specify a valid event ID.",
          "string.pattern.base": "Event ID must be a valid ObjectId.",
        }),
      Joi.valid(null)
    )
    .optional()
    .messages({
      "alternatives.types": "copiedFrom must be either a valid event ID or null"
    }),
})
  .min(1)
  .messages({
    "object.min": "At least one field must be updated.",
  });
