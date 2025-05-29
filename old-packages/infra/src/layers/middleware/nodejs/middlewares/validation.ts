import { MiddlewareObj } from '@middy/core';
import { Schema } from 'joi';
import { ApplicationError } from '@layers/utils/errors';

export const inputValidation = (schema?: Schema): MiddlewareObj => {
    return {
        before: async (request) => {
            if (!schema) {
                return;
            }

            const { event } = request;

            try {
                const validatedEvent = await schema.validateAsync(event, {
                    abortEarly: false,
                    stripUnknown: true,
                });

                request.event = validatedEvent;
            } catch (error: unknown) {
                throw new ApplicationError('Validation failed', 400);
            }
        },
    };
};
