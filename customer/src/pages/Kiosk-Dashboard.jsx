import { useNavigate } from 'react-router-dom';
import KioskCategoryBar from '../components/kiosk/KioskCategoryBar.jsx';
import KioskMenuItemCard from '../components/kiosk/KioskMenuItemCard.jsx';
import { useKioskOrder } from '../contexts/KioskOrderContext.jsx';
import { kioskCategories, getMenuItemsByCategory } from '../data/kioskMenu.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { APP_NAME } from '../utilities/constants.js';

const KioskDashboard = () => {
  const navigate = useNavigate();
  const {
    activeCategoryId,
    setActiveCategoryId,
    cart,
    cartCount,
    addToCart,
    removeFromCart,
  } = useKioskOrder();

  useDocumentTitle(`${APP_NAME} | Menu`);

  const visibleItems = getMenuItemsByCategory(activeCategoryId);

  const handlePlaceOrder = () => {
    if (cartCount === 0) {
      return;
    }

    navigate('/kiosk/cart');
  };

  return (
    <div className="kiosk-dashboard">
      <KioskCategoryBar
        categories={kioskCategories}
        activeCategoryId={activeCategoryId}
        onSelect={setActiveCategoryId}
      />

      <div className="kiosk-dashboard__grid-wrap">
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
      </div>

      <button
        type="button"
        className="kiosk-dashboard__place-order"
        onClick={handlePlaceOrder}
        disabled={cartCount === 0}
        aria-label={cartCount > 0 ? `Place order with ${cartCount} items` : 'Add items before placing order'}
      >
        Place Order{cartCount > 0 ? ` (${cartCount})` : ''}
      </button>
    </div>
  );
};

export default KioskDashboard;
