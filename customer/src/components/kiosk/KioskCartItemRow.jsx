const formatPrice = (price) => `$${(price ?? 0).toFixed(2)}`;

const KioskCartItemRow = ({ item, quantity, onAdd, onRemove }) => {
  const linePrice = (item.price ?? 0) * quantity;

  return (
    <article className="kiosk-cart__item">
      <div className="kiosk-cart__item-media" aria-hidden={!item.image}>
        {item.image ? (
          <img className="kiosk-cart__item-image" src={item.image} alt="" />
        ) : (
          <span className="kiosk-cart__item-placeholder" />
        )}
      </div>

      <div className="kiosk-cart__item-details">
        <p className="kiosk-cart__item-name">{item.name}</p>

        <div className="kiosk-cart__item-controls">
          <button
            type="button"
            className="kiosk-cart__item-control"
            onClick={onRemove}
            aria-label={`Remove one ${item.name}`}
          >
            −
          </button>
          <span className="kiosk-cart__item-quantity">{quantity}</span>
          <button
            type="button"
            className="kiosk-cart__item-control"
            onClick={onAdd}
            aria-label={`Add one ${item.name}`}
          >
            +
          </button>
        </div>
      </div>

      <p className="kiosk-cart__item-price">{formatPrice(linePrice)}</p>
    </article>
  );
};

export default KioskCartItemRow;
