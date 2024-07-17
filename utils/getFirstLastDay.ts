export default function getFirstLastDay(date?: Date) {
    if (!date) {
        date = new Date()
    }
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    return { firstDay, lastDay };
}