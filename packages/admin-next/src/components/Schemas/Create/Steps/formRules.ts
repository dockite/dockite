export const nameStepFormRules = {
  title: [
    {
      required: true,
      message: 'Title is required.',
      trigger: 'blur',
    },
    {
      min: 3,
      max: 26,
      message: 'Title must be at least 3 characters and no more than 26 characters.',
      trigger: 'blur',
    },
  ],
  name: [
    {
      required: true,
      message: 'Name is required',
      trigger: 'blur',
    },
    {
      pattern: /^[_A-Za-z][_0-9A-Za-z]*$/,
      message:
        'Name must be a valid API identifier containing only: letters, numbers and underscores.',
      trigger: 'blur',
    },
    {
      min: 3,
      max: 26,
      message: 'Name must be at least 3 characters and no more than 26 characters.',
      trigger: 'blur',
    },
  ],
};

export const fieldsStepFormRules = {
  fields: [
    {
      required: true,
      message: 'Fields are required',
      trigger: 'blur',
    },
    {
      min: 1,
      message: 'There must be at least 1 field',
      trigger: 'blur',
    },
  ],
};

export const settingsStepFormRules = {};
