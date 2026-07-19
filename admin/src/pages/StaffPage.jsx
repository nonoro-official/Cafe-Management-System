import { useEffect, useState } from 'react';
import PageHeader from '../components/admin/PageHeader.jsx';
import Toolbar from '../components/admin/Toolbar.jsx';
import Modal from '../components/admin/Modal.jsx';
import StatusBadge from '../components/admin/StatusBadge.jsx';
import KpiCard from '../components/admin/KpiCard.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { APP_NAME } from '../utilities/constants.js';
import { listStaff, createStaff, updateStaff, deleteStaff } from '../services/userService.js';

const SORT_OPTIONS = [
  { value: 'createdAt:desc', label: 'Newest first' },
  { value: 'name:asc', label: 'Name (A–Z)' },
  { value: 'email:asc', label: 'Email (A–Z)' },
];

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' });

const shortId = (id) => `EMP-${id.slice(-5).toUpperCase()}`;

const emptyForm = { name: '', email: '', password: '', phone: '', isActive: true };

const StaffPage = () => {
  useDocumentTitle(`${APP_NAME} | Staff`);

  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('createdAt:desc');
  const [staff, setStaff] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const [sortField, order] = sort.split(':');

    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const params = { sort: sortField, order, limit: 100 };
        if (search.trim()) params.search = search.trim();
        const res = await listStaff(params);
        if (!cancelled) {
          setStaff(res.data);
          setMeta(res.meta);
        }
      } catch (err) {
        if (!cancelled) setError(err?.response?.data?.message || 'Could not load staff.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    const timeout = setTimeout(load, 250);
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [search, sort]);

  const openAddModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (member) => {
    setEditingId(member._id);
    setForm({
      name: member.name,
      email: member.email,
      password: '',
      phone: member.phone || '',
      isActive: member.isActive,
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (!form.name.trim() || !form.email.trim() || (!editingId && form.password.length < 8)) {
      setFormError(
        editingId
          ? 'Name and email are required.'
          : 'Name, email, and an 8+ character password are required.',
      );
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      if (editingId) {
        const payload = {
          name: form.name,
          email: form.email,
          phone: form.phone,
          isActive: form.isActive,
        };
        if (form.password) payload.password = form.password;
        const updated = await updateStaff(editingId, payload);
        setStaff((prev) => prev.map((s) => (s._id === editingId ? updated : s)));
      } else {
        const created = await createStaff(form);
        setStaff((prev) => [created, ...prev]);
      }
      setModalOpen(false);
    } catch (err) {
      setFormError(err?.response?.data?.message || 'Could not save this staff member.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (member) => {
    if (!window.confirm(`Remove ${member.name} from staff?`)) return;
    try {
      await deleteStaff(member._id);
      setStaff((prev) => prev.filter((s) => s._id !== member._id));
    } catch (err) {
      window.alert(err?.response?.data?.message || 'Could not remove this staff member.');
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Management"
        title="Staff"
        subtitle={`${meta?.total ?? staff.length} employees on record`}
      />
      <div className="admin-content">
        <div className="kpi-grid">
          <KpiCard label="Total Employees" value={meta?.total ?? staff.length} />
          <KpiCard label="Present Today" value="—" />
        </div>

        <Toolbar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search staff..."
          sortValue={sort}
          onSortChange={setSort}
          sortOptions={SORT_OPTIONS}
          actionLabel="+ Add New Item"
          onAction={openAddModal}
        />

        <div className="table-wrap">
          {loading ? (
            <div style={{ padding: '1.5rem' }}>
              <LoadingSpinner label="Loading staff..." />
            </div>
          ) : error ? (
            <div className="form-error" style={{ margin: '1rem' }}>
              {error}
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Join Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {staff.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="empty-state">
                      No staff match these filters yet.
                    </td>
                  </tr>
                ) : (
                  staff.map((member) => (
                    <tr key={member._id}>
                      <td>{shortId(member._id)}</td>
                      <td className="data-table__primary">{member.name}</td>
                      <td>{member.email}</td>
                      <td>{formatDate(member.createdAt)}</td>
                      <td>
                        <StatusBadge tone={member.isActive ? 'good' : 'danger'}>
                          {member.isActive ? 'Active' : 'Inactive'}
                        </StatusBadge>
                      </td>
                      <td className="data-table__actions">
                        <button
                          type="button"
                          className="btn btn-icon"
                          onClick={() => openEditModal(member)}
                          title="Edit"
                        >
                          ✎
                        </button>
                        <button
                          type="button"
                          className="btn btn-icon"
                          onClick={() => handleDelete(member)}
                          title="Remove"
                        >
                          🗑
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {modalOpen && (
        <Modal
          title={editingId ? 'Edit Staff Member' : 'Add New Employee'}
          onClose={() => setModalOpen(false)}
        >
          <form onSubmit={handleSave}>
            {formError && <div className="form-error">{formError}</div>}

            <div className="field-group">
              <label htmlFor="staff-name">Full Name</label>
              <input
                id="staff-name"
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div className="field-group">
              <label htmlFor="staff-email">Email</label>
              <input
                id="staff-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div className="field-row">
              <div className="field-group">
                <label htmlFor="staff-phone">Phone</label>
                <input
                  id="staff-phone"
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
              <div className="field-group">
                <label htmlFor="staff-password">
                  {editingId ? 'New Password (optional)' : 'Password'}
                </label>
                <input
                  id="staff-password"
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder={editingId ? 'Leave blank to keep current' : 'Min. 8 characters'}
                />
              </div>
            </div>

            <div className="field-group">
              <label>
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  style={{ width: 'auto', marginRight: '0.5rem' }}
                />
                Active
              </label>
            </div>

            <div className="modal-card__actions">
              <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
};

export default StaffPage;
