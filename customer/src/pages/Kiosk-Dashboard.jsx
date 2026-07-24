import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import KioskCategoryBar from '../components/kiosk/KioskCategoryBar.jsx';
import KioskMenuItemCard from '../components/kiosk/KioskMenuItemCard.jsx';
import KioskPageHeader from '../components/kiosk/KioskPageHeader.jsx';
import { useKioskOrder } from '../contexts/KioskOrderContext.jsx';
import { useMenu } from '../contexts/MenuContext.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { APP_NAME } from '../utilities/constants.js';

const KioskDashboard = () => {
  const navigate = useNavigate();
  const {
    orderType,
    activeCategoryId,
    setActiveCategoryId,
    cart,
    cartCount,
    addToCart,
    removeFromCart,
  } = useKioskOrder();
  const { categories, loading, error, reload, getItemsByCategory } = useMenu();

  useDocumentTitle(`${APP_NAME} | Menu`);

  // Select the first category once the live menu has loaded.
  useEffect(() => {
    if (!activeCategoryId && categories.length > 0) {
      setActiveCategoryId(categories[0].id);
    }
  }, [activeCategoryId, categories, setActiveCategoryId]);

  const visibleItems = getItemsByCategory(activeCategoryId);
  const orderTypeLabel = orderType === 'take-out' ? 'Take-out' : 'Dine-in';

  const handlePlaceOrder = () => {
    if (cartCount === 0) {
      return;
    }

    navigate('/kiosk/cart');
  };

  return (
    <div className="kiosk-dashboard kiosk-page">
      <div className="kiosk-dashboard__top">
        <header className="kiosk-dashboard__header">
          <KioskPageHeader
            eyebrow={orderTypeLabel}
            title="Our Menu"
            subtitle="Tap an item to add it to your order"
          />
        </header>

        <KioskCategoryBar
          categories={categories}
          activeCategoryId={activeCategoryId}
          onSelect={setActiveCategoryId}
        />
      </div>

      <div className="kiosk-dashboard__grid-wrap">
        {loading ? (
          <p className="kiosk-dashboard__status">Loading the menu…</p>
        ) : error ? (
          <div className="kiosk-dashboard__status">
            <p>{error}</p>
            <button type="button" className="kiosk-btn-secondary" onClick={reload}>
              Try again
            </button>
          </div>
        ) : visibleItems.length === 0 ? (
          <p className="kiosk-dashboard__status">No items available in this category yet.</p>
        ) : (
          <div className="kiosk-dashboard__grid">
            {visibleItems.map((item) => (
              <KioskMenuItemCard
                key={item.id}
                item={item}
                quantity={cart[item.id] ?? 0}
                onAdd={() => addToCart(item.id)}
                onRemove={() => removeFromCart(item.id)}
              />
            ))}
          </div>
        )}
      </div>

      <footer className="kiosk-dashboard__footer">
        <button
          type="button"
          className="kiosk-dashboard__place-order"
          onClick={handlePlaceOrder}
          disabled={cartCount === 0}
          aria-label={cartCount > 0 ? `Place order with ${cartCount} items` : 'Add items before placing order'}
        >
          <span>Place Order</span>
          {cartCount > 0 && <span className="kiosk-dashboard__cart-badge">{cartCount}</span>}
        </button>
      </footer>
    </div>
  );
};

export default KioskDashboard;
