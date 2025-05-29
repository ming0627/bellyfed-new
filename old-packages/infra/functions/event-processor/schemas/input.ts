import * as Joi from 'joi';

export const eventSchema = Joi.object({
    type: Joi.string().required(),
    data: Joi.object().required(),
    metadata: Joi.object({
        timestamp: Joi.string().isoDate().required(),
        version: Joi.string().required(),
        source: Joi.string().required(),
    }).required(),
});

export const apiGatewaySchema = Joi.object({
    body: Joi.string().required(),
    httpMethod: Joi.string().valid('POST', 'PUT', 'DELETE').required(),
    resource: Joi.string().required(),
    path: Joi.string().required(),
});
