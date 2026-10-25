import type { CartItem } from "../types";

type OrderConfirmationProps = {
  orderId: number;
  total: number;
  items: CartItem[];
  onClose: () => void;
};

export default function OrderConfirmation({
  orderId,
  total,
  items,
  onClose,
}: OrderConfirmationProps) {
  return (
    <div className="order-overlay">
      <div
        className="order-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-title"
      >
        <div className="order-success-icon" aria-hidden="true">
          ✓
        </div>

        <h2 id="order-title">¡Pedido confirmado!</h2>

        <p className="order-subtitle">
          Tu pedido de demostración #{orderId} se ha registrado correctamente.
        </p>

        <div className="order-summary">
          {items.map((item) => (
            <div className="order-summary-item" key={item.id}>
              <img src={item.image.thumbnail} alt="" />

              <div className="order-summary-info">
                <strong>{item.name}</strong>
                <span>
                  {item.quantity} × ${item.price.toFixed(2)}
                </span>
              </div>

              <strong>${(item.quantity * item.price).toFixed(2)}</strong>
            </div>
          ))}

          <div className="order-summary-total">
            <span>Total del pedido</span>
            <strong>${total.toFixed(2)}</strong>
          </div>
        </div>

        <button type="button" className="order-new-button" onClick={onClose}>
          Realizar nuevo pedido
        </button>
      </div>
    </div>
  );
}
