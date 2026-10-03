import { useState, useEffect, useRef, useCallback } from 'react'
import { AnimatePresence } from 'motion/react'
import { supabase } from '../lib/supabase'
import { getShopId } from '../lib/shop'
import { FaWhatsapp } from 'react-icons/fa'
import {
  FiMessageCircle, FiX, FiSend, FiThumbsUp, FiThumbsDown, FiChevronRight,
} from 'react-icons/fi'
import catalogueFallback from '../config/catalogue'

function levenshtein(a, b) {
  const m = a.length, n = b.length
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0))
  for (let i = 0; i <= m; i++) dp[i][0] = i
  for (let j = 0; j <= n; j++) dp[0][j] = j
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
  return dp[m][n]
}

function normalize(s) {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim()
}

function extractKeywords(query) {
  const stopWords = new Set([
    'a', 'an', 'the', 'is', 'it', 'of', 'to', 'for', 'and', 'or', 'in',
    'i', 'me', 'my', 'do', 'does', 'have', 'has', 'how', 'what', 'where',
    'when', 'can', 'you', 'your', 'show', 'tell', 'price', 'cost', 'much',
    'need', 'want', 'get', 'buy', 'looking', 'some', 'any', 'all', 'with',
    'about', 'are', 'not', 'but', 'from', 'at', 'by', 'on', 'up', 'down',
  ])
  return normalize(query).split(/\s+/).filter(w => w.length > 1 && !stopWords.has(w))
}

function scoreProduct(item, query, keywords) {
  const name = normalize(item.name)
  const cat = normalize(item.category || '')
  const desc = normalize(item.description || '')
  const lower = normalize(query)
  let score = 0

  if (name === lower) score += 100
  else if (name.includes(lower)) score += 50
  else if (cat.includes(lower)) score += 30
  else if (desc.includes(lower)) score += 20

  keywords.forEach(kw => {
    if (name.includes(kw)) score += 15
    if (cat.includes(kw)) score += 10
    if (desc.includes(kw)) score += 5
    const dist = Math.min(
      levenshtein(kw, name.slice(0, Math.max(kw.length, name.length))),
    )
    if (dist <= 2) score += 8 - dist * 3
  })

  return score
}

