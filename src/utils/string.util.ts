export const maskEmail = (email: string | undefined) => {
  if (!email) {
    return '';
  }
  const [username, domain] = email.split('@');
  const maskedUsername = username
    ?.split('')
    .map((each, index) =>
      index === 0 || index === username.length - 1 ? each : '*',
    )
    .join('');
  return [maskedUsername, domain].join('@');
};
