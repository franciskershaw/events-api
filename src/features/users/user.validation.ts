import Joi from "joi";

export const updateConnectionPreferencesSchema = Joi.object({
  hideEvents: Joi.boolean().required(),
});
