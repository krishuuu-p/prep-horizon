export function formatDateTime(dateInput) {
    const d = new Date(dateInput);
    const date = d.toISOString().split("T")[0];
    const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    return { date, time };
}