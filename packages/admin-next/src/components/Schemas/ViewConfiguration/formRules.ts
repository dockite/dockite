export const baseFormRules = {
  name: [
    {
      required: true,
      message: 'Name is required',
      trigger: 'blur',
    },
    {
      min: 3,
      message: 'Name must be at least 3 characters',
      trigger: 'blur',
    },
  ],

  constraints: [
    {
      type: 'object',
      message: 'Constraints must be of type object',
      fields: {
        AND: { type: 'array', min: 1, message: 'AND query must contain at least 1 constraint' },
        OR: { type: 'array', min: 1, message: 'OR query must contain at least 1 constraint' },
      },
    },
  ],
};

export const tableViewFormRules = {
  fieldsToDisplay: [
    {
      type: 'array',
      message: 'Fields to Display must be of type Array',
      trigger: 'blur',
    },
  ],

  defaultOrderBy: {
    column: [
      {
        required: true,
        message: 'Default Ordering Column is required',
        trigger: 'blur',
      },
    ],

    direction: [
      {
        required: true,
        message: 'Default Ordering Direction is required',
        trigger: 'blur',
      },
      {
        type: 'enum',
        enum: ['ASC', 'DESC'],
        message: 'Default Ordering Direction must be a valid option',
        trigger: 'blur',
      },
    ],
  },
};

export const treeViewFormRules = {
  labelField: [
    {
      required: true,
      message: 'Label Field is required',
      trigger: 'blur',
    },
  ],

  parentField: [
    {
      required: true,
      message: 'Parent Field is required',
      trigger: 'blur',
    },
  ],
};

export const gridViewFormRules = {
  labelField: [
    {
      required: true,
      message: 'Label Field is required',
      trigger: 'blur',
    },
  ],

  imageField: [
    {
      required: true,
      message: 'Image Field is required',
      trigger: 'blur',
    },
  ],

  fieldsToDisplay: [
    {
      type: 'array',
      message: 'Fields to Display must be of type Array',
      trigger: 'blur',
    },
  ],

  defaultOrderBy: {
    column: [
      {
        required: true,
        message: 'Default Ordering Column is required',
        trigger: 'blur',
      },
    ],
    direction: [
      {
        required: true,
        message: 'Default Ordering Direction is required',
        trigger: 'blur',
      },
      {
        type: 'enum',
        enum: ['ASC', 'DESC'],
        message: 'Default Ordering Direction must be a valid option',
        trigger: 'blur',
      },
    ],
  },
};
