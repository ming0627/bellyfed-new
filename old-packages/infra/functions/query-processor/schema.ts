import * as Joi from 'joi';

export const schema = Joi.object({
    Records: Joi.array()
        .items(
            Joi.object({
                messageId: Joi.string().required(),
                body: Joi.string()
                    .required()
                    .custom((value, helpers) => {
                        try {
                            const parsed = JSON.parse(value);
                            if (!parsed.data || typeof parsed.data !== 'object') {
                                return helpers.error('any.invalid');
                            }
                            return value;
                        } catch {
                            return helpers.error('any.invalid');
                        }
                    }),
            })
        )
        .required(),
});
