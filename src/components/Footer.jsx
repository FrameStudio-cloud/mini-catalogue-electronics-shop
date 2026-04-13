import { FaWhatsapp, FaInstagram, FaFacebook, FaTiktok } from 'react-icons/fa'
import { MdLocationOn, MdAccessTime, MdEmail, MdPhone } from 'react-icons/md'
import shop from '../config/shop'

function Footer() {
  const currentYear = new Date().getFullYear()
  

  const socials = [
    { icon: <FaInstagram size={18} />, href: shop.instagram },
    { icon: <FaFacebook size={18} />, href: shop.facebook },
    { icon: <FaTiktok size={18} />, href: shop.tiktok },
    { icon: <FaWhatsapp size={18} />, href: `https://wa.me/${shop.whatsapp}` },
  ]

  const contactItems = [
    { icon: <MdLocationOn size={18} className="text-accent mt-0.5 flex-shrink-0" />, content: shop.locations },
    { icon: <MdPhone size={18} className="text-accent mt-0.5 flex-shrink-0" />, content: <a href={`https://wa.me/${shop.whatsapp}`} className="transition-colors hover:text-accent">+{shop.whatsapp}</a> },
    { icon: <MdAccessTime size={18} className="text-accent mt-0.5 flex-shrink-0" />, content: shop.hours },
    { icon: <MdEmail size={18} className="text-accent mt-0.5 flex-shrink-0" />, content: <a href={`mailto:${shop.email}`} className="transition-colors hover:text-accent">{shop.email}</a> },
  ]

  const links = [
    { label: 'Home', href: '#home' },
    { label: 'Catalogue', href: '#catalogue' },
    { label: 'About Us', href: '#about' },
    { label: 'Contact', href: '#contact' },
    { label: 'Admin', href: 'admin' }
  ]

  return (
    <footer id="contact" className="text-white bg-primary">
      <div className="max-w-6xl px-4 py-16 mx-auto">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-3">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl font-bold">{shop.name}</span>
              <span className="text-2xl font-light text-accent">{shop.nameAccent}</span>
            </div>
            <p className="mb-6 leading-relaxed text-gray-400">
              {shop.description}
            </p>
            <div className="flex gap-4">
              {socials.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 transition-colors rounded-full bg-opacity-10 bg-accent"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-6 text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-3">
              {links.map((link, index) => (
                <li key={index}>
                  <a href={link.href} className="text-gray-400 transition-colors hover:text-accent">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-6 text-lg font-semibold">Get In Touch</h3>
            <ul className="space-y-4">
              {contactItems.map((item, index) => (
                <li key={index} className="flex items-start gap-3 text-gray-400">
                  {item.icon}
                  <span>{item.content}</span>
                </li>
              ))}
            </ul>
            <a
              href={`https://wa.me/${shop.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 mt-6 font-medium text-white transition-colors bg-green-500 rounded-full hover:bg-green-600"
            >
              <FaWhatsapp size={18} />
              Chat on WhatsApp
            </a>
          </div>

        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white border-opacity-10">
        <div className="flex flex-col items-center justify-between max-w-6xl gap-4 px-4 py-6 mx-auto sm:flex-row">
          <p className="text-sm text-gray-400">
            © {currentYear} {shop.name} {shop.nameAccent}. All rights reserved.
          </p>
          <p className="text-sm text-gray-400">
            Website by
            <a
              href={`https://wa.me/${shop.developerWhatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-1 text-accent hover:underline"
            >
              {shop.developerName}
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
