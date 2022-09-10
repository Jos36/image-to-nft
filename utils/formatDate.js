export const formatDate = (d) => {
  const date = new Date(d);
  const startDate = new Date(date.getFullYear(), 0, 1);
  var days = Math.floor((date - startDate) / (24 * 60 * 60 * 1000));

  var weekNumber = Math.ceil(days / 7);
  return `  ${date.toLocaleDateString("en-US")} (Week ${weekNumber})`;
};

export const isCurrentWeek = (d) => {
  const date = new Date(d);
  const startDate = new Date(date.getFullYear(), 0, 1);
  var dayss = Math.floor((date - startDate) / (24 * 60 * 60 * 1000));

  var weekNumberNow = Math.ceil(dayss / 7);

  const currentDate = new Date();
  var days = Math.floor((currentDate - startDate) / (24 * 60 * 60 * 1000));

  var weekNumberCreatedAt = Math.ceil(days / 7);
  return weekNumberCreatedAt === weekNumberNow;
};
