import { FaCheck } from "react-icons/fa";
import { GiPadlock } from "react-icons/gi";
import { MdOutlineWbSunny } from "react-icons/md";
const badges = [
  { icon: <FaCheck />, text: "ERC Certified" },
  { icon: "⚡", text: "500+ Installations" },
  { icon: <FaCheck />, text: "Hikvision Partner" },
  { icon: "🛡", text: "1 Year Warranty" },
  { icon: "📞", text: "24/7 Support" },
  { icon: <FaCheck />, text: "KEBS Certified" },
  { icon: <MdOutlineWbSunny />, text: "Solar Specialists" },
  { icon: <FaCheck />, text: "Schneider Dealer" },
  { icon: <GiPadlock />, text: "Fully Insured" },
  { icon: <FaCheck />, text: "Luminous Partner" },
  { icon: "⚡", text: "Same Day Response" },
];

function TrustBar() {
  return (
    <div className="py-5 bg-surface border-y border-white/10 overflow-hidden">
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-track {
          display: flex;
          width: max-content;
          animation: marquee 60s linear infinite;
        }
        .marquee-track:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div className="marquee-track">
        {[...badges, ...badges].map((badge, i) => (
          <div
            key={i}
            className="flex items-center gap-2 px-6 whitespace-nowrap"
          >
            <span className="text-accent text-sm">{badge.icon}</span>
            <span
              className="text-slate-300 text-sm font-medium"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {badge.text}
            </span>
            <span className="text-white/10 ml-6 text-lg">|</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TrustBar;
