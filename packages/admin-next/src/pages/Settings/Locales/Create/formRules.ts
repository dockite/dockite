export const createLocaleFormRules = {
  id: [
    {
      required: true,
      trigger: 'blur',
      message: 'ID is required.',
    },
    {
      min: 2,
      trigger: 'blur',
      message: 'ID must be at least 2 characters long.',
    },
  ],

  title: [
    {
      required: true,
      trigger: 'blur',
      message: 'Title is required.',
    },
    {
      min: 2,
      trigger: 'blur',
      message: 'Title must be at least 2 characters long.',
    },
  ],

  icon: [
    {
      required: true,
      trigger: 'blur',
      message: 'Name is required.',
    },
  ],
};

export default createLocaleFormRules;
