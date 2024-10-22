import { formatDate } from "./formatDateBr";

export default function getFirstLastDayCalendar(date: Date[]) {
    if (date.length < 2) {
        return { firstDay: '', lastDay: '' };
    }
    const dateStart:any = date[0];
    const dateEnd:any = date[date.length - 1];
    return {
        firstDay: formatDate(dateStart),
        lastDay: dateEnd ? formatDate(dateEnd) : '',
    };
}