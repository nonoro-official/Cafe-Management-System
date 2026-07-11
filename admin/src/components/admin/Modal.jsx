const Modal = ({ title, onClose, children }) => {
  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-card">
        <div className="modal-card__head">
          <h2>{title}</h2>
          <button type="button" className="modal-card__close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;
