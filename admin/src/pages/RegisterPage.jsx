import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/admin/PageHeader.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { APP_NAME, TABLE_NUMBERS } from '../utilities/constants.js';
import { formatCurrency } from '../utilities/currency.js';
import { listProducts } from '../services/productService.js';
import { listCategories } from '../services/categoryService.js';
import { createRegisterOrder } from '../services/orderService.js';

const RegisterPage = () => {
  useDocumentTitle(`${APP_NAME} | Register`);
  const navigate = useNavigate();
  const { user } = useAuth();

  const [orderType, setOrderType] = useState('dine-in');
  const [tableNumber, setTableNumber] = useState(TABLE_NUMBERS[0]);
  const [customerName, setCustomerName] = useState('');
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cart, setCart] = useState([]);
  const [notes, setNotes] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');

  const VAT_RATE = 0.12;

  useEffect(() => {
    listCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    let cancelled = false;
    const start = () => {
      setLoading(true);
      setError('');
      const params = { limit: 100, isAvailable: true };
      if (activeCategory !== 'all') params.category = activeCategory;
      listProducts(params)
        .then((res) => !cancelled && setProducts(res.data))
        .catch(
          (err) =>
            !cancelled && setError(err?.response?.data?.message || 'Could not load menu items.'),
        )
        .finally(() => !cancelled && setLoading(false));
    };
    start();
    return () => {
      cancelled = true;
    };
  }, [activeCategory]);

  const categoryTabs = useMemo(() => [{ _id: 'all', name: 'All' }, ...categories], [categories]);

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product._id);
      if (existing) {
        return prev.map((item) =>
          item.productId === product._id ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }
      return [
        ...prev,
        {
          productId: product._id,
          name: product.name,
          price: product.price,
          quantity: 1,
          image: product.image,
        },
      ];
    });
  };

  const changeQty = (productId, delta) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.productId === productId ? { ...item, quantity: item.quantity + delta } : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const clearOrder = () => {
    setCart([]);
    setNotes('');
    setTableNumber(TABLE_NUMBERS[0]);
    setCustomerName('');
    setSendError('');
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const vat = subtotal * VAT_RATE;
  const total = subtotal + vat;

  // NOTE(backend): the Order model still requires paymentMethod at
  // creation time (it's a non-optional field on the schema) — since this
  // flow no longer collects one, the create payload below omits it, which
  // the stub /orders/register endpoint will need to account for once it's
  // built (either make paymentMethod optional at creation, or default it
  // server-side, e.g. to a placeholder until Payment is actually taken).
  const submitOrder = async (status) => {
    if (cart.length === 0) {
      setSendError('Add at least one item before sending this order.');
      return;
    }
    setSending(true);
    setSendError('');
    try {
      const order = await createRegisterOrder({
        orderType,
        tableNumber: orderType === 'dine-in' ? tableNumber : undefined,
        customerName,
        items: cart.map((item) => ({ productId: item.productId, quantity: item.quantity })),
        notes,
        status,
      });
      clearOrder();
      navigate(`/orders/${order._id}`);
    } catch (err) {
      setSendError(
        err?.response?.status === 404
          ? "Order creation isn't connected to a backend endpoint yet — this screen is fully built and will work once /orders/register exists."
          : err?.response?.data?.message || 'Could not send this order.',
      );
    } finally {
      setSending(false);
    }
  };

  const handleSendToKitchen = () => submitOrder('preparing');

  return (
    <>
      <PageHeader
        eyebrow="Front of House"
        title="Register"
        subtitle={`Cashier: ${user?.name || 'Unknown'}`}
      />
      <div className="register-page">
        <div className="register-order-panel">
          <div className="register-row">
            <div>
              <div className="register-label">Order Type</div>
              <div className="order-type-toggle">
                <button
                  type="button"
                  className={`order-type-toggle__btn${orderType === 'dine-in' ? ' is-active' : ''}`}
                  onClick={() => setOrderType('dine-in')}
                >
                  Dine-In
                </button>
                <button
                  type="button"
                  className={`order-type-toggle__btn${orderType === 'takeout' ? ' is-active' : ''}`}
                  onClick={() => setOrderType('takeout')}
                >
                  Take-Away
                </button>
              </div>
            </div>

            {orderType === 'dine-in' && (
              <div>
                <div className="register-label">Table</div>
                <select
                  className="table-input"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                >
                  {TABLE_NUMBERS.map((n) => (
                    <option key={n} value={n}>
                      Table {n}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="register-label" style={{ marginTop: '1.2rem' }}>
            Categories
          </div>
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
          ) : (
            <div className="item-grid">
              {products.map((product) => (
                <div className="item-card" key={product._id}>
                  {product.image ? (
                    <img className="item-card__thumb" src={product.image} alt={product.name} />
                  ) : (
                    <div className="item-card__thumb item-card__thumb--empty">☕</div>
                  )}
                  <div className="item-card__name">{product.name}</div>
                  <div className="item-card__foot">
                    <span className="item-card__price">{formatCurrency(product.price)}</span>
                    <button
                      type="button"
                      className="btn btn-ghost btn-small"
                      onClick={() => addToCart(product)}
                    >
                      + Add
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="register-cart-panel">
          <div className="register-cart-head">
            <h3 className="register-cart-head__title">Current Order</h3>
            <span className="register-cart-head__order-num">Order #</span>
          </div>

          <div className="cart-list">
            {cart.length === 0 && <p className="empty-state">Tap "+ Add" to start this order.</p>}
            {cart.map((item) => (
              <div className="cart-row cart-row--with-thumb" key={item.productId}>
                {item.image ? (
                  <img className="cart-row__thumb" src={item.image} alt={item.name} />
                ) : (
                  <div className="cart-row__thumb cart-row__thumb--empty" />
                )}
                <div className="cart-row__body">
                  <span className="cart-row__name">{item.name}</span>
                  <div className="qty-stepper">
                    <button
                      type="button"
                      onClick={() => changeQty(item.productId, -1)}
                      aria-label={`Decrease ${item.name} quantity`}
                    >
                      −
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => changeQty(item.productId, 1)}
                      aria-label={`Increase ${item.name} quantity`}
                    >
                      +
                    </button>
                  </div>
                </div>
                <span className="cart-row__total">
                  {formatCurrency(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="register-cart-panel__spacer" />

          <div className="cart-summary">
            <div className="cart-summary__row">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="cart-summary__row">
              <span>VAT (12% incl.)</span>
              <span>{formatCurrency(vat)}</span>
            </div>
            <div className="cart-summary__row cart-summary__row--total">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>

          <div className="register-label">Notes / Special Instructions</div>
          <textarea
            className="notes-input"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            style={{ resize: 'none' }}
          />

          {sendError && <div className="form-error">{sendError}</div>}

          <div className="register-actions">
            <button type="button" className="btn btn-ghost" disabled={sending} onClick={clearOrder}>
              Clear Order
            </button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={sending}
              onClick={handleSendToKitchen}
            >
              {sending ? 'Sending...' : 'Send to Kitchen'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default RegisterPage;
