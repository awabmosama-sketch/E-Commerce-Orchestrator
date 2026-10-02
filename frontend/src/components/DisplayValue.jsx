export default function DisplayValue({ value }) {
  if (value === null || value === undefined) return null
  if (typeof value === 'string' || typeof value === 'number') return value
  if (Array.isArray(value)) {
    return value.map((item, index) => <DisplayValue key={index} value={item} />)
  }
  if (typeof value === 'object' && typeof value.text === 'string') return value.text
  return JSON.stringify(value)
}