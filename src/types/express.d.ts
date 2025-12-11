import { CurrentUser } from './index.js';

// Extend Express Request to include authenticated user from JWT
declare module 'express' {
  export interface Request {
    user?: CurrentUser;
  }
}
