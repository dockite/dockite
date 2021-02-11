import { PASSWORD_MIN_LEN } from '~/common/constants';

export const loginFormRules = {
  email: [
    {
      required: true,
      message: 'Email is required.',
      trigger: 'blur',
    },
    {
      type: 'email',
      message: 'Email provided is invalid.',
      trigger: 'blur',
    },
  ],
  password: [
    {
      required: true,
      message: 'Password is required.',
      trigger: 'blur',
    },
    {
      min: PASSWORD_MIN_LEN,
      message: `Password must be at least ${PASSWORD_MIN_LEN} characters.`,
      trigger: 'blur',
    },
  ],
};

export const registerFormRules = {
  email: [
    {
      required: true,
      message: 'Email is required.',
      trigger: 'blur',
    },
    {
      type: 'email',
      message: 'Email provided is invalid.',
      trigger: 'blur',
    },
  ],
  password: [
    {
      required: true,
      message: 'Password is required.',
      trigger: 'blur',
    },
    {
      min: PASSWORD_MIN_LEN,
      message: `Password must be at least ${PASSWORD_MIN_LEN} characters.`,
      trigger: 'blur',
    },
  ],
  firstName: [
    {
      required: true,
      message: 'First Name is required.',
      trigger: 'blur',
    },
  ],
  lastName: [
    {
      required: true,
      message: 'Last Name is required.',
      trigger: 'blur',
    },
  ],
};
