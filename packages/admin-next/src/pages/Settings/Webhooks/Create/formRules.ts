export const createWebhookFormRules = {
  name: [
    {
      required: true,
      trigger: 'blur',
      message: 'Name is required',
    },
    {
      type: 'string',
      min: 5,
      trigger: 'blur',
      message: 'Name must be at least 5 characters',
    },
  ],

  method: [
    {
      required: true,
      trigger: 'blur',
      message: 'Method is required',
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

export default createWebhookFormRules;
