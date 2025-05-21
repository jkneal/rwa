const today = new Date()
export const todayStr = (today.getMonth() + 1).toString().padStart(2, '0') + '/' +
    today.getDate().toString().padStart(2, '0') + '/' + today.getFullYear()

let yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);
export const yesterdayStr = (yesterday.getMonth() + 1).toString().padStart(2, '0') + '/' +
    yesterday.getDate().toString().padStart(2, '0') + '/' + yesterday.getFullYear()

let tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
export const tomorrowStr = (tomorrow.getMonth() + 1).toString().padStart(2, '0') + '/' +
    tomorrow.getDate().toString().padStart(2, '0') + '/' + tomorrow.getFullYear()