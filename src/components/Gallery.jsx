import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import gallery from '../config/gallery'

const categories = ['All', 'CCTV', 'Solar', 'Electrical']

function Gallery() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [selectedImage, setSelectedImage] = useState(null)

  const filtered = activeCategory === 'All'
    ? gallery
    : gallery.filter(item => item.category === activeCategory)

  return (
    <section id="gallery" className="py-20 bg-primary">
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
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Our Work
          </p>
          <h2
            className="text-4xl font-extrabold text-white"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Past Installations
          </h2>
          <p className="max-w-xl mx-auto mt-3 text-slate-400 font-light">
            Real projects done across Nairobi and beyond
          </p>
        </motion.div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all
                ${activeCategory === cat
                  ? 'bg-accent text-primary'
                  : 'bg-surface text-slate-400 hover:text-white border border-white/10'
                }`}
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        <motion.div
          layout
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3"
        >
          <AnimatePresence>
            {filtered.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="relative rounded-xl overflow-hidden group cursor-pointer aspect-square"
                onClick={() => setSelectedImage(item)}
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />

                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="absolute bottom-0 left-0 p-3 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                  <span
                    className="text-xs font-bold text-accent"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {item.category}
                  </span>
                  <p className="text-white text-xs font-semibold mt-0.5">
                    {item.title}
                  </p>
                  <p className="text-slate-300 text-xs">{item.location}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/90 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedImage(null)}
            />
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              <div
                className="relative max-w-3xl w-full rounded-2xl overflow-hidden"
                onClick={e => e.stopPropagation()}
              >
                <img
                  src={selectedImage.image}
                  alt={selectedImage.title}
                  className="w-full max-h-[75vh] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

                {/* Info */}
                <div className="absolute bottom-0 left-0 p-6">
                  <span
                    className="text-xs font-bold text-accent mb-1 block"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {selectedImage.category}
                  </span>
                  <p
                    className="text-white text-lg font-bold"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {selectedImage.title}
                  </p>
                  <p className="text-slate-300 text-sm">{selectedImage.location}</p>
                </div>

                {/* Close */}
                <button
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-4 right-4 w-9 h-9 bg-black/50 hover:bg-black/80 rounded-full flex items-center justify-center text-white transition-colors"
                >
                  ✕
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  )
}

export default Gallery
