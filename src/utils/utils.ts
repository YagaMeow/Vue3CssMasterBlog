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
  tags: { name: string }[]
}

function elasticEase(progress: number) {
  // 设置弹性参数
  const amplitude = 1 // 振幅，控制过冲的幅度
  const period = 1 // 周期，控制弹跳的次数（周期越小，次数越多）
  if (progress === 0 || progress === 1) return progress
  const s = (period / (2 * Math.PI)) * Math.asin(1 / amplitude)
  return (
    amplitude * Math.pow(2, -10 * progress) * Math.sin(((progress - s) * (2 * Math.PI)) / period) +
    1
  )
}

function elasticEase2(progress: number) {
  // 设置弹性参数
  const amplitude = 1.1 // 振幅，控制过冲的幅度
  const period = 1 // 周期，控制弹跳的次数（周期越小，次数越多）
  if (progress === 0 || progress === 1) return progress
  const s = (period / (2 * Math.PI)) * Math.asin(1 / amplitude)
  return (
    amplitude * Math.pow(2, -10 * progress) * Math.sin(((progress - s) * (2 * Math.PI)) / period) +
    1
  )
}
export { range, formatDate, type Article, elasticEase, elasticEase2 }