function ProductCard({ item, compact }) {
  if (compact) {
    return (
      <div className="flex items-center gap-2 bg-slate-50 dark:bg-[#1a1a2e] rounded-lg p-2 border border-slate-200 dark:border-white/10">
        {item.image && (
          <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
        )}
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-slate-900 dark:text-white truncate">{item.name}</p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">{item.priceLabel || `KSh ${item.price?.toLocaleString()}`}</p>
        </div>
        {item.badge && (
          <span className="text-[9px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-500/10 px-1.5 py-0.5 rounded-full flex-shrink-0">
            {item.badge}
          </span>
        )}
      </div>
    )
  }

  return (
    <div className="bg-slate-50 dark:bg-[#1a1a2e] rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden">
      {item.image && (
        <img src={item.image} alt={item.name} className="w-full h-28 object-cover" />
      )}
      <div className="p-2.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-900 dark:text-white">{item.name}</p>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">{item.category}</span>
          </div>
          {item.badge && (
            <span className="text-[9px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-500/10 px-1.5 py-0.5 rounded-full flex-shrink-0 whitespace-nowrap">
              {item.badge}
            </span>
          )}
        </div>
        <p className="text-xs font-bold text-blue-600 dark:text-blue-400 mt-1">
          {item.priceLabel || `KSh ${item.price?.toLocaleString()}`}
        </p>
        {item.description && (
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{item.description}</p>
        )}
        {item.specs?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {item.specs.slice(0, 3).map((s, i) => (
              <span key={i} className="text-[9px] text-slate-400 bg-white/5 border border-white/10 px-1.5 py-0.5 rounded-full">
                {s}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function TypingIndicator({ color }) {
  return (
    <div className="flex justify-start">
      <div className="bg-slate-100 dark:bg-[#1a1a2e] rounded-xl px-4 py-3 flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  )
}

function SuggestedChip({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-slate-200 dark:border-white/10 text-[10px] font-medium text-slate-600 dark:text-slate-400 hover:border-blue-300 dark:hover:border-blue-500/50 hover:text-blue-600 dark:hover:text-blue-400 transition-all bg-white dark:bg-[#1a1a2e]"
    >
      {label}
      <FiChevronRight size={10} />
    </button>
  )
}

const STORAGE_KEY = 'keel-chat-history'
const RATE_LIMIT_MS = 30000

function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [config, setConfig] = useState(null)
  const [faqs, setFaqs] = useState([])
  const [catalogue, setCatalogue] = useState([])
  const [storeInfo, setStoreInfo] = useState(null)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([])
  const [visible, setVisible] = useState(false)
  const [typing, setTyping] = useState(false)
  const [feedback, setFeedback] = useState({})
  const [context, setContext] = useState(null)
  const [expandedFaq, setExpandedFaq] = useState(null)
  const [unreadReply, setUnreadReply] = useState(false)
  const inputRef = useRef(null)
  const chatEndRef = useRef(null)
  const lastUnansweredRef = useRef(0)
  const shopIdRef = useRef(null)

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 400)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    async function init() {
      const shopId = await getShopId()
      if (!shopId) return
      shopIdRef.current = shopId

      const [{ data: cfg }, { data: faqData }, { data: catData }, { data: store }] = await Promise.all([
        supabase.from('chat_config').select('*').eq('shop_id', shopId).maybeSingle(),
        supabase.from('chat_faqs').select('*').eq('shop_id', shopId).order('sort_order', { ascending: true }),
        supabase.from('catalogue').select('*').eq('shop_id', shopId).eq('available', true),
        supabase.from('store_settings').select('store_name, store_address, store_phone').eq('shop_id', shopId).maybeSingle(),
      ])

      if (cfg) setConfig(cfg)
      if (faqData) setFaqs(faqData)
      if (catData) setCatalogue(catData.length > 0 ? catData : catalogueFallback)
      else setCatalogue(catalogueFallback)
      if (store) setStoreInfo(store)

      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          setMessages(parsed)

          const pendingIds = parsed
            .filter(m => m.role === 'bot' && m.fallback && m.msgId)
            .map(m => m.msgId)

          if (pendingIds.length > 0) {
            const { data: replies } = await supabase
              .from('chat_messages')
              .select('id, answer')
              .in('id', pendingIds)
              .not('answer', 'is', null)

            if (replies?.length > 0) {
              const answerMap = new Map(replies.map(r => [r.id, r.answer]))
              setMessages(prev => prev.map(m => {
                if (m.role === 'bot' && m.fallback && m.msgId && answerMap.has(m.msgId)) {
                  return { ...m, adminReply: answerMap.get(m.msgId) }
                }
                return m
              }))
              setUnreadReply(true)
            }
          }
        } catch { /* ignore corrupt storage */ }
      }
    }
    init()
  }, [])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  useEffect(() => {
    if (open && inputRef.current) setTimeout(() => inputRef.current.focus(), 100)
  }, [open])

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
    }
  }, [messages])

  const botReply = useCallback(async (text, rich) => {
    setTyping(true)
    await new Promise(r => setTimeout(r, 600 + Math.random() * 400))
    setTyping(false)
    setMessages(prev => [...prev, { role: 'bot', text, ...rich }])
  }, [])

  function findBestProducts(query) {
    const keywords = extractKeywords(query)
    if (!keywords.length && !normalize(query)) return []

    const scored = catalogue.map(item => ({
      item,
      score: scoreProduct(item, query, keywords),
    }))
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score)

    return scored.slice(0, 5).map(s => s.item)
  }

  function getCategoryMatches(query) {
    const lower = normalize(query)
    const categories = [...new Set(catalogue.map(c => c.category))]
    const matched = categories.filter(c => normalize(c).includes(lower) || lower.includes(normalize(c)))
    if (!matched.length) return null
    const items = catalogue.filter(c => matched.includes(c.category))
    return { categories: matched, items }
  }

  function getSuggestedChips() {
    const chips = []
    const cats = [...new Set(catalogue.map(c => c.category))]
    cats.forEach(c => chips.push({ label: `View ${c}`, action: `show ${c}` }))
    if (config?.whatsapp_number) chips.push({ label: 'Contact us', action: 'contact' })
    chips.push({ label: 'View all products', action: 'show all' })
    return chips.slice(0, 4)
  }

  async function handleSend(text) {
    const q = text || input.trim()
    if (!q) return
    setInput('')
    setExpandedFaq(null)

    const userMsg = { role: 'user', text: q }
    setMessages(prev => [...prev, userMsg])

    handleIntent(q)
  }

  async function handleIntent(q) {
    const lower = normalize(q)

    const locationMatch = /(where|located|location|address|direction|find|come|visit|near)/i.test(lower)
    if (locationMatch && storeInfo?.store_address) {
      await botReply(`You can find us at **${storeInfo.store_address}**.\n\nNeed directions? Contact us on WhatsApp and we'll guide you!`)
      return
    }

    const contactMatch = /(contact|call|phone|reach|whatsapp|talk|speak)/i.test(lower)
    if (contactMatch) {
      const wa = config?.whatsapp_number
      const phone = storeInfo?.store_phone
      if (wa) {
        await botReply(`You can reach us on **WhatsApp** at +${wa}. Tap the button below to chat!`)
      } else if (phone) {
        await botReply(`You can call us at **${phone}**.`)
      } else {
        await botReply("Contact us through our social media channels and we'll get back to you!")
      }
      return
    }

    const hoursMatch = /(open|close|hour|time|when|today|now|available)/i.test(lower)
    if (hoursMatch) {
      const hours = catalogue.length > 0 ? 'We\'re open **Mon–Fri 8am–6pm**, **Sat 9am–4pm**. Closed Sundays.' : 'Contact us for our business hours.'
      await botReply(hours)
      return
    }

    const catResult = getCategoryMatches(q)
    if (catResult && (lower.includes('show') || lower.includes('view') || lower.includes('see') || lower.includes('category') || catResult.items.length > 2)) {
      const names = catResult.items.map(i => `• ${i.name} — ${i.priceLabel || `KSh ${i.price?.toLocaleString()}`}`).join('\n')
      await botReply(`Here are our **${catResult.categories.join(', ')}** products:\n\n${names}`, {
        products: catResult.items.slice(0, 3),
      })
      return
    }

    const matches = findBestProducts(q)
    if (matches.length > 0) {
      setContext({ type: 'product', ids: matches.map(m => m.id) })

      if (matches.length === 1) {
        const item = matches[0]
        await botReply(
          `Here's what I found for **${item.name}**:`,
          { products: [item] }
        )
      } else {
        const names = matches.map((m, i) => `${i + 1}. ${m.name} — ${m.priceLabel || `KSh ${m.price?.toLocaleString()}`}`).join('\n')
        await botReply(`I found a few matches:\n\n${names}\n\nWhich one interests you?`, {
          products: matches,
        })
      }
      return
    }

    const faqMatch = faqs.find(f =>
      normalize(f.question).includes(lower) ||
      lower.includes(normalize(f.question)) ||
      extractKeywords(q).some(kw => normalize(f.question).includes(kw))
    )
    if (faqMatch) {
      await botReply(faqMatch.answer)
      return
    }

    const now = Date.now()
    if (now - lastUnansweredRef.current < RATE_LIMIT_MS) {
      await botReply("Thanks for your question! We've received it and will get back to you shortly.")
      return
    }
    lastUnansweredRef.current = now

    let msgId = null
    if (shopIdRef.current) {
      const { data } = await supabase.from('chat_messages').insert({
        shop_id: shopIdRef.current,
        question: q,
        status: 'unanswered',
      }).select('id').maybeSingle()
      if (data) msgId = data.id
    }

    const popular = catalogue.filter(c => c.badge).slice(0, 3)
    if (popular.length > 0) {
      await botReply("I couldn't find exactly what you're looking for. Here are some popular items:", {
        products: popular,
        fallback: true,
        msgId,
      })
    } else {
      await botReply("I'm not sure about that. Feel free to browse our products or contact us on WhatsApp for help!", {
        fallback: true,
        msgId,
      })
    }
  }

  function handleFaqClick(faq) {
    if (expandedFaq === faq.id) {
      setExpandedFaq(null)
    } else {
      setExpandedFaq(faq.id)
    }
  }

  function handleFeedback(msgIndex, value) {
    setFeedback(prev => ({ ...prev, [msgIndex]: value }))
    const msg = messages[msgIndex]
    if (msg?.msgId) {
      supabase.from('chat_messages').update({ feedback: value }).eq('id', msg.msgId).then()
    }
  }

  function handleChip(action) {
    handleSend(action)
  }

  function handleProductTap(item) {
    setContext({ type: 'product_detail', product: item })
    const info = [
      `**${item.name}**`,
      item.description ? `\n${item.description}` : '',
      `\n**Price**: ${item.priceLabel || `KSh ${item.price?.toLocaleString()}`}`,
      item.badge ? `\n🏅 ${item.badge}` : '',
      item.specs?.length ? `\n\n**Specs:** ${item.specs.join(' · ')}` : '',
      item.includes?.length ? `\n\n**Includes:**\n${item.includes.map(i => `• ${i}`).join('\n')}` : '',
      '\n\nTap the WhatsApp button below to order!',
    ].join('')
    setMessages(prev => [...prev, { role: 'bot', text: info, products: [item] }])
  }

  const accentColor = config?.widget_color || '#3B82F6'
  const position = config?.position || 'right'
  const isRight = position === 'right'
  const posClasses = isRight ? 'right-4' : 'left-4'
  const chips = getSuggestedChips()

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          className={`fixed z-50 bottom-4 ${posClasses} flex flex-col items-end`}
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
                  <button onClick={() => { setOpen(false); setExpandedFaq(null) }}>
                    <FiX size={16} />
                  </button>
                </div>

                <div className="p-3 max-h-80 overflow-y-auto space-y-2">
                  {messages.map((msg, i) => (
                    <div key={i}>
                      <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`max-w-[85%] px-3 py-2 text-xs rounded-xl ${
                            msg.role === 'user'
                              ? 'text-white'
                              : 'bg-slate-100 dark:bg-[#1a1a2e] text-slate-800 dark:text-slate-200'
                          }`}
                          style={msg.role === 'user' ? { backgroundColor: accentColor } : {}}
                        >
                          <span className="whitespace-pre-wrap">{msg.text}</span>
                        </div>
                      </div>

                      {msg.products?.length > 0 && (
                        <div className="mt-2 space-y-1.5">
                          {msg.products.map((p, pi) => (
                            <button
                              key={p.id || pi}
                              onClick={() => handleProductTap(p)}
                              className="w-full text-left"
                            >
                              <ProductCard item={p} compact={msg.products.length > 1} />
                            </button>
                          ))}
                        </div>
                      )}

                      {msg.adminReply && (
                        <div className="mt-2 ml-1">
                          <div className="flex justify-start">
                            <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 max-w-[85%]">
                              <p className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 mb-0.5">Store replied:</p>
                              <span className="whitespace-pre-wrap">{msg.adminReply}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {msg.role === 'bot' && !msg.products && !msg.adminReply && (
                        <div className="flex items-center gap-2 mt-1 ml-1">
                          <button
                            onClick={() => handleFeedback(i, 'helpful')}
                            className={`p-0.5 rounded transition-all ${
                              feedback[i] === 'helpful'
                                ? 'text-blue-500 bg-blue-100 dark:bg-blue-500/20'
                                : 'text-slate-400 hover:text-blue-500'
                            }`}
                          >
                            <FiThumbsUp size={10} />
                          </button>
                          <button
                            onClick={() => handleFeedback(i, 'not_helpful')}
                            className={`p-0.5 rounded transition-all ${
                              feedback[i] === 'not_helpful'
                                ? 'text-red-500 bg-red-100 dark:bg-red-500/20'
                                : 'text-slate-400 hover:text-red-500'
                            }`}
                          >
                            <FiThumbsDown size={10} />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}

                  {typing && <TypingIndicator color={accentColor} />}

                  {messages.length === 0 && !typing && (
                    <>
                      {config?.welcome_message && (
                        <p className="text-xs text-slate-600 dark:text-slate-400 text-center py-2 leading-relaxed">
                          {config.welcome_message}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-1.5 justify-center pb-1">
                        {chips.map((chip, i) => (
                          <SuggestedChip key={i} label={chip.label} onClick={() => handleChip(chip.action)} />
                        ))}
                      </div>

                      {faqs.map((faq) => (
                        <div key={faq.id}>
                          <button
                            onClick={() => handleFaqClick(faq)}
                            className="w-full text-left px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-[#1a1a2e] border border-slate-200 dark:border-white/10 text-xs font-medium text-slate-800 dark:text-slate-200 hover:border-blue-300 dark:hover:border-blue-500/50 transition-all"
                          >
                            {faq.question}
                          </button>
                          <AnimatePresence>
                            {expandedFaq === faq.id && (
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

                      {faqs.length === 0 && catalogue.length > 0 && (
                        <p className="text-[10px] text-slate-400 text-center pt-1">
                          Ask me about our products!
                        </p>
                      )}
                    </>
                  )}

                  <div ref={chatEndRef} />
                </div>

                <div className="p-3 border-t border-slate-200 dark:border-white/10 space-y-2">
                  <div className="flex gap-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && !typing && handleSend()}
                      placeholder="Ask about products..."
                      disabled={typing}
                      className="flex-1 bg-slate-100 dark:bg-[#1a1a2e] border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500/50 disabled:opacity-50"
                    />
                    <button
                      onClick={() => handleSend()}
                      disabled={!input.trim() || typing}
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
            onClick={() => { setOpen(!open); if (open) setUnreadReply(false) }}
            animate={open ? { rotate: 45 } : { rotate: 0 }}
            className="w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white relative"
            style={{ backgroundColor: accentColor }}
          >
            {open ? <FiX size={24} /> : <FiMessageCircle size={24} />}
            {unreadReply && !open && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white dark:border-[#16213e] flex items-center justify-center">
                <span className="text-[8px] font-bold text-white">!</span>
              </span>
            )}
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default ChatWidget