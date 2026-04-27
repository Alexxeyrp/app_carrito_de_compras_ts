import { useEffect, useMemo, useState } from "react";
import ZonaProductos from "./components/ZonaProductos.js";
import db from "./data/db.json";
import type { CartItem, Producto as ProductoType } from "./types";

function App() {
  const inicialCart = (): CartItem[] => {
    try {
      const localStorageCart = localStorage.getItem("cart");
      return localStorageCart ? JSON.parse(localStorageCart) : [];
    } catch {
      localStorage.removeItem("cart");
      return [];
    }
  };

  const [data] = useState<ProductoType[]>(db);
  const [cart, setCart] = useState<CartItem[]>(inicialCart);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  function addToCart(item: ProductoType) {
    const itemExist = cart.findIndex((producto) => producto.name === item.name);

    if (itemExist >= 0) {
      const updatedCart = [...cart];
      updatedCart[itemExist] = {
        ...updatedCart[itemExist],
        quantity: updatedCart[itemExist].quantity + 1,
      };
      setCart(updatedCart);
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  }

  const isEmpty = useMemo(() => cart.length === 0, [cart]);
  const cartTotal = useMemo(
    () => cart.reduce((total, item) => total + item.price * item.quantity, 0),
    [cart],
  );

  function removerFromCart(prductName: CartItem["name"]) {
    setCart((prevCart) =>
      prevCart.filter((producto) => producto.name !== prductName),
    );
  }

  function increaseQuantity(prductName: CartItem["name"]) {
    const updatedCart = cart.map((producto) => {
      if (producto.name === prductName && producto.quantity < 10) {
        return { ...producto, quantity: producto.quantity + 1 };
      }
      return producto;
    });
    setCart(updatedCart);
  }

  function decreaseQuantity(prductName: CartItem["name"]) {
    const updatedCart = cart.map((producto) => {
      if (producto.name === prductName && producto.quantity > 1) {
        return { ...producto, quantity: producto.quantity - 1 };
      }
      return producto;
    });
    setCart(updatedCart);
  }

  function clearCart() {
    setCart([]);
  }

  return (
    <>
      <div className="container">
        <p className="h1 mt-5">Desserts</p>

        <div className="row">
          <div className="col-8">
            <div className="row g-3 my-3" id="contenedorProducto">
              {/* ZONA PRODUCTOS */}
              {data.map((producto) => (
                <ZonaProductos
                  producto={producto}
                  key={producto.name}
                  addToCart={addToCart}
                />
              ))}
            </div>
          </div>

          {/* ZONA CARRITO */}

          <div className="col-4">
            <div className="border p-3 mt-3" id="panelCarrito">
              {isEmpty ? (
                <h3 className="text-center">El carrito esta vacio</h3>
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
                          className="btn btn-dark "
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
                    Total:{" "}
                    <span id="totalCarrito">${cartTotal.toFixed(2)}</span>
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
    </>
  );
}

export default App;
