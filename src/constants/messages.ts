export enum ErrorCodes {
  INVALID_INPUT = 'INVALID_INPUT',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  GENERIC = 'GENERIC',
}

export const messages: Record<ErrorCodes, { message: string; code: number }> = {
  INVALID_INPUT: {
    message: 'Username or password cannot be empty',
    code: 400,
  },
  INVALID_CREDENTIALS: {
    message: 'Invalid credentials provided for milestones system',
    code: 401,
  },
  GENERIC: {
    message: 'Internal Server Error',
    code: 500,
  },
};
