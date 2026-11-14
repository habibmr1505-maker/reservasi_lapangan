export function timeToMinutes(time: string) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}
export function isOverlapping(startA: string, endA: string, startB: string, endB: string) {
  return timeToMinutes(startA) < timeToMinutes(endB) &&
    timeToMinutes(endA) > timeToMinutes(startB);
}
export function calculateCourtCost(start: string, end: string, regular: number, night: number) {
  const startM = timeToMinutes(start);
  const endM = timeToMinutes(end);
  if (endM <= startM) throw new Error("Jam selesai harus setelah jam mulai.");
  let total = 0;
  for (let minute = startM; minute < endM; minute += 1) {
    const hour = Math.floor(minute / 60);
    total += (hour >= 18 || hour < 6 ? night : regular) / 60;
  }
  return Math.round(total);
}
export function makeBookingNumber(id: number, date = new Date()) {
  const ymd = `${date.getFullYear()}${String(date.getMonth()+1).padStart(2,"0")}${String(date.getDate()).padStart(2,"0")}`;
  return `BOOK-${ymd}-${String(id).padStart(4, "0")}`;
}
