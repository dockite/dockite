export const editWebhookFormRules = {
  name: [
    {
      required: true,
      trigger: 'blur',
      description: 'Name is required',
    },
    {
      type: 'string',
      min: 5,
      trigger: 'blur',
      description: 'Name must be at least 5 characters',
    },
  ],

  method: [
    {
      required: true,
      trigger: 'blur',
      description: 'Method is required',
    },
    {
      type: 'string',
      enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      trigger: 'blur',
      message: 'Method must be a valid HTTP request method',
    },
  ],

  url: [
    {
      required: true,
      trigger: 'blur',
      message: 'URL is required',
    },
    {
      type: 'url',
      trigger: 'blur',
      message: 'URL must be valid',
    },
  ],
};

export default editWebhookFormRules;
