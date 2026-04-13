import { FiSearch, FiX } from 'react-icons/fi'

function SearchBar({ value, onChange, onClear }) {
  return (
    <div className="relative max-w-md mx-auto mb-8">

      {/* Search Icon */}
      <FiSearch
        size={18}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
      />

      {/* Input */}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search products..."
        className="w-full bg-white border border-gray-200 rounded-full py-3 pl-11 pr-11 text-sm text-primary placeholder-gray-400 outline-none focus:border-accent transition-colors"
      />

      {/* Clear button — only shows when typing */}
      {value && (
        <button
          onClick={onClear}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors"
        >
          <FiX size={18} />
        </button>
      )}

    </div>
  )
}

export default SearchBar