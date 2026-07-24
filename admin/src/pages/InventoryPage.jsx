import { useCallback, useEffect, useMemo, useState } from 'react';
import PageHeader from '../components/admin/PageHeader.jsx';
import Toolbar from '../components/admin/Toolbar.jsx';
import Modal from '../components/admin/Modal.jsx';
import StatusBadge from '../components/admin/StatusBadge.jsx';
import KpiCard from '../components/admin/KpiCard.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { APP_NAME, stockTone, stockLabel } from '../utilities/constants.js';
import { formatCurrency } from '../utilities/currency.js';
import { inventoryService } from '../services/inventoryService.js';

const SORT_OPTIONS = [
  { value: 'name:asc', label: 'Name (A–Z)' },
  { value: 'stock:asc', label: 'Stock (Low–High)' },
  { value: 'stock:desc', label: 'Stock (High–Low)' },
];

const emptyForm = { name: '', sub: '', category: '', sku: '', stock: '' };

const errorMessage = (err, fallback) =>
  err?.response?.data?.message || err?.message || fallback;

const InventoryPage = () => {
  useDocumentTitle(`${APP_NAME} | Inventory`);

  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('name:asc');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const [listRes, summaryRes] = await Promise.all([
        inventoryService.list({ limit: 100 }),
        inventoryService.summary(),
      ]);
      setItems(listRes.data ?? []);
      setSummary(summaryRes.data ?? null);
    } catch (err) {
      setLoadError(errorMessage(err, 'Unable to load inventory.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const visibleItems = useMemo(() => {
    const [field, order] = sort.split(':');
    const filtered = items.filter((item) =>
      `${item.name} ${item.category} ${item.sku}`
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

  const totalProducts = summary?.totalProducts ?? items.length;
  const totalAssetValue =
    summary?.totalAssetValue ??
    items.reduce((sum, item) => sum + item.stock * (item.unitValue ?? 0), 0);

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
      sub: item.sub ?? '',
      category: item.category ?? '',
      sku: item.sku,
      stock: item.stock,
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (!form.name.trim() || !form.sku.trim() || form.stock === '') {
      setFormError('Name, SKU, and stock level are required.');
      return;
    }

    const payload = {
      name: form.name.trim(),
      sub: form.sub.trim(),
      category: form.category.trim(),
      sku: form.sku.trim(),
      stock: Math.min(100, Math.max(0, Number(form.stock))),
    };

    setSaving(true);
    setFormError('');
    try {
      if (editingId) {
        await inventoryService.update(editingId, payload);
      } else {
        await inventoryService.create(payload);
      }
      setModalOpen(false);
      await load();
    } catch (err) {
      setFormError(errorMessage(err, 'Could not save the item.'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Remove "${item.name}" from inventory?`)) return;
    try {
      await inventoryService.remove(item.id);
      await load();
    } catch (err) {
      setLoadError(errorMessage(err, 'Could not delete the item.'));
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Management"
        title="Inventory"
        subtitle={`${totalProducts} tracked products`}
      />
      <div className="admin-content">
        <div className="kpi-grid">
          <KpiCard label="Total Asset Value" value={formatCurrency(totalAssetValue)} />
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

        {loadError && <div className="form-error">{loadError}</div>}

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
              {loading ? (
                <tr>
                  <td colSpan={6} className="empty-state">
                    Loading inventory…
                  </td>
                </tr>
              ) : visibleItems.length === 0 ? (
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
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving…' : 'Save Item'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
};

export default InventoryPage;
