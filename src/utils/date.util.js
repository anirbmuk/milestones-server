const validateStringDate = stringDateInput => {
    const convertedDate = (new Date(stringDateInput)).toLocaleString('en-US', {timeZone: 'Asia/Kolkata' });

    const inputDateParts = stringDateInput.split('-');
    const inputMonth = inputDateParts[0];
    const inputDay = inputDateParts[1];
    const inputYear = inputDateParts[2];

    if (inputMonth <= 0 || inputMonth > 12 || inputDay <= 0 || inputDay > 31) {
        return false;
    }

    const convertedDateParts = convertedDate.split(', ')[0].split('/');
    const convertedMonth = convertedDateParts[0];
    const convertedDay = convertedDateParts[1];
    const convertedYear = convertedDateParts[2];

    if ((inputMonth === convertedMonth) && (inputDay === convertedDay) && (inputYear === convertedYear)) {
        return true;
    }
    return false;

};

module.exports = validateStringDate;
