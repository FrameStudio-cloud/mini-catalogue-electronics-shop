import { motion } from "motion/react";
import shopConfig from "../config/shop";

// Simple SVG icons inline — no extra dependency needed
const InstagramIcon = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
  </svg>
);

const TikTokIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.17 8.17 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z" />
  </svg>
);

// Fake post grid — styled placeholder tiles that look like a blurred feed
const PostGrid = ({ color }) => {
  const shades = [
    "opacity-90",
    "opacity-60",
    "opacity-75",
    "opacity-50",
    "opacity-80",
    "opacity-65",
  ];
  return (
    <div className="grid grid-cols-3 gap-1 mb-5">
      {shades.map((shade, i) => (
        <div
          key={i}
          className={`aspect-square rounded-lg ${shade}`}
          style={{ background: color }}
        />
      ))}
    </div>
  );
};

function SocialFeed() {
  const { instagram, tiktok } = shopConfig.social || {};

  // Don't render section at all if no handles are configured
  if (!instagram && !tiktok) return null;

  const platforms = [
    instagram && {
      key: "instagram",
      label: "Instagram",
      handle: instagram,
      url: `https://instagram.com/${instagram.replace("@", "")}`,
      Icon: InstagramIcon,
      gradient:
        "linear-gradient(135deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%)",
      solidColor: "#dc2743",
      buttonClass:
        "bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 hover:opacity-90",
    },
    tiktok && {
      key: "tiktok",
      label: "TikTok",
      handle: tiktok,
      url: `https://tiktok.com/${tiktok.replace("@", "") ? "@" + tiktok.replace("@", "") : ""}`,
      Icon: TikTokIcon,
      gradient: "linear-gradient(135deg, #010101 0%, #2d2d2d 100%)",
      solidColor: "#ff0050",
      buttonClass: "bg-black hover:bg-gray-900",
    },
  ].filter(Boolean);

  return (
    <section id="socials" className="py-20 bg-primary">
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
            Stay Connected
          </p>
          <h2 className="text-4xl font-bold text-white">Follow Us</h2>
          <p className="max-w-xl mx-auto mt-3 text-gray-500">
            Follow our installations and latest projects.
          </p>
        </motion.div>

        {/* Platform Cards */}
        <div
          className={`grid gap-16 ${platforms.length === 1 ? "max-w-sm mx-auto" : "grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto"}`}
        >
          {platforms.map(
            (
              {
                key,
                label,
                handle,
                url,
                Icon,
                gradient,
                solidColor,
                buttonClass,
              },
              i,
            ) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="overflow-hidden border border-white/10 rounded-2xl"
              >
                {/* Card Header with gradient */}
                <div
                  className="flex items-center gap-3 px-5 py-4"
                  style={{ background: gradient }}
                >
                  <div className="text-white">
                    <Icon />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-white opacity-80">
                      {label}
                    </p>
                    <p className="text-sm font-bold text-white">
                      {handle.startsWith("@") ? handle : `@${handle}`}
                    </p>
                  </div>
                </div>

                {/* Fake post grid */}
                <div className="p-4 bg-gray-50">
                  {/* CTA Button */}
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`block w-full py-2.5 rounded-xl text-sm font-semibold text-white text-center transition-all ${buttonClass}`}
                  >
                    Follow on {label}
                  </a>
                </div>
              </motion.div>
            ),
          )}
        </div>
      </div>
    </section>
  );
}

export default SocialFeed;
