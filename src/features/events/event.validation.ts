import Joi from "joi";

export const createEventSchema = Joi.object({
  title: Joi.string().trim().min(3).max(100).required().messages({
    "string.empty": "Please add a title for the event.",
    "any.required": "Event title is required.",
    "string.min": "Event title must be at least 3 characters long.",
    "string.max": "Event title cannot exceed 100 characters.",
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
    venue: Joi.string().trim().allow("").max(150).optional().messages({
      "string.max": "Venue name cannot exceed 150 characters.",
    }),
    city: Joi.string().trim().allow("").max(50).optional().messages({
      "string.max": "City name cannot exceed 50 characters.",
    }),
  }),
  description: Joi.string().trim().allow("").max(2000).optional().messages({
    "string.max": "Description cannot exceed 2000 characters.",
  }),
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
  recurrence: Joi.object({
    isRecurring: Joi.boolean().default(false),
    pattern: Joi.object({
      frequency: Joi.string()
        .valid("daily", "weekly", "monthly", "yearly")
        .default("yearly"),
      interval: Joi.number().min(1).default(1).messages({
        "number.base": "Interval must be a number.",
        "number.min": "Interval must be at least 1.",
      }),
      daysOfWeek: Joi.array()
        .items(Joi.number().min(0).max(6)) // 0 = Sunday, 6 = Saturday
        .default([]),
      endDate: Joi.date().optional().messages({
        "date.base": "End date must be a valid date.",
      }),
      count: Joi.number().min(1).optional().messages({
        "number.base": "Count must be a number.",
        "number.min": "Count must be at least 1.",
      }),
    })
      .optional()
      .when("isRecurring", {
        is: true,
        then: Joi.object({
          frequency: Joi.required(),
          interval: Joi.required(),
        }),
        otherwise: Joi.object().optional(),
      }),
  })
    .optional()
    .default({ isRecurring: false }),
});

export const updateEventSchema = Joi.object({
  title: Joi.string().trim().min(3).max(100).optional().messages({
    "string.min": "Event title must be at least 3 characters long.",
    "string.max": "Event title cannot exceed 100 characters.",
  }),
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
    venue: Joi.string().trim().allow("").max(150).optional().messages({
      "string.max": "Venue name cannot exceed 150 characters.",
    }),
    city: Joi.string().trim().allow("").max(50).optional().messages({
      "string.max": "City name cannot exceed 50 characters.",
    }),
  }),
  description: Joi.string().trim().allow("").max(2000).optional().messages({
    "string.max": "Description cannot exceed 2000 characters.",
  }),
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
      "alternatives.types":
        "copiedFrom must be either a valid event ID or null",
    }),
  recurrence: Joi.object({
    isRecurring: Joi.boolean().default(false),
    pattern: Joi.object({
      frequency: Joi.string()
        .valid("daily", "weekly", "monthly", "yearly")
        .default("yearly"),
      interval: Joi.number().min(1).default(1).messages({
        "number.base": "Interval must be a number.",
        "number.min": "Interval must be at least 1.",
      }),
      daysOfWeek: Joi.array()
        .items(Joi.number().min(0).max(6)) // 0 = Sunday, 6 = Saturday
        .default([]),
      endDate: Joi.date().optional().messages({
        "date.base": "End date must be a valid date.",
      }),
      count: Joi.number().min(1).optional().messages({
        "number.base": "Count must be a number.",
        "number.min": "Count must be at least 1.",
      }),
    })
      .optional()
      .when("isRecurring", {
        is: true,
        then: Joi.object({
          frequency: Joi.required(),
          interval: Joi.required(),
        }),
        otherwise: Joi.object().optional(),
      }),
  })
    .optional()
    .default({ isRecurring: false }),
})
  .min(1)
  .messages({
    "object.min": "At least one field must be updated.",
  });
