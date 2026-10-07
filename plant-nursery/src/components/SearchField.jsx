import Icon from './Icon'
export default function SearchField({ value, onChange, placeholder }) {
  return (
    <label className="search-field">
      <Icon name="search" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
      />
    </label>
  )
}
