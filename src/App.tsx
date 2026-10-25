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
        <div className="col-8">
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
        <div className="col-4">
          <div className="border p-3 mt-3" id="panelCarrito">
            {isEmpty ? (
              <h3 className="text-center">El carrito está vacío</h3>
            ) : (
              <>
                <h4>
                  Carrito
                  <span id="cantidadCarrito"> {cart.length}</span>
                </h4>

                {cart.map((producto) => (
                  <div key={producto.name} id="contenedorCarrito">
                    <div className="d-flex gap-2">
                      <span>{producto.name}</span>

                      <button
                        className="btn btn-dark"
                        onClick={() => increaseQuantity(producto.name)}
                      >
                        +
                      </button>

                      <button
                        className="btn btn-dark"
                        onClick={() => decreaseQuantity(producto.name)}
                      >
                        -
                      </button>

                      <button
                        className="btn btn-danger"
                        onClick={() => removerFromCart(producto.name)}
                      >
                        x
                      </button>

                      <span className="float-end">
                        ${(producto.price * producto.quantity).toFixed(2)}
                      </span>
                    </div>

                    <div>Cantidad: {producto.quantity}</div>
                  </div>
                ))}

                <p className="mt-3 mb-0">
                  Total: <span id="totalCarrito">${cartTotal.toFixed(2)}</span>
                </p>

                <button
                  className="btn btn-dark w-100 mt-3 p-2"
                  onClick={clearCart}
                >
                  Vaciar Carrito
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
