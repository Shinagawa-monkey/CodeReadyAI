const DATE_TIME_FORMATTER = new Intl.DateTimeFormat(undefined, { // undefined because I want to use the default locale aka time zone of the user
  dateStyle: "medium",
  timeStyle: "short",
})

export function formatDateTime(date: Date) {
  return DATE_TIME_FORMATTER.format(date)
}