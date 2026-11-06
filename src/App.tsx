import { useEffect, useMemo, useState } from "react";
import ZonaProductos from "./components/ZonaProductos";
import OrderConfirmation from "./components/OrderConfirmation";
import { isProducto } from "./lib/products";

import type { CartItem, Producto as ProductoType } from "./types";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "/api").replace(/\/+$/, "");
const API_URL = `${API_BASE_URL}/products.php`;
const ORDERS_URL = `${API_BASE_URL}/orders.php`;

type ConfirmedOrder = {
  order_id: number;
  total: number;
};

function App() {
  // Recuperar el carrito guardado
  const inicialCart = (): CartItem[] => {
    try {
      const storedCart = localStorage.getItem("cart");
      const parsed: unknown = storedCart ? JSON.parse(storedCart) : [];

      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed.filter(
        (item): item is CartItem =>
          isProducto(item) &&
          "quantity" in item &&
          typeof item.quantity === "number" &&
          Number.isInteger(item.quantity) &&
          item.quantity >= 1 &&
          item.quantity <= 10,
      );
    } catch {
      return [];
    }
  };

  // ESTADOS
  const [data, setData] = useState<ProductoType[]>([]);
  const [cart, setCart] = useState<CartItem[]>(inicialCart);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados de confirmación
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<ConfirmedOrder | null>(
    null,
  );
  const [confirmedItems, setConfirmedItems] = useState<CartItem[]>([]);

  // OBTENER PRODUCTOS DESDE PHP
  useEffect(() => {
    const controller = new AbortController();

    const fetchProducts = async () => {
      try {
        const response = await fetch(API_URL, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Error al obtener los productos");
        }

        const products: unknown = await response.json();

        if (!Array.isArray(products) || !products.every(isProducto)) {
          throw new Error("La API devolvió productos con un formato inválido");
        }

        if (!controller.signal.aborted) {
          setData(products);
          setError(null);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          console.error(err);
          setError("No se pudieron cargar los productos.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchProducts();

    return () => controller.abort();
  }, []);

  // GUARDAR CARRITO EN LOCALSTORAGE
  useEffect(() => {
    try {
      localStorage.setItem("cart", JSON.stringify(cart));
    } catch {
      // El carrito sigue funcionando si el navegador bloquea el almacenamiento.
    }
  }, [cart]);

  // AÑADIR PRODUCTOS AL CARRITO
  function addToCart(item: ProductoType) {
    setOrderError(null);

    setCart((prevCart) => {
      const itemExist = prevCart.find((producto) => producto.id === item.id);

      if (itemExist) {
        return prevCart.map((producto) =>
          producto.id === item.id
            ? {
                ...producto,
                quantity: Math.min(producto.quantity + 1, 10),
              }
            : producto,
        );
      }

      return [...prevCart, { ...item, quantity: 1 }];
    });
  }

  // CÁLCULOS DEL CARRITO
  const isEmpty = cart.length === 0;

  const cartQuantity = useMemo(
    () => cart.reduce((total, item) => total + item.quantity, 0),
    [cart],
  );

  const cartTotal = useMemo(
    () => cart.reduce((total, item) => total + item.price * item.quantity, 0),
    [cart],
  );

  // ELIMINAR PRODUCTO
  function removerFromCart(productId: CartItem["id"]) {
    setCart((prevCart) =>
      prevCart.filter((producto) => producto.id !== productId),
    );
  }

  // AUMENTAR CANTIDAD
  function increaseQuantity(productId: CartItem["id"]) {
    setCart((prevCart) =>
      prevCart.map((producto) =>
        producto.id === productId && producto.quantity < 10
          ? { ...producto, quantity: producto.quantity + 1 }
          : producto,
      ),
    );
  }

  // DISMINUIR CANTIDAD
  function decreaseQuantity(productId: CartItem["id"]) {
    setCart((prevCart) =>
      prevCart.map((producto) =>
        producto.id === productId && producto.quantity > 1
          ? { ...producto, quantity: producto.quantity - 1 }
          : producto,
      ),
    );
  }

  // VACIAR CARRITO
  function clearCart() {
    setCart([]);
    setOrderError(null);
  }

  // CONFIRMAR PEDIDO EN PHP Y MYSQL
  async function confirmOrder() {
    if (cart.length === 0 || isSubmitting) return;

    setIsSubmitting(true);
    setOrderError(null);

    const orderItems = cart.map((item) => ({ ...item }));

    try {
      const items = orderItems.map((producto) => ({
        id: producto.id,
        quantity: producto.quantity,
      }));

      // Validar identificadores y cantidades
      if (
        items.some(
          (item) =>
            !Number.isInteger(item.id) ||
            item.id <= 0 ||
            !Number.isInteger(item.quantity) ||
            item.quantity < 1 ||
            item.quantity > 10,
        )
      ) {
        throw new Error(
          "El carrito contiene productos antiguos. Vacíalo y vuelve a añadirlos.",
        );
      }

      const response = await fetch(ORDERS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ items }),
      });

      const result: unknown = await response.json();

      if (!result || typeof result !== "object") {
        throw new Error("La API devolvió una respuesta inválida");
      }

      if (!response.ok) {
        throw new Error(
          "error" in result && typeof result.error === "string"
            ? result.error
            : "No se pudo registrar el pedido",
        );
      }

      if (
        !("order_id" in result) ||
        !Number.isSafeInteger(result.order_id) ||
        Number(result.order_id) <= 0 ||
        !("total" in result) ||
        typeof result.total !== "number" ||
        !Number.isFinite(result.total) ||
        result.total < 0
      ) {
        throw new Error("La API devolvió una confirmación inválida");
      }

      // Guardar una copia de los productos confirmados
      setConfirmedItems(orderItems);

      // Guardar los datos del pedido
      setConfirmedOrder({
        order_id: Number(result.order_id),
        total: Number(result.total),
      });

      // Vaciar carrito después de confirmar
      setCart([]);
    } catch (err) {
      setOrderError(
        err instanceof Error ? err.message : "Ocurrió un error inesperado",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  // CERRAR MODAL DE CONFIRMACIÓN
  function closeOrderConfirmation() {
    setConfirmedOrder(null);
    setConfirmedItems([]);
  }

  return (
    <>
      {/* MODAL INDEPENDIENTE DEL CARRITO */}
      {confirmedOrder && (
        <OrderConfirmation
          orderId={confirmedOrder.order_id}
          total={confirmedOrder.total}
          items={confirmedItems}
          onClose={closeOrderConfirmation}
        />
      )}

      <div className="container">
        <h1 className="mt-5">Desserts</h1>

        <div className="row">
          {/* ZONA PRODUCTOS */}
          <div className="col-12 col-lg-8">
            <div className="row g-3 my-3" id="contenedorProducto">
              {loading && <p role="status">Cargando productos...</p>}

              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              {!loading &&
                !error &&
                data.map((producto) => (
                  <ZonaProductos
                    key={producto.id}
                    producto={producto}
                    addToCart={addToCart}
                    disabled={isSubmitting}
                  />
                ))}
            </div>
          </div>

          {/* ZONA CARRITO */}
          <div className="col-12 col-lg-4">
            <aside className="carrito-panel" id="panelCarrito">
              <div className="carrito-header">
                <h2>Tu carrito ({cartQuantity})</h2>
              </div>

              {isEmpty ? (
                <div className="carrito-vacio">
                  <span className="carrito-vacio-icono" aria-hidden="true">
                    ♡
                  </span>

                  <p>Tu carrito está vacío</p>
                  <span>¡Añade un postre para comenzar!</span>
                </div>
              ) : (
                <>
                  {/* PRODUCTOS DEL CARRITO */}
                  <div className="carrito-productos">
                    {cart.map((producto) => (
                      <div className="carrito-item" key={producto.id}>
                        <div className="carrito-item-header">
                          <h3>{producto.name}</h3>

                          <button
                            type="button"
                            className="carrito-eliminar"
                            onClick={() => removerFromCart(producto.id)}
                            disabled={isSubmitting}
                            aria-label={`Eliminar ${producto.name}`}
                            title="Eliminar producto"
                          >
                            ×
                          </button>
                        </div>

                        <div className="carrito-item-detalles">
                          <div className="carrito-cantidad">
                            <button
                              type="button"
                              onClick={() => decreaseQuantity(producto.id)}
                              disabled={isSubmitting || producto.quantity <= 1}
                              aria-label={`Reducir cantidad de ${producto.name}`}
                            >
                              −
                            </button>

                            <span>{producto.quantity}</span>

                            <button
                              type="button"
                              onClick={() => increaseQuantity(producto.id)}
                              disabled={isSubmitting || producto.quantity >= 10}
                              aria-label={`Aumentar cantidad de ${producto.name}`}
                            >
                              +
                            </button>
                          </div>

                          <div className="carrito-precios">
                            <span className="carrito-precio-unitario">
                              ${producto.price.toFixed(2)} / ud.
                            </span>

                            <strong>
                              ${(producto.price * producto.quantity).toFixed(2)}
                            </strong>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* RESUMEN DEL CARRITO */}
                  <div className="carrito-resumen">
                    <div className="carrito-total">
                      <span>Total del pedido</span>

                      <strong id="totalCarrito">${cartTotal.toFixed(2)}</strong>
                    </div>

                    <div className="carrito-info">
                      <span aria-hidden="true">✓</span>
                      <p>Revisa tus productos antes de confirmar.</p>
                    </div>

                    {/* ERRORES DEL PEDIDO */}
                    {orderError && (
                      <p role="alert" className="text-danger small">
                        {orderError}
                      </p>
                    )}

                    {/* CONFIRMAR PEDIDO */}
                    <button
                      type="button"
                      className="btn-confirmar-pedido"
                      onClick={confirmOrder}
                      disabled={isSubmitting}
                    >
                      {isSubmitting
                        ? "Registrando pedido..."
                        : "Confirmar pedido"}
                    </button>

                    {/* VACIAR CARRITO */}
                    <button
                      type="button"
                      className="carrito-vaciar"
                      onClick={clearCart}
                      disabled={isSubmitting}
                    >
                      Vaciar carrito
                    </button>
                  </div>
                </>
              )}

              {/* Mostrar errores incluso si el carrito está vacío */}
              {isEmpty && orderError && (
                <p role="alert" className="text-danger small mt-3">
                  {orderError}
                </p>
              )}
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
