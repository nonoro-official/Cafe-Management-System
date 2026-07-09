const KioskMenuItemCard = ({ item, quantity = 0, onAdd, onRemove }) => {
  const hasQuantity = quantity > 0;

  return (
    <article className={`kiosk-dashboard__item${hasQuantity ? ' kiosk-dashboard__item--selected' : ''}`}>
      <button
        type="button"
        className="kiosk-dashboard__item-button"
        onClick={onAdd}
        aria-label={`Add ${item.name} to order`}
      >
        <div className="kiosk-dashboard__item-media">
          {item.image ? (
            <img className="kiosk-dashboard__item-image" src={item.image} alt="" />
          ) : (
            <span className="kiosk-dashboard__item-placeholder">{item.name}</span>
          )}
        </div>
      </button>

      {hasQuantity && (
        <div className="kiosk-dashboard__item-controls">
          <button
            type="button"
            className="kiosk-dashboard__item-control"
            onClick={onRemove}
            aria-label={`Remove one ${item.name}`}
          >
            −
          </button>
          <span className="kiosk-dashboard__item-quantity">{quantity}</span>
          <button
            type="button"
            className="kiosk-dashboard__item-control"
            onClick={onAdd}
            aria-label={`Add one ${item.name}`}
          >
            +
          </button>
        </div>
      )}
    </article>
  );
};

export default KioskMenuItemCard;
