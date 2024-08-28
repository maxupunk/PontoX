export default function minuteInHours(minutes: number) {
    const hour = Math.floor(minutes / 60).toString().padStart(2, '0');
    const minute = Math.abs(Math.floor(minutes % 60)).toString().padStart(2, '0');
    return `${hour}:${minute}`;
}