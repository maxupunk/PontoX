export default function getFirstLastDayCalendar(date: Date[]) {
    if (date.length < 2) {
        return { firstDay: null, lastDay: null };
    }
    const dateStart = date[0];
    const dateEnd = date.pop();
    return {
        firstDay: formatDate(dateStart),
        lastDay: dateEnd ? formatDate(dateEnd) : null,
    };
}

function formatDate(date: Date) {
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
}