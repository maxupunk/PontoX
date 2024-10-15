export default function minuteInHours(minutes: number) {
    const isNegative = minutes < 0;
    const absMinutes = Math.abs(minutes);
    const hour = Math.floor(absMinutes / 60).toString().padStart(2, '0');
    const minute = Math.floor(absMinutes % 60).toString().padStart(2, '0');
    return `${isNegative ? '-' : ''}${hour}:${minute}`;
}