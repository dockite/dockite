export interface User {
  id: string;
  firstName: string;
  lastName: string;
  password: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  verified: boolean;
  normalizedScopes?: string[];
}
