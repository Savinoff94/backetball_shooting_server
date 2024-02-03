function getCurrentDateFormatted() {
    const currentDate = new Date();
  
    const day = String(currentDate.getDate()).padStart(2, '0');
    const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Month is zero-based
    const year = currentDate.getFullYear();
  
    const formattedDate = `${day}/${month}/${year}`;
  
    return formattedDate;
}

function getISODateByKey(key ='current') {

    const currentDate = new Date();

    switch (key) {
        case 'year':
            currentDate.setFullYear(currentDate.getFullYear() - 1);
            break;
        case 'sixMonths':
            currentDate.setMonth(currentDate.getMonth() - 6);
            break;
        case 'threeMonths':
            currentDate.setMonth(currentDate.getMonth() - 3);
            break;
        case 'lastMonth':
            currentDate.setMonth(currentDate.getMonth() - 1);
            break;
        case 'current':
            break;
        case 'all':
            currentDate.setFullYear(currentDate.getFullYear() - 10);
            break;
        default:
            throw new Error('wrong timeKey')
            break;
    }

    return currentDate.toISOString();
}

function getTimeRangeAccordingKey(key) {

    const result = [];

    result.push(getISODateByKey(key))
    result.push(getISODateByKey('current'))

    return result;
}

function convertISODateToDDMMYYYY(isoDate) {
    const date = new Date(isoDate);
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return date.toLocaleDateString('en-GB', options);
  }
 
module.exports = {
getCurrentDateFormatted,
    getISODateByKey,
    getTimeRangeAccordingKey,
    convertISODateToDDMMYYYY,
}