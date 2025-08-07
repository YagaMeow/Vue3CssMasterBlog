function range(a: number, b: number) {
  return Math.random() * (b - a) + a
}
function formatDate(date: string): string {
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' }
  return new Date(date).toLocaleDateString(undefined, options)
}
interface Article {
  title: String
  uri: String
  id: number
  created_at: String
}
export { range, formatDate, type Article }
