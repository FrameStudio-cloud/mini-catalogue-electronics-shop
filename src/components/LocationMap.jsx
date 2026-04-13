import { motion } from "motion/react";
import shopConfig from "../config/shop";

function LocationMap() {
  const { location } = shopConfig;

  if (!location?.mapUrl) return null;

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-6xl px-4 mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <p className="mb-2 text-sm font-medium tracking-widest uppercase text-accent">
            Find Us
          </p>
          <h2 className="text-4xl font-bold text-primary">Our Location</h2>
          <p className="max-w-xl mx-auto mt-3 text-gray-500">
            Come visit us in store
          </p>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="overflow-hidden bg-white border border-gray-100 shadow-sm rounded-2xl"
        >
          <div className="grid grid-cols-1 md:grid-cols-3">
            {/* Info Panel */}
            <div className="flex flex-col justify-between p-8 md:col-span-1">
              <div>
                {/* Address */}
                <div className="mb-6">
                  <p className="mb-1 text-xs font-semibold tracking-widest uppercase text-accent">
                    Address
                  </p>
                  <p className="text-sm leading-relaxed text-gray-600">
                    {location.address}
                  </p>
                </div>

                {/* Hours */}
                {location.hours && (
                  <div className="mb-6">
                    <p className="mb-2 text-xs font-semibold tracking-widest uppercase text-accent">
                      Opening Hours
                    </p>
                    <div className="space-y-1">
                      {location.hours.map((item, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span className="text-gray-500">{item.days}</span>
                          <span className="font-medium text-primary">
                            {item.time}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Phone */}
                {location.phone && (
                  <div className="mb-6">
                    <p className="mb-1 text-xs font-semibold tracking-widest uppercase text-accent">
                      Phone
                    </p>
                    <a
                      href={`tel:${location.phone}`}
                      className="text-sm font-medium transition-colors text-primary hover:text-accent"
                    >
                      {location.phone}
                    </a>
                  </div>
                )}
              </div>

              {/* Directions Button */}
              <a
                href={
                  location.directionsUrl ||
                  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.address)}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3 text-sm font-semibold text-white transition-all rounded-xl bg-primary hover:bg-accent"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polygon points="3 11 22 2 13 21 11 13 3 11" />
                </svg>
                Get Directions
              </a>
            </div>

            {/* Map */}
            <div className="md:col-span-2 h-72 md:h-auto min-h-64">
              <iframe
                src={location.mapUrl}
                width="100%"
                height="100%"
                style={{ border: 0, display: "block", minHeight: "300px" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Store location"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default LocationMap;
