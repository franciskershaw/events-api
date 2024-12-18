import Joi from "joi";

export const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Please provide a valid email address.",
    "any.required": "Email is required.",
  }),
  password: Joi.string().min(6).max(30).required().messages({
    "string.min": "Password must be at least 6 characters long.",
    "string.max": "Password must be at most 30 characters long.",
    "any.required": "Password is required.",
  }),
  name: Joi.string().trim().required().messages({
    "string.empty": "Please add a name.",
    "any.required": "Name is required.",
  }),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Please provide a valid email address.",
    "any.required": "Email is required.",
  }),
  password: Joi.string().max(30).required().messages({
    "string.max": "Password must be at most 30 characters long.",
    "any.required": "Password is required.",
  }),
});

export const newEventSchema = Joi.object({
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
  category: Joi.string().required().messages({
    "string.base": "Please specify a valid category ID.",
    "any.required": "Event category is required.",
  }),
  additionalAttributes: Joi.object().optional(),
  sharedWith: Joi.array()
    .items(
      Joi.string()
        .regex(/^[a-fA-F0-9]{24}$/)
        .messages({
          "string.pattern.base": "Each sharedWith ID must be a valid ObjectId.",
        })
    )
    .optional()
    .messages({
      "array.base": "SharedWith must be an array of user IDs.",
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
  sharedWith: Joi.array()
    .items(
      Joi.string()
        .regex(/^[a-fA-F0-9]{24}$/)
        .messages({
          "string.pattern.base": "Each sharedWith ID must be a valid ObjectId.",
        })
    )
    .optional(),
})
  .min(1)
  .messages({
    "object.min": "At least one field must be updated.",
  });

export const connectUserSchema = Joi.object({
  connectionId: Joi.string().alphanum().length(8).required().messages({
    "string.alphanum":
      "Connection ID must contain only alphanumeric characters.",
    "string.length": "Connection ID must be exactly 8 characters long.",
    "any.required": "Connection ID is required.",
  }),
});

export const removeConnectionSchema = Joi.object({
  targetUserId: Joi.string()
    .regex(/^[a-fA-F0-9]{24}$/)
    .required()
    .messages({
      "string.pattern.base": "Target user ID must be a valid ObjectId.",
      "any.required": "Target user ID is required.",
    }),
});
