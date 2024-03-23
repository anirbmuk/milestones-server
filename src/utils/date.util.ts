export const validateStringDate = (input: string) => {
  const [dd, mm, yyyy] = input.split('-');
  if (!dd || !mm || !yyyy) {
    return false;
  }

  const stringDateInput = `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
  const [inputYear, inputMonth, inputDay] = stringDateInput.split('-');

  if (
    +inputMonth <= 0 ||
    +inputMonth > 12 ||
    +inputDay <= 0 ||
    +inputDay > 31
  ) {
    return false;
  }

  const convertedDate = new Date(stringDateInput).toISOString();
  const [convertedYear, convertedMonth, convertedDay] = convertedDate
    .split('T')[0]
    .split('-');
  if (
    +inputMonth === +convertedMonth &&
    +inputDay === +convertedDay &&
    +inputYear === +convertedYear
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
  const [dd, mm, yyyy] = stringDateInput.split('-');
  return new Date(
    new Date(
      `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`,
    ).toISOString(),
  ).getTime();
};
