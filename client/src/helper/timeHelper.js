export const renderDateTimeString = (value) => new Date(value).toLocaleDateString() + " - " + new Date(value).toLocaleTimeString()