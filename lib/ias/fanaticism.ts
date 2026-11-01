/** D2R 3.3.93847 skills.txt: dm34, Param3=10, Param4=40. */
export function fanaticismSIAS(level: number): number {
  if (!Number.isInteger(level) || level < 1 || level > 60) throw new RangeError("Fanaticism level must be 1–60");
  const t = Math.floor((110 * level) / (level + 6));
  return Math.min(Math.floor((t * 30) / 100) + 10, 40);
}
