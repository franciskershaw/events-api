import Joi from "joi";

const isValidISODateString = (
  value: string,
  helpers: Joi.CustomHelpers
): string | Joi.ErrorReport => {
  if (!value) return value;

  const date = new Date(value);
  if (isNaN(date.getTime())) {
    return helpers.error("string.isoDate");
  }

  return value;
};

export const createEventSchema = Joi.object({
  title: Joi.string().trim().min(3).max(100).required().messages({
    "string.empty": "Please add a title for the event.",
    "any.required": "Event title is required.",
    "string.min": "Event title must be at least 3 characters long.",
    "string.max": "Event title cannot exceed 100 characters.",
  }),
  date: Joi.object({
    start: Joi.string().required().custom(isValidISODateString).messages({
      "string.empty": "Please add a valid start date for the event.",
      "any.required": "Start date is required for the event.",
      "string.isoDate": "Start date must be a valid ISO date string.",
    }),
    end: Joi.string()
      .optional()
      .custom((value, helpers) => {
        if (!value) return value;

        const startDate = helpers.state.ancestors[0].start;
        const endDate = new Date(value);
        const startDateTime = new Date(startDate);

        if (isNaN(endDate.getTime())) {
          return helpers.error("string.isoDate");
        }

        if (endDate < startDateTime) {
          return helpers.error("string.min");
        }

        return value;
      })
      .messages({
        "string.isoDate": "End date must be a valid ISO date string.",
        "string.min": "End date must be the same as or after the start date.",
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
        .default("weekly"),
      interval: Joi.number().min(1).default(1).messages({
        "number.base": "Interval must be a number.",
        "number.min": "Interval must be at least 1.",
      }),
      startDate: Joi.string().optional().custom(isValidISODateString).messages({
        "string.isoDate": "Start date must be a valid ISO date string.",
      }),
      endDate: Joi.alternatives()
        .try(Joi.string().custom(isValidISODateString), Joi.valid(null))
        .optional()
        .messages({
          "string.isoDate": "End date must be a valid ISO date string or null.",
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
    start: Joi.string().required().custom(isValidISODateString).messages({
      "string.empty": "Please add a valid start date for the event.",
      "any.required": "Start date is required when updating date.",
      "string.isoDate": "Start date must be a valid ISO date string.",
    }),
    end: Joi.string()
      .optional()
      .custom((value, helpers) => {
        if (!value) return value;

        const startDate = helpers.state.ancestors[0].start;
        const endDate = new Date(value);
        const startDateTime = new Date(startDate);

        if (isNaN(endDate.getTime())) {
          return helpers.error("string.isoDate");
        }

        if (endDate < startDateTime) {
          return helpers.error("string.min");
        }

        return value;
      })
      .messages({
        "string.isoDate": "End date must be a valid ISO date string.",
        "string.min": "End date must be the same as or after the start date.",
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
        .default("weekly"),
      interval: Joi.number().min(1).default(1).messages({
        "number.base": "Interval must be a number.",
        "number.min": "Interval must be at least 1.",
      }),
      startDate: Joi.string().optional().custom(isValidISODateString).messages({
        "string.isoDate": "Start date must be a valid ISO date string.",
      }),
      endDate: Joi.alternatives()
        .try(Joi.string().custom(isValidISODateString), Joi.valid(null))
        .optional()
        .messages({
          "string.isoDate": "End date must be a valid ISO date string or null.",
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
