import { useEffect, useMemo, useState } from 'react';
import PageHeader from '../components/admin/PageHeader.jsx';
import Toolbar from '../components/admin/Toolbar.jsx';
import Modal from '../components/admin/Modal.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { APP_NAME } from '../utilities/constants.js';
import {
  listProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../services/productService.js';
import { listCategories } from '../services/categoryService.js';
import { formatCurrency, CURRENCY_SYMBOL } from '../utilities/currency.js';

const SORT_OPTIONS = [
  { value: 'createdAt:desc', label: 'Newest first' },
  { value: 'name:asc', label: 'Name (A–Z)' },
  { value: 'price:asc', label: 'Price (Low–High)' },
  { value: 'price:desc', label: 'Price (High–Low)' },
];

const emptyForm = {
  name: '',
  category: '',
  price: '',
  description: '',
  isAvailable: true,
};

const MenuPage = () => {
  useDocumentTitle(`${APP_NAME} | Menu`);

  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('createdAt:desc');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    listCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    let cancelled = false;
    const [sortField, order] = sort.split(':');

    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const params = { sort: sortField, order, limit: 100 };
        if (activeCategory !== 'all') params.category = activeCategory;
        if (search.trim()) params.search = search.trim();
        const res = await listProducts(params);
        if (!cancelled) setProducts(res.data);
      } catch (err) {
        if (!cancelled) setError(err?.response?.data?.message || 'Could not load menu items.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    const timeout = setTimeout(load, 250); // light debounce for the search box
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [activeCategory, search, sort]);

  const openAddModal = () => {
    setEditingId(null);
    setForm({ ...emptyForm, category: categories[0]?._id || '' });
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingId(product._id);
    setForm({
      name: product.name,
      category: product.category?._id || '',
      price: product.price,
      description: product.description || '',
      isAvailable: product.isAvailable,
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (!form.name.trim() || !form.category || form.price === '') {
      setFormError('Name, category, and price are required.');
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      const payload = { ...form, price: Number(form.price) };
      if (editingId) {
        const updated = await updateProduct(editingId, payload);
        setProducts((prev) => prev.map((p) => (p._id === editingId ? updated : p)));
      } else {
        const created = await createProduct(payload);
        setProducts((prev) => [created, ...prev]);
      }
      setModalOpen(false);
    } catch (err) {
      setFormError(err?.response?.data?.message || 'Could not save this item.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (product) => {
    if (!window.confirm(`Remove "${product.name}" from the menu?`)) return;
    try {
      await deleteProduct(product._id);
      setProducts((prev) => prev.filter((p) => p._id !== product._id));
    } catch (err) {
      window.alert(err?.response?.data?.message || 'Could not delete this item.');
    }
  };

  const categoryTabs = useMemo(() => [{ _id: 'all', name: 'All' }, ...categories], [categories]);

  return (
    <>
      <PageHeader eyebrow="Management" title="Menu" subtitle={`${products.length} items`} />
      <div className="admin-content">
        <Toolbar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search menu items..."
          sortValue={sort}
          onSortChange={setSort}
          sortOptions={SORT_OPTIONS}
          actionLabel="+ Add to Menu"
          onAction={openAddModal}
        />

        <div className="cat-tabs">
          {categoryTabs.map((cat) => (
            <button
              key={cat._id}
              type="button"
              className={`cat-tabs__item${activeCategory === cat._id ? ' is-active' : ''}`}
              onClick={() => setActiveCategory(cat._id)}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {loading ? (
          <LoadingSpinner label="Loading menu..." />
        ) : error ? (
          <div className="form-error">{error}</div>
        ) : products.length === 0 ? (
          <p className="empty-state">No menu items match these filters yet.</p>
        ) : (
          <div className="item-grid">
            {products.map((product) => (
              <div className="item-card" key={product._id}>
                {product.imageLoc ? (
                  <img className="item-card__thumb" src={product.imageLoc} alt={product.name} />
                ) : (
                  <div className="item-card__thumb item-card__thumb--empty">☕</div>
                )}
                <div className="item-card__category">
                  {product.category?.name || 'Uncategorized'}
                </div>
                <div className="item-card__name">{product.name}</div>
                <div className="item-card__foot">
                  <span className="item-card__price">{formatCurrency(product.price)}</span>
                  <div className="item-card__actions">
                    <button
                      type="button"
                      className="btn btn-icon"
                      onClick={() => openEditModal(product)}
                      title="Edit"
                    >
                      ✎
                    </button>
                    <button
                      type="button"
                      className="btn btn-icon"
                      onClick={() => handleDelete(product)}
                      title="Delete"
                    >
                      🗑
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modalOpen && (
        <Modal
          title={editingId ? 'Edit Menu Item' : 'Add to Menu'}
          onClose={() => setModalOpen(false)}
        >
          <form onSubmit={handleSave}>
            {formError && <div className="form-error">{formError}</div>}

            <div className="field-group">
              <label htmlFor="name">Item Name</label>
              <input
                id="name"
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div className="field-row">
              <div className="field-group">
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  <option value="" disabled>
                    Select category
                  </option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field-group">
                <label htmlFor="price">Price ({CURRENCY_SYMBOL})</label>
                <input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                />
              </div>
            </div>

            <div className="field-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                rows={2}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <div className="field-group">
              <label>Image</label>
              <p className="field-hint">
                The image is matched automatically from{' '}
                <code>server/public/images/products</code> by the item name (e.g.{' '}
                <code>{`${form.name || 'Item Name'}.webp`}</code>). Drop a matching file there to
                set it.
              </p>
            </div>

            <div className="field-group">
              <label>
                <input
                  type="checkbox"
                  checked={form.isAvailable}
                  onChange={(e) => setForm({ ...form, isAvailable: e.target.checked })}
                  style={{ width: 'auto', marginRight: '0.5rem' }}
                />
                Available on the kiosk
              </label>
            </div>

            <div className="modal-card__actions">
              <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving...' : 'Save Item'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
};

export default MenuPage;
