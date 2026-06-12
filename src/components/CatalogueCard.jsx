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
      <div className="relative h-56 overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        {/* Category badge */}
        <div className="absolute top-3 left-3">
          <span
            className="bg-primary/80 backdrop-blur text-xs font-semibold text-slate-300 px-2.5 py-1 rounded-full border border-white/10"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {item.category}
          </span>
        </div>

        {item.badge && (
          <div className="absolute top-3 right-3">
            <Badge text={item.badge} />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3
          className="text-white font-semibold text-sm mb-1 line-clamp-1"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {item.name}
        </h3>
        {item.variants?.colors && (
          <div className="flex flex-wrap gap-1 mb-1.5">
            {item.variants.colors.map(c => (
              <span key={c} className="text-[10px] text-slate-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">{c}</span>
            ))}
          </div>
        )}
        {item.variants?.sizes && (
          <div className="flex flex-wrap gap-1 mb-1.5">
            {item.variants.sizes.map(s => (
              <span key={s} className="text-[10px] text-slate-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">{s}</span>
            ))}
          </div>
        )}
        {item.variants?.storage && (
          <div className="flex flex-wrap gap-1 mb-1.5">
            {item.variants.storage.map(s => (
              <span key={s} className="text-[10px] text-blue-300 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full">{s}</span>
            ))}
          </div>
        )}

        {/* Specs / includes chips */}
        {((item.specs || item.includes) && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {(item.specs || item.includes).slice(0, 3).map((chip, i) => (
              <span
                key={i}
                className="text-[10px] text-slate-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full"
              >
                {chip}
              </span>
            ))}
          </div>
        ))}

        {/* Price + CTA */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5">
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