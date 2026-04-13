import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

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

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    setLoading(true);
    const { data, error } = await supabase
      .from("catalogue")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setItems(data);
    setLoading(false);
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
        .eq("id", editItem.id));
    } else {
      ({ error } = await supabase.from("catalogue").insert([payload]));
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
    const { error } = await supabase.from("catalogue").delete().eq("id", id);
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
      .eq("id", item.id);
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
        <div>
          <h1
            className="text-lg font-extrabold"
            style={{ fontFamily: "var(--font-display)" }}
          >
            PowerSec Admin
          </h1>
          <p className="text-xs text-slate-400">
            {items.length} items in catalogue
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-accent hover:bg-accent2 text-primary font-bold text-sm px-4 py-2.5 rounded-xl transition-all"
          style={{ fontFamily: "var(--font-display)" }}
        >
          + Add Item
        </button>
      </div>

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
