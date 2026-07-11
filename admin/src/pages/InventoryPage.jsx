import { useMemo, useState } from 'react';
import PageHeader from '../components/admin/PageHeader.jsx';
import Toolbar from '../components/admin/Toolbar.jsx';
import Modal from '../components/admin/Modal.jsx';
import StatusBadge from '../components/admin/StatusBadge.jsx';
import KpiCard from '../components/admin/KpiCard.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { APP_NAME } from '../utilities/constants.js';

/**
 * Mock data layer.
 * There is no Inventory/stock schema on the backend yet (Product has no
 * `stock`, `sku`, or `unitValue` fields — see server/src/models/product.model.js).
 * This page is fully interactive against local state so the UI/UX is ready
 * to wire up, but nothing here persists yet.
 */

const SEED = [
  {
    id: 1,
    name: 'Ethiopia Yirgacheffe Beans',
    sub: '18 kg on hand',
    category: 'Coffee',
    sku: 'CF-1042',
    stock: 72,
  },
  {
    id: 2,
    name: 'Oat Milk (1L)',
    sub: '6 units on hand',
    category: 'Dairy Alt.',
    sku: 'DA-2210',
    stock: 12,
  },
  {
    id: 3,
    name: 'Vanilla Syrup (750ml)',
    sub: '2 bottles on hand',
    category: 'Syrups',
    sku: 'SY-0087',
    stock: 8,
  },
  {
    id: 4,
    name: 'Paper Cups 12oz',
    sub: '340 pcs on hand',
    category: 'Packaging',
    sku: 'PK-1180',
    stock: 34,
  },
  {
    id: 5,
    name: 'Croissant Dough (Frozen)',
    sub: '61 units on hand',
    category: 'Bakery',
    sku: 'BK-3305',
    stock: 61,
  },
];

const SORT_OPTIONS = [
  { value: 'name:asc', label: 'Name (A–Z)' },
  { value: 'stock:asc', label: 'Stock (Low–High)' },
  { value: 'stock:desc', label: 'Stock (High–Low)' },
];

const stockTone = (stock) => (stock <= 15 ? 'danger' : stock <= 35 ? 'warn' : 'good');
const stockLabel = (stock) =>
  stock <= 15 ? 'Out of Stock' : stock <= 35 ? 'Low Stock' : 'In Stock';

const emptyForm = { name: '', sub: '', category: '', sku: '', stock: '' };

const InventoryPage = () => {
  useDocumentTitle(`${APP_NAME} | Inventory`);

  const [items, setItems] = useState(SEED);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('name:asc');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');

  const visibleItems = useMemo(() => {
    const [field, order] = sort.split(':');
    const filtered = items.filter((item) =>
      (item.name + ' ' + item.category + ' ' + item.sku)
        .toLowerCase()
        .includes(search.trim().toLowerCase()),
    );
    filtered.sort((a, b) => {
      const dir = order === 'asc' ? 1 : -1;
      if (field === 'stock') return (a.stock - b.stock) * dir;
      return a.name.localeCompare(b.name) * dir;
    });
    return filtered;
  }, [items, search, sort]);

  const totalProducts = items.length;
  const totalAssetValue = items.reduce((sum, item) => sum + item.stock * 45, 0); // placeholder valuation

  const openAddModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      sub: item.sub,
      category: item.category,
      sku: item.sku,
      stock: item.stock,
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleSave = (event) => {
    event.preventDefault();
    if (!form.name.trim() || !form.sku.trim() || form.stock === '') {
      setFormError('Name, SKU, and stock level are required.');
      return;
    }
    const payload = { ...form, stock: Math.min(100, Math.max(0, Number(form.stock))) };
    if (editingId) {
      setItems((prev) => prev.map((i) => (i.id === editingId ? { ...i, ...payload } : i)));
    } else {
      setItems((prev) => [{ id: Date.now(), ...payload }, ...prev]);
    }
    setModalOpen(false);
  };

  const handleDelete = (item) => {
    if (!window.confirm(`Remove "${item.name}" from inventory?`)) return;
    setItems((prev) => prev.filter((i) => i.id !== item.id));
  };

  return (
    <>
      <PageHeader
        eyebrow="Manager"
        title="Inventory"
        subtitle={`${totalProducts} tracked products`}
      />
      <div className="admin-content">
        <div className="kpi-grid">
          <KpiCard
            label="Total Asset Value"
            value={`₱${totalAssetValue.toLocaleString('en-PH')}`}
          />
          <KpiCard label="Total Products Count" value={totalProducts} />
        </div>

        <Toolbar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search inventory..."
          sortValue={sort}
          onSortChange={setSort}
          sortOptions={SORT_OPTIONS}
          actionLabel="+ Add New Item"
          onAction={openAddModal}
        />

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Category</th>
                <th>SKU</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {visibleItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="empty-state">
                    No items match these filters.
                  </td>
                </tr>
              ) : (
                visibleItems.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="data-table__primary">{item.name}</div>
                      <div className="data-table__sub">{item.sub}</div>
                    </td>
                    <td>{item.category}</td>
                    <td>{item.sku}</td>
                    <td>
                      <div className="stock-gauge">
                        <div className="stock-gauge__track">
                          <div
                            className={`stock-gauge__fill stock-gauge__fill--${stockTone(item.stock)}`}
                            style={{ width: `${item.stock}%` }}
                          />
                        </div>
                        <span className="stock-gauge__num">{item.stock}%</span>
                      </div>
                    </td>
                    <td>
                      <StatusBadge tone={stockTone(item.stock)}>
                        {stockLabel(item.stock)}
                      </StatusBadge>
                    </td>
                    <td className="data-table__actions">
                      <button
                        type="button"
                        className="btn btn-icon"
                        onClick={() => openEditModal(item)}
                        title="Edit"
                      >
                        ✎
                      </button>
                      <button
                        type="button"
                        className="btn btn-icon"
                        onClick={() => handleDelete(item)}
                        title="Delete"
                      >
                        🗑
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <Modal
          title={editingId ? 'Edit Inventory Item' : 'Add New Item'}
          onClose={() => setModalOpen(false)}
        >
          <form onSubmit={handleSave}>
            {formError && <div className="form-error">{formError}</div>}

            <div className="field-group">
              <label htmlFor="inv-name">Item Name</label>
              <input
                id="inv-name"
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div className="field-group">
              <label htmlFor="inv-sub">Quantity Note</label>
              <input
                id="inv-sub"
                type="text"
                value={form.sub}
                onChange={(e) => setForm({ ...form, sub: e.target.value })}
                placeholder="e.g. 18 kg on hand"
              />
            </div>

            <div className="field-row">
              <div className="field-group">
                <label htmlFor="inv-category">Category</label>
                <input
                  id="inv-category"
                  type="text"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                />
              </div>
              <div className="field-group">
                <label htmlFor="inv-sku">SKU</label>
                <input
                  id="inv-sku"
                  type="text"
                  value={form.sku}
                  onChange={(e) => setForm({ ...form, sku: e.target.value })}
                />
              </div>
            </div>

            <div className="field-group">
              <label htmlFor="inv-stock">Stock Level (%)</label>
              <input
                id="inv-stock"
                type="number"
                min="0"
                max="100"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
              />
            </div>

            <div className="modal-card__actions">
              <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save Item
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
};

export default InventoryPage;
