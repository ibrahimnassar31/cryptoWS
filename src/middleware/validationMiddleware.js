import Joi from 'joi';

const validationMiddleware = (schema, property) => (req, res, next) => {
  const { error } = schema.validate(req[property]);
  if (error) {
    const { details } = error;
    const message = details.map(i => i.message).join(',');
    return res.status(400).json({ error: message });
  }
  next();
};

export default validationMiddleware;