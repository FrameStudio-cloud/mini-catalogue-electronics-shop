import shopConfig from "../config/shop";
import { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Badge } from "./Catalogue";


export  function CatalogueModal({ item, onClose }) {
  const { whatsapp } = shopConfig;

  useEffect(() => {
    if (!item) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [item]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  if (!item) return null;

  const whatsappUrl = `https://wa.me/${whatsapp}?text=Hi%20PowerSec%2C%20I%20am%20interested%20in%20*${encodeURIComponent(item.name)}*%20(${encodeURIComponent(item.priceLabel)}).%20Please%20advise.`;

  return (
    <AnimatePresence>
      {item && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-surface w-full sm:max-w-xl rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl border border-white/10"
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Image */}
              <div className="relative h-56 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute  bg-gradient-to-t from-surface via-surface/10 to-transparent" />

                {/* Badges */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="bg-primary/80 backdrop-blur text-xs font-semibold text-slate-300 px-2.5 py-1 rounded-full border border-white/10"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {item.category}
                    </span>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full
                        ${
                          item.type === "service"
                            ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                            : "bg-green-500/20 text-green-300 border border-green-500/30"
                        }`}
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {item.type === "service" ? "Service" : "Product"}
                    </span>
                  </div>
                  {item.badge && <Badge text={item.badge} />}
                </div>

                {/* Close */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 w-8 h-8 bg-black/50 hover:bg-black/80 rounded-full flex items-center justify-center text-white text-sm transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Content */}
              <div className="p-5 max-h-[60vh] overflow-y-auto">
                {/* Name + Price */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h2
                    className="text-white font-bold text-lg leading-snug"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {item.name}
                  </h2>
                  <span
                    className="text-accent  text-lg whitespace-nowrap"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {item.priceLabel}
                  </span>
                </div>

                {/* Description */}
                <p className="text-slate-400 text-sm leading-relaxed mb-5">
                  {item.description}
                </p>

                {/* Specs */}
                {item.specs && (
                  <div className="mb-5">
                    <p
                      className="text-xs font-semibold tracking-widest uppercase text-slate-500 mb-3"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      Specifications
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {item.specs.map((spec) => (
                        <div
                          key={spec}
                          className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2"
                        >
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#f59e0b"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M20 6L9 17l-5-5" />
                          </svg>
                          <span className="text-xs text-slate-300">{spec}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Includes */}
                {item.includes && (
                  <div className="mb-5">
                    <p
                      className="text-xs font-semibold tracking-widest uppercase text-slate-500 mb-3"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      What's Included
                    </p>
                    <div className="flex flex-col gap-2">
                      {item.includes.map((inc, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className="w-5 h-5 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <svg
                              width="10"
                              height="10"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="#f59e0b"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M20 6L9 17l-5-5" />
                            </svg>
                          </div>
                          <span className="text-sm text-slate-300">{inc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* CTA */}
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3.5 bg-accent hover:bg-accent2 text-primary font-bold text-sm rounded-xl transition-all hover:scale-[1.02] active:scale-95"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  {item.type === "service"
                    ? "Book This Service"
                    : "Enquire on WhatsApp"}
                </a>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
