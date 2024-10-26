import dayjs from "dayjs";
import Joi from "joi";

export const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Please provide a valid email address.",
    "any.required": "Email is required.",
  }),
  password: Joi.string().min(6).required().messages({
    "string.min": "Password must be at least 6 characters long.",
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
  password: Joi.string().required().messages({
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
    end: Joi.date().greater(Joi.ref("start")).optional().messages({
      "date.greater": "End date must be after the start date.",
    }),
  })
    .required()
    .messages({
      "any.required": "Date information is required for the event.",
    }),
  location: Joi.string().trim().optional(),
  category: Joi.string().required().messages({
    "string.base": "Please specify a valid category ID.",
    "any.required": "Event category is required.",
  }),
  additionalAttributes: Joi.object().optional(),
  sharedWith: Joi.array().items(Joi.string()).optional().messages({
    "array.base": "SharedWith must be an array of user IDs.",
  }),
  extraInfo: Joi.string().optional(),
});

export const updateEventSchema = Joi.object({
  title: Joi.string().trim().optional(),
  date: Joi.object({
    start: Joi.date().optional().messages({
      "date.base": "Please add a valid start date for the event.",
    }),
    end: Joi.date().optional().greater(Joi.ref("start")).messages({
      "date.greater": "End date must be after the start date.",
    }),
  })
    .or("start", "end")
    .optional()
    .messages({
      "object.missing": "At least one of start or end date must be provided.",
    }),
  location: Joi.string().trim().optional(),
  category: Joi.string().optional().messages({
    "string.base": "Please specify a valid category ID.",
  }),
  additionalAttributes: Joi.object().optional(),
  sharedWith: Joi.array().items(Joi.string()).optional(),
  extraInfo: Joi.string().optional(),
})
  .min(1)
  .messages({
    "object.min": "At least one field must be updated.",
  });
