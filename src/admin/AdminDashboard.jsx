import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { getShopId, withShop } from "../lib/shop";
import { FiMessageCircle, FiCheck, FiPlus, FiTrash2, FiChevronUp, FiChevronDown, FiSend, FiCheckCircle } from "react-icons/fi";

const EMPTY_FORM = {
  type: "product",
  category: "",
  name: "",
  description: "",
  image: "",
  price: "",
  price_label: "",
  badge: "",
  available: true,
  specs: "",
  includes: "",
};

function AdminDashboard() {
  const [tab, setTab] = useState("catalogue");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterType, setFilterType] = useState("All");
  const [toast, setToast] = useState(null);
  const [chatConfig, setChatConfig] = useState(null);
  const [chatFaqs, setChatFaqs] = useState([]);
  const [chatMsgs, setChatMsgs] = useState([]);
  const [chatMsgTab, setChatMsgTab] = useState("unanswered");
  const [chatReplies, setChatReplies] = useState({});
  const [chatSaving, setChatSaving] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    setLoading(true);
    const shopId = await getShopId();
    const { data, error } = await supabase
      .from("catalogue")
      .select("*")
      .eq("shop_id", shopId)
      .order("created_at", { ascending: false });
    if (!error) setItems(data);
    setLoading(false);
  }

  async function fetchChatData() {
    const shopId = await getShopId();
    if (!shopId) return;
    const [{ data: cfg }, { data: faqData }, { data: msgData }] = await Promise.all([
      supabase.from("chat_config").select("*").eq("shop_id", shopId).maybeSingle(),
      supabase.from("chat_faqs").select("*").eq("shop_id", shopId).order("sort_order", { ascending: true }),
      supabase.from("chat_messages").select("*", { count: "exact" }).eq("shop_id", shopId).eq("status", "unanswered").order("created_at", { ascending: false }),
    ]);
    if (cfg) setChatConfig(cfg);
    if (faqData) setChatFaqs(faqData);
    if (msgData) setChatMsgs(msgData);
  }

  async function saveChatConfig() {
    if (!chatConfig?.shop_id) return;
    setChatSaving(true);
    const { error } = await supabase.from("chat_config").upsert(chatConfig, { onConflict: "shop_id" });
    setChatSaving(false);
    if (error) { showToast(error.message, "error"); return; }
    showToast("Chat settings saved!");
  }

  async function addChatFaq() {
    const shopId = await getShopId();
    if (!shopId) return;
    const q = prompt("Question:");
    if (!q?.trim()) return;
    const a = prompt("Answer:");
    if (!a?.trim()) return;
    const maxOrder = chatFaqs.reduce((max, f) => Math.max(max, f.sort_order), -1);
    const { data, error } = await supabase.from("chat_faqs").insert({ shop_id: shopId, question: q.trim(), answer: a.trim(), sort_order: maxOrder + 1 }).select().single();
    if (error) { showToast(error.message, "error"); return; }
    setChatFaqs([...chatFaqs, data]);
    showToast("FAQ added!");
  }

  async function deleteChatFaq(id) {
    const shopId = await getShopId();
    const { error } = await supabase.from("chat_faqs").delete().eq("id", id).eq("shop_id", shopId);
    if (error) { showToast(error.message, "error"); return; }
    setChatFaqs(chatFaqs.filter((f) => f.id !== id));
    showToast("FAQ deleted");
  }

  async function moveChatFaq(id, direction) {
    const idx = chatFaqs.findIndex((f) => f.id === id);
    if (idx === -1) return;
    const swapIdx = idx + direction;
    if (swapIdx < 0 || swapIdx >= chatFaqs.length) return;
    const updated = [...chatFaqs];
    const temp = updated[idx].sort_order;
    updated[idx] = { ...updated[idx], sort_order: updated[swapIdx].sort_order };
    updated[swapIdx] = { ...updated[swapIdx], sort_order: temp };
    setChatFaqs(updated);
    const shopId = await getShopId();
    const { error } = await supabase.from("chat_faqs").upsert([
      { id: updated[idx].id, shop_id: shopId, sort_order: updated[idx].sort_order },
      { id: updated[swapIdx].id, shop_id: shopId, sort_order: updated[swapIdx].sort_order },
    ]);
    if (error) { showToast(error.message, "error"); }
  }

  async function sendChatReply(id) {
    const answer = (chatReplies[id] || "").trim();
    if (!answer) return;
    const shopId = await getShopId();
    const { error } = await supabase.from("chat_messages").update({ status: "answered", answer }).eq("id", id).eq("shop_id", shopId);
    if (error) { showToast(error.message, "error"); return; }
    setChatReplies((prev) => { const r = { ...prev }; delete r[id]; return r; });
    setChatMsgs(chatMsgs.filter((m) => m.id !== id));
    showToast("Reply sent!");
  }

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  function openAdd() {
    setForm(EMPTY_FORM);
    setEditItem(null);
    setShowForm(true);
  }

  function openEdit(item) {
    setForm({
      ...item,
      specs: Array.isArray(item.specs) ? item.specs.join("\n") : "",
      includes: Array.isArray(item.includes) ? item.includes.join("\n") : "",
    });
    setEditItem(item);
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.name || !form.category || !form.type) {
      showToast("Name, category and type are required", "error");
      return;
    }
    setSaving(true);

    const payload = {
      ...form,
      price: parseInt(form.price) || 0,
      specs:
        form.type === "product" && form.specs
          ? form.specs
              .split("\n")
              .map((s) => s.trim())
              .filter(Boolean)
          : null,
      includes:
        form.type === "service" && form.includes
          ? form.includes
              .split("\n")
              .map((s) => s.trim())
              .filter(Boolean)
          : null,
      badge: form.badge || null,
    };

    let error;
    if (editItem) {
      ({ error } = await supabase
        .from("catalogue")
        .update(payload)
        .eq("id", editItem.id)
        .eq("shop_id", await getShopId()));
    } else {
      ({ error } = await supabase.from("catalogue").insert([withShop(payload)]));
    }

    setSaving(false);
    if (error) {
      showToast("Something went wrong", "error");
      return;
    }
    showToast(editItem ? "Item updated!" : "Item added!");
    setShowForm(false);
    fetchItems();
  }

  async function handleDelete(id) {
    if (!confirm("Delete this item?")) return;
    setDeletingId(id);
    const { error } = await supabase.from("catalogue").delete().eq("id", id).eq("shop_id", await getShopId());
    setDeletingId(null);
    if (error) {
      showToast("Delete failed", "error");
      return;
    }
    showToast("Item deleted");
    fetchItems();
  }

  async function toggleAvailable(item) {
    await supabase
      .from("catalogue")
      .update({ available: !item.available })
      .eq("id", item.id)
      .eq("shop_id", await getShopId());
    fetchItems();
  }

  const categories = ["All", ...new Set(items.map((i) => i.category))];

  const filtered = items.filter((i) => {
    const matchType =
      filterType === "All" || i.type === filterType.toLowerCase();
    const matchCat = filterCategory === "All" || i.category === filterCategory;
    return matchType && matchCat;
  });

  return (
    <div className="min-h-screen text-white bg-primary">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-sm font-semibold shadow-xl
          ${toast.type === "error" ? "bg-red-500 text-white" : "bg-accent text-primary"}`}
        >
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b bg-surface border-white/10">
        <div className="flex items-center gap-4">
          <h1
            className="text-lg font-extrabold"
            style={{ fontFamily: "var(--font-display)" }}
          >
            PowerSec Admin
          </h1>
          <div className="flex gap-1 bg-primary/50 rounded-lg p-0.5">
            <button
              onClick={() => setTab("catalogue")}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                tab === "catalogue"
                  ? "bg-accent text-primary"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Catalogue
            </button>
            <button
              onClick={() => { setTab("chat"); fetchChatData(); }}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                tab === "chat"
                  ? "bg-accent text-primary"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <FiMessageCircle size={12} />
              Chat Widget
            </button>
          </div>
        </div>
        {tab === "catalogue" && (
          <button
            onClick={openAdd}
            className="flex items-center gap-2 bg-accent hover:bg-accent2 text-primary font-bold text-sm px-4 py-2.5 rounded-xl transition-all"
            style={{ fontFamily: "var(--font-display)" }}
          >
            + Add Item
          </button>
        )}
      </div>

      {tab === "catalogue" && (
      <div className="max-w-6xl px-4 py-8 mx-auto">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8 sm:grid-cols-4">
          {[
            { label: "Total Items", value: items.length },
            {
              label: "Products",
              value: items.filter((i) => i.type === "product").length,
            },
            {
              label: "Services",
              value: items.filter((i) => i.type === "service").length,
            },
            {
              label: "Unavailable",
              value: items.filter((i) => !i.available).length,
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="p-4 border bg-surface border-white/10 rounded-xl"
            >
              <p
                className="text-2xl font-extrabold text-accent"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {stat.value}
              </p>
              <p className="mt-1 text-xs text-slate-400">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          {["All", "product", "service"].map((t) => (
            <button
              key={t}
              onClick={() =>
                setFilterType(
                  t === "All" ? "All" : t.charAt(0).toUpperCase() + t.slice(1),
                )
              }
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all border
                ${
                  filterType ===
                  (t === "All" ? "All" : t.charAt(0).toUpperCase() + t.slice(1))
                    ? "bg-accent text-primary border-accent"
                    : "bg-surface text-slate-400 border-white/10"
                }`}
              style={{ fontFamily: "var(--font-display)" }}
            >
              {t === "All"
                ? "All Types"
                : t.charAt(0).toUpperCase() + t.slice(1) + "s"}
            </button>
          ))}
          <span className="text-white/10">|</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all border
                ${
                  filterCategory === cat
                    ? "bg-accent text-primary border-accent"
                    : "bg-surface text-slate-400 border-white/10"
                }`}
              style={{ fontFamily: "var(--font-display)" }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Table */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-16 bg-surface rounded-xl animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="overflow-hidden border bg-surface border-white/10 rounded-2xl">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left uppercase text-slate-400">
                    Item
                  </th>
                  <th className="hidden px-4 py-3 text-xs font-semibold tracking-wider text-left uppercase text-slate-400 sm:table-cell">
                    Category
                  </th>
                  <th className="hidden px-4 py-3 text-xs font-semibold tracking-wider text-left uppercase text-slate-400 md:table-cell">
                    Type
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left uppercase text-slate-400">
                    Price
                  </th>
                  <th className="hidden px-4 py-3 text-xs font-semibold tracking-wider text-left uppercase text-slate-400 sm:table-cell">
                    Status
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold tracking-wider text-right uppercase text-slate-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, i) => (
                  <tr
                    key={item.id}
                    className={`border-b border-white/5 hover:bg-white/5 transition-colors ${i === filtered.length - 1 ? "border-0" : ""}`}
                  >
                    {/* Item */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="flex-shrink-0 object-cover w-10 h-10 rounded-lg bg-white/10"
                        />
                        <div>
                          <p className="text-sm font-semibold text-white line-clamp-1">
                            {item.name}
                          </p>
                          {item.badge && (
                            <span className="text-xs text-accent">
                              {item.badge}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="hidden px-4 py-3 sm:table-cell">
                      <span className="text-xs text-slate-300">
                        {item.category}
                      </span>
                    </td>

                    {/* Type */}
                    <td className="hidden px-4 py-3 md:table-cell">
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full
                        ${
                          item.type === "service"
                            ? "bg-blue-500/20 text-blue-300"
                            : "bg-green-500/20 text-green-300"
                        }`}
                      >
                        {item.type}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="px-4 py-3">
                      <span className="text-sm font-bold text-accent">
                        {item.price_label}
                      </span>
                    </td>

                    {/* Status toggle */}
                    <td className="hidden px-4 py-3 sm:table-cell">
                      <button
                        onClick={() => toggleAvailable(item)}
                        className={`text-xs font-semibold px-3 py-1 rounded-full transition-all
                          ${
                            item.available
                              ? "bg-green-500/20 text-green-300 hover:bg-red-500/20 hover:text-red-300"
                              : "bg-red-500/20 text-red-300 hover:bg-green-500/20 hover:text-green-300"
                          }`}
                      >
                        {item.available ? "Available" : "Hidden"}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(item)}
                          className="px-2 py-1 text-xs transition-colors rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          disabled={deletingId === item.id}
                          className="px-2 py-1 text-xs text-red-400 transition-colors rounded-lg hover:text-red-300 hover:bg-red-500/10"
                        >
                          {deletingId === item.id ? "..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filtered.length === 0 && (
              <div className="py-16 text-center text-slate-400">
                <p className="mb-3 text-3xl">📭</p>
                <p className="text-sm">No items found</p>
              </div>
            )}
          </div>
        )}
        </div>
      )}
      {tab === "chat" && (
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Widget Config */}
          <div className="p-5 border bg-surface border-white/10 rounded-xl">
            <h3 className="text-sm font-semibold text-white mb-4" style={{ fontFamily: "var(--font-display)" }}>Widget Settings</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs text-slate-400">Enabled</label>
                <button
                  onClick={() => setChatConfig({ ...chatConfig, enabled: !chatConfig?.enabled })}
                  className={`relative w-10 h-5 rounded-full transition-all ${chatConfig?.enabled ? "bg-accent" : "bg-slate-600"}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${chatConfig?.enabled ? "left-5" : "left-0.5"}`} />
                </button>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Welcome Message</label>
                <textarea rows={2} value={chatConfig?.welcome_message || ""} onChange={(e) => setChatConfig({ ...chatConfig, welcome_message: e.target.value })}
                  className="w-full bg-primary border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-accent/50 resize-none"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Widget Color</label>
                  <input type="color" value={chatConfig?.widget_color || "#3B82F6"} onChange={(e) => setChatConfig({ ...chatConfig, widget_color: e.target.value })}
                    className="w-full h-9 rounded-lg border border-white/10 cursor-pointer bg-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Position</label>
                  <select value={chatConfig?.position || "right"} onChange={(e) => setChatConfig({ ...chatConfig, position: e.target.value })}
                    className="w-full bg-primary border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-accent/50"
                  >
                    <option value="right">Bottom Right</option>
                    <option value="left">Bottom Left</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">WhatsApp</label>
                  <input type="text" value={chatConfig?.whatsapp_number || ""} onChange={(e) => setChatConfig({ ...chatConfig, whatsapp_number: e.target.value })} placeholder="2547..."
                    className="w-full bg-primary border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-accent/50"
                  />
                </div>
              </div>
            </div>
            <button onClick={saveChatConfig} disabled={chatSaving}
              className="mt-4 w-full py-2.5 bg-accent hover:bg-accent2 text-primary font-bold text-sm rounded-xl transition-all disabled:opacity-50"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {chatSaving ? "Saving..." : "Save Settings"}
            </button>
          </div>

          {/* FAQs */}
          <div className="p-5 border bg-surface border-white/10 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white" style={{ fontFamily: "var(--font-display)" }}>FAQs</h3>
              <button onClick={addChatFaq} className="flex items-center gap-1.5 px-3 py-1.5 bg-accent hover:bg-accent2 text-primary text-xs font-bold rounded-lg transition-all">
                <FiPlus size={12} /> Add FAQ
              </button>
            </div>
            {chatFaqs.map((faq, i) => (
              <div key={faq.id} className="bg-primary border border-white/10 rounded-lg p-3 mb-2">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">{faq.question}</p>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{faq.answer}</p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => moveChatFaq(faq.id, -1)} disabled={i === 0} className="p-1 text-slate-500 hover:text-white disabled:opacity-30"><FiChevronUp size={14} /></button>
                    <button onClick={() => moveChatFaq(faq.id, 1)} disabled={i === chatFaqs.length - 1} className="p-1 text-slate-500 hover:text-white disabled:opacity-30"><FiChevronDown size={14} /></button>
                    <button onClick={() => deleteChatFaq(faq.id)} className="p-1 text-red-400 hover:text-red-300"><FiTrash2 size={14} /></button>
                  </div>
                </div>
              </div>
            ))}
            {chatFaqs.length === 0 && <p className="text-xs text-slate-500 text-center py-6">No FAQs yet.</p>}
          </div>

          {/* Messages */}
          <div className="p-5 border bg-surface border-white/10 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <FiMessageCircle size={14} className="text-slate-400" />
              <div className="flex gap-1 bg-primary/50 rounded-lg p-0.5">
                <button onClick={() => setChatMsgTab("unanswered")}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${chatMsgTab === "unanswered" ? "bg-accent text-primary" : "text-slate-400 hover:text-white"}`}
                >Unanswered ({chatMsgs.filter(m => m.status === "unanswered").length})</button>
                <button onClick={async () => {
                  setChatMsgTab("answered");
                  const shopId = await getShopId();
                  const { data } = await supabase.from("chat_messages").select("*").eq("shop_id", shopId).eq("status", "answered").order("created_at", { ascending: false });
                  if (data) setChatMsgs(data);
                }}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${chatMsgTab === "answered" ? "bg-accent text-primary" : "text-slate-400 hover:text-white"}`}
                >Answered</button>
              </div>
            </div>

            {chatMsgTab === "unanswered" ? (
              chatMsgs.filter(m => m.status === "unanswered").length > 0 ? (
                chatMsgs.filter(m => m.status === "unanswered").map((msg) => (
                  <div key={msg.id} className="bg-primary border border-white/10 rounded-lg p-3 mb-2">
                    <p className="text-sm text-white">{msg.question}</p>
                    {msg.customer_name && <p className="text-xs text-slate-400 mt-1">— {msg.customer_name}</p>}
                    <div className="mt-2">
                      <textarea rows={2} value={chatReplies[msg.id] || ""} onChange={(e) => setChatReplies({ ...chatReplies, [msg.id]: e.target.value })} placeholder="Type your reply..."
                        className="w-full bg-primary border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-accent/50 resize-none"
                      />
                      <button onClick={() => sendChatReply(msg.id)} disabled={!chatReplies[msg.id]?.trim()}
                        className="mt-2 flex items-center gap-1.5 px-3 py-1.5 bg-accent hover:bg-accent2 text-primary text-xs font-bold rounded-lg transition-all disabled:opacity-50"
                      >
                        <FiSend size={12} /> Send Reply
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 text-center py-6">No unanswered questions.</p>
              )
            ) : (
              chatMsgs.filter(m => m.status === "answered").length > 0 ? (
                chatMsgs.filter(m => m.status === "answered").map((msg) => (
                  <div key={msg.id} className="bg-primary border border-white/10 rounded-lg p-3 mb-2">
                    <p className="text-sm font-medium text-white">Q: {msg.question}</p>
                    {msg.answer && (
                      <div className="mt-1.5 bg-accent/10 border border-accent/20 rounded-lg px-3 py-2">
                        <p className="text-[10px] font-semibold text-accent mb-0.5">Your reply:</p>
                        <p className="text-xs text-slate-300">{msg.answer}</p>
                      </div>
                    )}
                    {msg.feedback && (
                      <span className={`inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        msg.feedback === "helpful" ? "bg-green-500/20 text-green-300" : "bg-red-500/20 text-red-300"
                      }`}>
                        {msg.feedback === "helpful" ? "👍 Helpful" : "👎 Not helpful"}
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 text-center py-6">No answered messages.</p>
              )
            )}
          </div>
        </div>
      </div>
      )}

      {/* Add / Edit Form Modal */}
      {showForm && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowForm(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="bg-surface border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Form Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                <h2
                  className="font-extrabold text-white"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {editItem ? "Edit Item" : "Add New Item"}
                </h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              {/* Form Body */}
              <div className="p-6 space-y-4">
                {/* Type + Category row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                      Type *
                    </label>
                    <select
                      value={form.type}
                      onChange={(e) =>
                        setForm({ ...form, type: e.target.value })
                      }
                      className="w-full bg-primary border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-accent/50"
                    >
                      <option value="product">Product</option>
                      <option value="service">Service</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                      Category *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. CCTV"
                      value={form.category}
                      onChange={(e) =>
                        setForm({ ...form, category: e.target.value })
                      }
                      className="w-full bg-primary border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-accent/50"
                    />
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                    Name *
                  </label>
                  <input
                    type="text"
                    placeholder="Product or service name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-primary border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-accent/50"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Describe the product or service..."
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    className="w-full bg-primary border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-accent/50 resize-none"
                  />
                </div>

                {/* Image URL */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                    Image URL
                  </label>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={form.image}
                    onChange={(e) =>
                      setForm({ ...form, image: e.target.value })
                    }
                    className="w-full bg-primary border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-accent/50"
                  />
                  {form.image && (
                    <img
                      src={form.image}
                      alt="preview"
                      className="object-cover w-full h-24 mt-2 rounded-lg"
                    />
                  )}
                </div>

                {/* Price row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                      Price (Ksh)
                    </label>
                    <input
                      type="number"
                      placeholder="25000"
                      value={form.price}
                      onChange={(e) =>
                        setForm({ ...form, price: e.target.value })
                      }
                      className="w-full bg-primary border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-accent/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                      Price Label
                    </label>
                    <input
                      type="text"
                      placeholder="From Ksh 25,000"
                      value={form.price_label}
                      onChange={(e) =>
                        setForm({ ...form, price_label: e.target.value })
                      }
                      className="w-full bg-primary border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-accent/50"
                    />
                  </div>
                </div>

                {/* Badge + Available row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                      Badge
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Best Seller"
                      value={form.badge}
                      onChange={(e) =>
                        setForm({ ...form, badge: e.target.value })
                      }
                      className="w-full bg-primary border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-accent/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                      Status
                    </label>
                    <select
                      value={form.available}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          available: e.target.value === "true",
                        })
                      }
                      className="w-full bg-primary border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-accent/50"
                    >
                      <option value="true">Available</option>
                      <option value="false">Hidden</option>
                    </select>
                  </div>
                </div>

                {/* Specs — products only */}
                {form.type === "product" && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                      Specs{" "}
                      <span className="font-normal normal-case text-slate-600">
                        (one per line)
                      </span>
                    </label>
                    <textarea
                      rows={4}
                      placeholder={
                        "4K Resolution\n30m Night Vision\nIP67 Weatherproof"
                      }
                      value={form.specs}
                      onChange={(e) =>
                        setForm({ ...form, specs: e.target.value })
                      }
                      className="w-full bg-primary border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-accent/50 resize-none font-mono"
                    />
                  </div>
                )}

                {/* Includes — services only */}
                {form.type === "service" && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                      What's Included{" "}
                      <span className="font-normal normal-case text-slate-600">
                        (one per line)
                      </span>
                    </label>
                    <textarea
                      rows={4}
                      placeholder={
                        "4 cameras supplied & installed\nDVR + 1TB storage\n1 year warranty"
                      }
                      value={form.includes}
                      onChange={(e) =>
                        setForm({ ...form, includes: e.target.value })
                      }
                      className="w-full bg-primary border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-accent/50 resize-none font-mono"
                    />
                  </div>
                )}
              </div>

              {/* Form Footer */}
              <div className="flex gap-3 px-6 py-4 border-t border-white/10">
                <button
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 border border-white/10 text-slate-400 hover:text-white rounded-xl text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 py-2.5 bg-accent hover:bg-accent2 text-primary font-bold rounded-xl text-sm transition-all disabled:opacity-50"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {saving
                    ? "Saving..."
                    : editItem
                      ? "Save Changes"
                      : "Add Item"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default AdminDashboard;
