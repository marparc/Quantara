export function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export function daysAgoStr(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}
