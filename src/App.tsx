import { useEffect, useMemo, useState } from "react";
import ZonaProductos from "./components/ZonaProductos";
import type { CartItem, Producto as ProductoType } from "./types";

const API_URL = "http://localhost/carrito-api/api/products.php";

function App() {
  // Recuperar carrito guardado
  const inicialCart = (): CartItem[] => {
    try {
      const storedCart = localStorage.getItem("cart");
      return storedCart ? JSON.parse(storedCart) : [];
    } catch {
      localStorage.removeItem("cart");
      return [];
    }
  };

  // Estados
  const [data, setData] = useState<ProductoType[]>([]);
  const [cart, setCart] = useState<CartItem[]>(inicialCart);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Obtener productos desde PHP
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

        if (!Array.isArray(products)) {
          throw new Error("La API no devolvió una lista");
        }

        if (!controller.signal.aborted) {
          setData(products as ProductoType[]);
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

  // Persistencia del carrito
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // Añadir producto
  function addToCart(item: ProductoType) {
    setCart((prevCart) => {
      const itemExist = prevCart.find(
        (producto) => producto.name === item.name,
      );

      if (itemExist) {
        return prevCart.map((producto) =>
          producto.name === item.name
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

  // Cálculos del carrito
  const isEmpty = cart.length === 0;

  const cartTotal = useMemo(
    () => cart.reduce((total, item) => total + item.price * item.quantity, 0),
    [cart],
  );

  // Eliminar producto
  function removerFromCart(productName: CartItem["name"]) {
    setCart((prevCart) =>
      prevCart.filter((producto) => producto.name !== productName),
    );
  }

  // Aumentar cantidad
  function increaseQuantity(productName: CartItem["name"]) {
    setCart((prevCart) =>
      prevCart.map((producto) =>
        producto.name === productName && producto.quantity < 10
          ? { ...producto, quantity: producto.quantity + 1 }
          : producto,
      ),
    );
  }

  // Disminuir cantidad
  function decreaseQuantity(productName: CartItem["name"]) {
    setCart((prevCart) =>
      prevCart.map((producto) =>
        producto.name === productName && producto.quantity > 1
          ? { ...producto, quantity: producto.quantity - 1 }
          : producto,
      ),
    );
  }

  // Vaciar carrito
  function clearCart() {
    setCart([]);
  }

  return (
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
                  key={producto.name}
                  producto={producto}
                  addToCart={addToCart}
                />
              ))}
          </div>
        </div>

        {/* ZONA CARRITO */}

{/* ZONA CARRITO */}
<div className="col-12 col-lg-4">
  <aside className="carrito-panel" id="panelCarrito">
    <div className="carrito-header">
      <h2>
        Tu carrito (
        {cart.reduce((total, item) => total + item.quantity, 0)}
        )
      </h2>
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
        <div className="carrito-productos">
          {cart.map((producto) => (
            <div className="carrito-item" key={producto.name}>
              <div className="carrito-item-header">
                <h3>{producto.name}</h3>

                <button
                  type="button"
                  className="carrito-eliminar"
                  onClick={() => removerFromCart(producto.name)}
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
                    onClick={() => decreaseQuantity(producto.name)}
                    disabled={producto.quantity <= 1}
                    aria-label={`Reducir cantidad de ${producto.name}`}
                  >
                    −
                  </button>

                  <span>{producto.quantity}</span>

                  <button
                    type="button"
                    onClick={() => increaseQuantity(producto.name)}
                    disabled={producto.quantity >= 10}
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

        <div className="carrito-resumen">
          <div className="carrito-total">
            <span>Total del pedido</span>
            <strong id="totalCarrito">
              ${cartTotal.toFixed(2)}
            </strong>
          </div>

          <div className="carrito-info">
            <span aria-hidden="true">✓</span>
            <p>Revisa tus productos antes de confirmar.</p>
          </div>

          <button
            type="button"
            className="carrito-vaciar"
            onClick={clearCart}
          >
            Vaciar carrito
          </button>
        </div>
      </>
    )}
  </aside>
</div>

      </div>
    </div>
  );
}

export default App;
