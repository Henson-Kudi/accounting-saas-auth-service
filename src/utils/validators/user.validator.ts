import Joi from '@hapi/joi';

export default Joi.object({
  name: Joi.string()
    .required()
    .trim()
    .regex(/^[a-zA-Z]+(?:['\s-][a-zA-Z]+)*$/)
    .min(2)
    .max(50)
    .message('Invalid full name format. Please enter a valid name.'),
  email: Joi.string().required().trim().lowercase().email(),
  addresses: Joi.array().items({
    type: Joi.string().required().valid('Home', 'Work', 'Other'),
    line1: Joi.string().required(),
    line2: Joi.string().optional().allow(null).allow(''),
    line3: Joi.string().optional().allow(null).allow(''),
  }),
  contacts: Joi.array()
    .min(1)
    .items({
      type: Joi.string()
        .required()
        .valid('Mobile', 'Home', 'Work', 'WhatsApp', 'Main'),
      phone: Joi.string()
        .required()
        .pattern(/^\+\d{1,4}\d{6,14}$/)
        .message(
          'Invalid phone number format. It must start with a "+" and include a valid country code.'
        ),
    }),
  password: Joi.string()
    .required()
    .min(8)
    .max(30)
    .pattern(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()-_=+{};:'",<.>/?]).{8,32}$/
    )
    .message(
      'Invalid password format. It must be at least 8 characters and contain at least one lowercase letter, one uppercase letter,special character, and one number.'
    ),
  repeatPassword: Joi.string()
    .valid(Joi.ref('password'))
    .required()
    .messages({'any.only': 'passwords do not match'}),
  lastLoginDevice: Joi.string().optional().allow('').allow(null),
  lastLoginIp: Joi.string().optional().allow('').allow(null),
  lastLoginLocation: Joi.string().optional().allow('').allow(null),
  lastLoginAt: Joi.date().optional().allow('').allow(null),
})
  .messages({
    'contacts.atLeastOneMainContact':
      'At least one contact with type "Main" must exist.',
  })
  .custom((value, helpers) => {
    const hasMainContact = value?.contacts?.some(
      (contact: {[key: string]: unknown}) => contact.type === 'Main'
    );

    if (!hasMainContact) {
      return helpers.error('contacts.atLeastOneMainContact');
    }
    return value;
  });

export const updateSchema = Joi.object({
  name: Joi.string()
    .trim()
    .optional()
    .regex(/^[a-zA-Z]+(?:['\s-][a-zA-Z]+)*$/)
    .min(2)
    .max(50)
    .message('Invalid full name format. Please enter a valid name.'),
  email: Joi.string().optional().trim().lowercase().email(),
  addresses: Joi.array()
    .items({
      type: Joi.string().required().valid('Home', 'Work', 'Other'),
      line1: Joi.string().required(),
      line2: Joi.string().optional().allow(null).allow(''),
      line3: Joi.string().optional().allow(null).allow(''),
    })
    .optional(),
  contacts: Joi.array()
    .items({
      type: Joi.string()
        .required()
        .valid('Mobile', 'Home', 'Work', 'WhatsApp', 'Main'),
      phone: Joi.string()
        .required()
        .pattern(/^\+\d{1,4}\d{6,14}$/)
        .message(
          'Invalid phone number format. It must start with a "+" and include a valid country code.'
        ),
    })
    .optional(),
});

// After registering, you cannot change the person who invited u or if u're not an account owner. And you also cannot change ur active or delete status. There should be special routes for these.
// You also cannot change your password alongside other user infos. Password change should have its own special request route.

export const changePasswordSchema = Joi.object({
  oldPassword: Joi.string()
    .required()
    .min(8)
    .max(30)
    .pattern(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/
    )
    .message(
      'Invalid password format. It must be at least 8 characters and contain at least one lowercase letter, one uppercase letter, one special character, and one number.'
    ),
  newPassword: Joi.string()
    .required()
    .min(8)
    .max(30)
    .pattern(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/
    )
    .message(
      'Invalid password format. It must be at least 8 characters and contain at least one lowercase letter, one uppercase letter, one special character, and one number.'
    ),
  repeatNewPassword: Joi.ref('newPassword'),
});
