import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import catalogue from '../config/catalogue'
import { CatalogueModal } from './CatalogueModal'
import { CatalogueCard } from './CatalogueCard'
import SearchBar from './SearchBar'

// ─── Dynamically build filter options from data ───
const types = ['All', ...new Set(catalogue.map(i => i.type === 'product' ? 'Products' : 'Services'))]
const allCategories = ['All', ...new Set(catalogue.map(i => i.category))]

// ─── Badge component ───
export function Badge({ text }) {
  if (!text) return null
  return (
    <span
      className="bg-accent text-primary text-xs font-bold px-2.5 py-0.5 rounded-full"
      style={{ fontFamily: 'var(--font-display)' }}
    >
      {text}
    </span>
  )
}

// ─── Dropdown component ───
function Dropdown({ label, options, value, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handleClick = (e) => { if (!ref.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all
          ${value !== 'All'
            ? 'bg-accent text-primary border-accent'
            : 'bg-surface text-slate-300 border-white/10 hover:border-accent/40'
          }`}
        style={{ fontFamily: 'var(--font-display)' }}
      >
        {label}: {value}
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          className={`transition-transform ${open ? 'rotate-180' : ''}`}
        >
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-2 left-0 bg-surface border border-white/10 rounded-xl overflow-hidden shadow-xl z-20 min-w-[160px]"
          >
            {options.map(opt => (
              <button
                key={opt}
                onClick={() => { onChange(opt); setOpen(false) }}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors
                  ${value === opt
                    ? 'text-accent font-semibold bg-accent/10'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {opt}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}




// ─── Main Catalogue Section ───
function Catalogue() {
  const [typeFilter, setTypeFilter] = useState('All')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [selectedItem, setSelectedItem] = useState(null)
  const [searchQuery, setSearchQuery] = useState("");


  // Dynamic categories based on selected type
  const availableCategories = ['All', ...new Set(
    catalogue
      .filter(i => typeFilter === 'All' || (typeFilter === 'Products' ? i.type === 'product' : i.type === 'service'))
      .map(i => i.category)
  )]

  const filtered = catalogue.filter((item) => {
    const matchesType =
      typeFilter === "All" ||
      (typeFilter === "Products"
        ? item.type === "product"
        : item.type === "service");
    const matchesCategory =
      categoryFilter === "All" || item.category === categoryFilter;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesCategory && matchesSearch;
  });

  const handleTypeChange = (val) => {
    setTypeFilter(val)
    setCategoryFilter('All') // reset category when type changes
  }

  return (
    <section id="products" className="py-20 bg-primary">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <p
            className="mb-2 text-xs font-semibold tracking-widest uppercase text-accent"
            style={{ fontFamily: "var(--font-display)" }}
          >
            What We Offer
          </p>
          <h2
            className="text-4xl font-extrabold text-white"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Products & Services
          </h2>
          <p className="max-w-xl mx-auto mt-3 text-slate-400 font-light">
            Browse our full range — from individual equipment to complete
            installation packages
          </p>
        </motion.div>
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          onClear={() => setSearchQuery("")}
        />

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <Dropdown
            label="Type"
            options={types}
            value={typeFilter}
            onChange={handleTypeChange}
          />
          <Dropdown
            label="Category"
            options={availableCategories}
            value={categoryFilter}
            onChange={setCategoryFilter}
          />

          {/* Active filter count */}
          {(typeFilter !== "All" || categoryFilter !== "All") && (
            <button
              onClick={() => {
                setTypeFilter("All");
                setCategoryFilter("All");
              }}
              className="text-xs text-slate-400 hover:text-white transition-colors underline underline-offset-2"
            >
              Clear filters
            </button>
          )}

          <span className="ml-auto text-xs text-slate-500">
            {filtered.length} {filtered.length === 1 ? "result" : "results"}
          </span>
        </div>

        {/* Grid */}
        <motion.div
          layout
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
        >
          <AnimatePresence>
            {filtered.map((item) => (
              <CatalogueCard
                key={item.id}
                item={item}
                onClick={setSelectedItem}
              />
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-4xl mb-4">🔍</p>
            <p className="text-white font-semibold mb-2">No results found</p>
            <p className="text-slate-400 text-sm mb-6">
              Try a different filter combination
            </p>
            <button
              onClick={() => {
                setTypeFilter("All");
                setCategoryFilter("All");
              }}
              className="px-6 py-2 bg-accent text-primary text-sm font-bold rounded-full"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      <CatalogueModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
      />
    </section>
  );
}

export default Catalogue
