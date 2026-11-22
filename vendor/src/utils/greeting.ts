/**
 * Helper to determine time-based greeting according to user's local time:
 * - 5:00 AM – 11:59 AM: Good Morning
 * - 12:00 PM – 4:59 PM: Good Afternoon
 * - 5:00 PM – 8:59 PM: Good Evening
 * - 9:00 PM – 4:59 AM: Good Night
 */
export const getTimeBasedGreeting = (date: Date = new Date()): string => {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const totalMinutes = hours * 60 + minutes;

  // 5:00 AM – 11:59 AM (300 to 719 minutes)
  if (totalMinutes >= 5 * 60 && totalMinutes < 12 * 60) {
    return "Good Morning";
  }
  // 12:00 PM – 4:59 PM (720 to 1019 minutes)
  if (totalMinutes >= 12 * 60 && totalMinutes < 17 * 60) {
    return "Good Afternoon";
  }
  // 5:00 PM – 8:59 PM (1020 to 1259 minutes)
  if (totalMinutes >= 17 * 60 && totalMinutes < 21 * 60) {
    return "Good Evening";
  }
  // 9:00 PM – 4:59 AM (1260 to 1439 minutes OR 0 to 299 minutes)
  return "Good Night";
};

export default getTimeBasedGreeting;
