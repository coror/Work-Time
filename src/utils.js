export const getPreviousMonths = (count) => {
  const currentDate = new Date()
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]

  const result = []
  for (let i = 0; i < count; i++) {
    const monthIndex = (currentDate.getMonth() - i + 12) % 12 // Handle negative months
    const year =
      currentDate.getFullYear() - (currentDate.getMonth() - i < 0 ? 1 : 0) // Adjust year if rolling back past January
    result.push({ month: months[monthIndex], year })
  }

  return result.reverse() // Reverse to show the latest month first
}
