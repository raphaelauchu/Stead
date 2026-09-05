export function xpThreshold(level: number) {
  return Math.round(20 * Math.pow(level, 1.6));
}

export function levelFromXp(totalXp: number) {
  let level = 1;
  while (xpThreshold(level + 1) <= totalXp) level++;
  return level;
}

export function levelProgress(totalXp: number) {
  const level = levelFromXp(totalXp);
  const floor = xpThreshold(level);
  const ceil = xpThreshold(level + 1);
  const percent = ceil > floor ? ((totalXp - floor) / (ceil - floor)) * 100 : 100;
  return { level, xpIntoLevel: totalXp - floor, xpForNext: ceil - floor, percent };
}
