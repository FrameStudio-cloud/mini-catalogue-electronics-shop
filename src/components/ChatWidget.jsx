import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { supabase } from '../lib/supabase'
import { getShopId } from '../lib/shop'
import { FaWhatsapp } from 'react-icons/fa'
import { FiMessageCircle, FiX, FiSend } from 'react-icons/fi'

function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [config, setConfig] = useState(null)
  const [faqs, setFaqs] = useState([])
  const [selectedFaq, setSelectedFaq] = useState(null)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([])
  const [catalogue, setCatalogue] = useState([])
  const [visible, setVisible] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 400)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    async function init() {
      const shopId = await getShopId()
      if (!shopId) return

      const [{ data: cfg }, { data: faqData }, { data: catData }] = await Promise.all([
        supabase.from('chat_config').select('*').eq('shop_id', shopId).maybeSingle(),
        supabase.from('chat_faqs').select('*').eq('shop_id', shopId).order('sort_order', { ascending: true }),
        supabase.from('catalogue').select('name, price, category, available').eq('shop_id', shopId).eq('available', true),
      ])

      if (cfg) setConfig(cfg)
      if (faqData) setFaqs(faqData)
      if (catData) setCatalogue(catData)
    }
    init()
  }, [])

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus()
  }, [open])

  function searchCatalogue(query) {
    if (!query.trim() || !catalogue.length) return null
    const lower = query.toLowerCase()
    const match = catalogue.find(
      (item) =>
        item.name.toLowerCase().includes(lower) ||
        item.category.toLowerCase().includes(lower)
    )
    if (!match) return null
    return {
      type: 'catalogue',
      text: `**${match.name}** — ${match.price ? `KSh ${match.price.toLocaleString()}` : 'Contact for price'}${match.available !== false ? '' : ' (Currently unavailable)'}`,
    }
  }

  async function handleSend() {
    const text = input.trim()
    if (!text) return
    setInput('')

    const userMsg = { role: 'user', text }
    setMessages((prev) => [...prev, userMsg])

    const catResult = searchCatalogue(text)
    if (catResult) {
      setMessages((prev) => [...prev, { role: 'bot', text: catResult.text }])
      return
    }

    const shopId = await getShopId()
    if (shopId) {
      await supabase.from('chat_messages').insert({
        shop_id: shopId,
        question: text,
        status: 'unanswered',
      })
    }

    setMessages((prev) => [
      ...prev,
      { role: 'bot', text: "I'm not sure about that. Let me connect you with the shop owner." },
    ])
  }

  function handleFaqClick(faq) {
    if (selectedFaq === faq.id) {
      setSelectedFaq(null)
    } else {
      setSelectedFaq(faq.id)
    }
  }

  const accentColor = config?.widget_color || '#3B82F6'
  const position = config?.position || 'right'
  const isRight = position === 'right'
  const posClasses = isRight ? 'right-4' : 'left-4'

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          className={`fixed z-50 bottom-7 right-25 ${posClasses} flex flex-col items-end`}
        >
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                className={`mb-3 w-80 sm:w-96 bg-white dark:bg-[#16213e] rounded-2xl shadow-2xl border border-white/10 overflow-hidden ${isRight ? '' : 'self-start'}`}
              >
                <div
                  className="px-4 py-3 text-white font-semibold text-sm flex items-center justify-between"
                  style={{ backgroundColor: accentColor }}
                >
                  <span>{config?.welcome_message?.split('.')[0] || 'Chat'}</span>
                  <button onClick={() => { setOpen(false); setSelectedFaq(null) }}>
                    <FiX size={16} />
                  </button>
                </div>

                <div className="p-3 max-h-80 overflow-y-auto space-y-2">
                  {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[80%] px-3 py-2 text-xs rounded-xl ${
                          msg.role === 'user'
                            ? 'text-white'
                            : 'bg-slate-100 dark:bg-[#1a1a2e] text-slate-800 dark:text-slate-200'
                        }`}
                        style={msg.role === 'user' ? { backgroundColor: accentColor } : {}}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))}

                  {messages.length === 0 && (
                    <>
                      {config?.welcome_message && (
                        <p className="text-xs text-slate-600 dark:text-slate-400 text-center py-2">
                          {config.welcome_message}
                        </p>
                      )}

                      {faqs.map((faq) => (
                        <div key={faq.id}>
                          <button
                            onClick={() => handleFaqClick(faq)}
                            className="w-full text-left px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-[#1a1a2e] border border-slate-200 dark:border-white/10 text-xs font-medium text-slate-800 dark:text-slate-200 hover:border-blue-300 dark:hover:border-blue-500/50 transition-all"
                          >
                            {faq.question}
                          </button>
                          <AnimatePresence>
                            {selectedFaq === faq.id && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                              >
                                <p className="px-3 py-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                  {faq.answer}
                                </p>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ))}
                    </>
                  )}
                </div>

                <div className="p-3 border-t border-slate-200 dark:border-white/10 space-y-2">
                  <div className="flex gap-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                      placeholder="Ask about products..."
                      className="flex-1 bg-slate-100 dark:bg-[#1a1a2e] border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500/50"
                    />
                    <button
                      onClick={handleSend}
                      disabled={!input.trim()}
                      className="px-3 py-2 rounded-lg text-white disabled:opacity-50"
                      style={{ backgroundColor: accentColor }}
                    >
                      <FiSend size={14} />
                    </button>
                  </div>

                  {config?.whatsapp_number && (
                    <a
                      href={`https://wa.me/${config.whatsapp_number.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Hi! I have a question.')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 text-xs text-green-600 dark:text-green-400 font-medium py-1.5 rounded-lg bg-green-50 dark:bg-green-500/10 hover:bg-green-100 dark:hover:bg-green-500/20 transition-all"
                    >
                      <FaWhatsapp size={14} />
                      Chat on WhatsApp
                    </a>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            onClick={() => setOpen(!open)}
            animate={open ? { rotate: 45 } : { rotate: 0 }}
            className="w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white"
            style={{ backgroundColor: accentColor }}
          >
            {open ? <FiX size={24} /> : <FiMessageCircle size={24} />}
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default ChatWidget