const shopConfig = {
  name: "PowerSec",
  tagline: "Security. Power. Reliability.",
  description:
    "Nairobi's trusted provider of CCTV installation, solar power systems, and electrical solutions for homes and businesses.",
  whatsapp: "254700000000", // replace with client number
  email: "info@powersec.co.ke",
  locations: "Tom Mboya Street, Nairobi CBD, Kenya",
  hours: "Mon - Sat: 9am - 7pm",



  developerName: "Framestudio",
  developerWhatsapp: "254793302518",

  // Theme colors — these map to CSS variables in index.css
  theme: {
    primary: "#0f172a", // deep navy
    accent: "#f59e0b", // amber
    accent2: "#fbbf24",
    surface: "#1e293b",
    text: "#f8fafc",
    muted: "#94a3b8",
  },

  // Navigation links
  nav: [
    { label: "Home", href: "#home" },
    { label: "Products", href: "#products" },
    { label: "Socials", href: "#socials" },
    { label: "Contact", href: "#contact" },
  ],

  // Hero section
  hero: {
    headline: "Secure Your Home.",
    headlineAccent: "Power Your Future.",
    subheadline:
      "Professional CCTV installation, solar power systems, and electrical solutions across Nairobi and beyond.",
    cta: "Get a Free Quote",
    ctaSecondary: "View Products",
  },

  // Services offered
  services: [
    {
      id: "cctv",
      icon: "📷",
      title: "CCTV Installation",
      description:
        "Full security camera setup for homes, offices, and warehouses. Remote monitoring included.",
      features: [
        "HD & 4K cameras available",
        "Night vision coverage",
        "Remote phone monitoring",
        "Professional cabling",
        "1 year warranty",
      ],
    },
    {
      id: "solar",
      icon: "☀️",
      title: "Solar Power Systems",
      description:
        "Cut your electricity bills with a custom solar installation tailored to your energy needs.",
      features: [
        "Home & commercial systems",
        "Battery backup included",
        "KEBS certified panels",
        "Load analysis & design",
        "2 year maintenance support",
      ],
    },
    {
      id: "electrical",
      icon: "⚡",
      title: "Electrical Solutions",
      description:
        "Full wiring, distribution boards, and electrical repairs done to the highest safety standards.",
      features: [
        "New installations & rewiring",
        "Distribution board upgrades",
        "Safety inspections",
        "Emergency repairs",
        "ERC compliant work",
      ],
    },
  ],

  // Why choose us stats
  stats: [
    { value: "500+", label: "Installations Done" },
    { value: "8+", label: "Years Experience" },
    { value: "24/7", label: "Support Available" },
    { value: "100%", label: "Satisfaction Rate" },
  ],

  // Trust points
  whyUs: [
    {
      title: "Licensed & Certified",
      description: "All our technicians are ERC certified and fully insured.",
    },
    {
      title: "Nairobi Based",
      description: "Fast response times across Nairobi, Kiambu, and Machakos.",
    },
    {
      title: "Quality Brands",
      description:
        "We stock and install Hikvision, Luminous, Schneider, and more.",
    },
    {
      title: "Warranty on All Work",
      description:
        "Every installation comes with a minimum 1 year workmanship warranty.",
    },
  ],

  // Location
  location: {
    address: "Tom Mboya Street, Nairobi CBD, Kenya",
    phone: "+254 700 000 000",
    mapUrl: "", // paste Google Maps embed src here
    directionsUrl: "",
    hours: [
      { days: "Mon – Fri", time: "8am – 6pm" },
      { days: "Saturday", time: "9am – 4pm" },
      { days: "Sunday", time: "Closed" },
    ],
  },

  // Social
  social: {
    instagram: "@powersecke",
    tiktok: "@powersecke",
  },
};

export default shopConfig;
