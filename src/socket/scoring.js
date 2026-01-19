export const calculateScore = ({ startTime, endTime, timeLimit }) => {
  // If no endTime provided, default to now (though we should always have it now)
  const end = endTime || Date.now();
  const elapsed = (end - startTime) / 1000;
  const remaining = Math.max(timeLimit - elapsed, 0);

  const BASE_POINTS = 1000;
  const score = Math.round(BASE_POINTS * (remaining / timeLimit));
  
  // Ensure minimum 10 points if correct
  return Math.max(score, 10);
};
