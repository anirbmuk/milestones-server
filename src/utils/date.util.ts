const timeZone = 'Asia/Kolkata';

export const validateStringDate = (stringDateInput: string) => {
  const convertedDate = new Date(stringDateInput).toLocaleString('en-US', {
    timeZone,
  });

  const [inputMonth, inputDay, inputYear] = stringDateInput.split('-');

  if (
    +inputMonth <= 0 ||
    +inputMonth > 12 ||
    +inputDay <= 0 ||
    +inputDay > 31
  ) {
    return false;
  }

  const [convertedMonth, convertedDay, convertedYear] = convertedDate
    .split(', ')[0]
    .split('/');

  if (
    inputMonth === convertedMonth &&
    inputDay === convertedDay &&
    inputYear === convertedYear
  ) {
    return true;
  }
  return false;
};

export const validateStringDateRange = (
  stringDateInput1: string,
  stringDateInput2: string,
) => {
  return getTime(stringDateInput2) >= getTime(stringDateInput1);
};

export const getTime = (stringDateInput: string) => {
  return new Date(
    new Date(stringDateInput).toLocaleString('en-US', { timeZone }),
  ).getTime();
};
