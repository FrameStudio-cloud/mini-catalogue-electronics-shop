import { useState, useEffect } from "react";
import { fetchBanners } from "../api/keelClient";

const typeStyles = {
  sale: "bg-gradient-to-r from-red-600 to-orange-500 text-white",
  info: "bg-gradient-to-r from-blue-600 to-cyan-500 text-white",
  alert: "bg-gradient-to-r from-yellow-500 to-amber-400 text-black",
};

export default function AnnouncementBar() {
  const [banners, setBanners] = useState([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const ctrl = new AbortController();
    fetchBanners({ signal: ctrl.signal })
      .then(rows => {
        if (!rows) return;
        const items = rows.filter(b => ["sale", "info", "alert"].includes(b.type));
        if (items.length > 0) setBanners(items);
      })
      .catch(() => {
        // No bar. Reported as the `banners` health signal by the client.
      });
    return () => ctrl.abort();
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  if (banners.length === 0) return null;

  const b = banners[current];

  return (
    <div className={`${typeStyles[b.type] || "bg-gray-800 text-white"} text-sm text-center py-2 px-4 relative`}>
      <span className="font-medium">{b.title}</span>
      {b.message && <span className="ml-2 opacity-80">{b.message}</span>}
      {b.subtitle && <span className="ml-2 opacity-60 hidden sm:inline">{b.subtitle}</span>}
      {banners.length > 1 && (
        <span className="inline-block ml-3 text-xs opacity-60">
          {current + 1}/{banners.length}
        </span>
      )}
    </div>
  );
}
