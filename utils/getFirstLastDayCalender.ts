export default function getFirstLastDayCalendar([dateStart, , ...rest]: Date[]) {
    if (!dateStart || rest.length === 0) {
        return { firstDay: null, lastDay: null };
    }
    const dateEnd = rest.pop(); // Obtém o último elemento do array
    return {
        firstDay: formatDate(dateStart),
        lastDay: dateEnd ? formatDate(dateEnd) : null,
    };
}

function formatDate(date: Date) {
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
}