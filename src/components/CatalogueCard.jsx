import { Badge } from "./Catalogue"
import { motion } from "motion/react"
export function CatalogueCard({ item, onClick}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
      onClick={() => onClick(item)}
      className="bg-surface border border-white/10 rounded-2xl overflow-hidden group cursor-pointer hover:border-accent/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/30"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Top badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <span
            className="bg-primary/80 backdrop-blur text-xs font-semibold text-slate-300 px-2.5 py-1 rounded-full border border-white/10"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {item.category}
          </span>
          {item.badge && <Badge text={item.badge} />}
        </div>

        {/* Type tag */}
        <div className="absolute bottom-3 left-3">
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded-full
              ${item.type === 'service'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                : 'bg-green-500/20 text-green-300 border border-green-500/30'
              }`}
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {item.type === 'service' ? 'Service' : 'Product'}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3
          className="text-white font-bold text-sm mb-1.5 line-clamp-1"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {item.name}
        </h3>
        <p className="text-slate-400 text-xs leading-relaxed line-clamp-2 mb-3">
          {item.description}
        </p>

        {/* Specs preview */}
        {item.specs && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {item.specs.slice(0, 2).map(spec => (
              <span
                key={spec}
                className="text-xs text-slate-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full"
              >
                {spec}
              </span>
            ))}
            {item.specs.length > 2 && (
              <span className="text-xs text-slate-500">+{item.specs.length - 2} more</span>
            )}
          </div>
        )}

        {/* Includes preview */}
        {item.includes && (
          <div className="flex items-center gap-1.5 mb-3 text-xs text-slate-400">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
            {item.includes[0]}
          </div>
        )}

        {/* Price + CTA */}
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/5">
          <span
            className="text-accent font-bold text-sm"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {item.priceLabel}
          </span>
          <span
            className="text-xs text-slate-400 font-medium group-hover:text-accent transition-colors"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            View details →
          </span>
        </div>
      </div>
    </motion.div>
  )
}