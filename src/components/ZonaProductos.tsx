import type { ProductProps } from "../types";

export default function ZonaProductos({ producto, addToCart }: ProductProps) {
  const { name, category, price, image } = producto;

  return (
    <>
      <div className="col-12 col-sm-6 col-xl-4 producto-card">
        <div className="card h-100">
          <img
            src={image.desktop}
            className="card-img-top producto-imagen"
            alt={name}
            loading="lazy"
            decoding="async"
          />
          <div className="card-body d-flex flex-column">
            <p className="producto-categoria">{category}</p>

            <h3 className="producto-nombre">{name}</h3>

            <p className="producto-precio">${price.toFixed(2)}</p>

            <button
              type="button"
              className="btn btn-primary mt-auto align-self-start"
              onClick={() => addToCart(producto)}
            >
              Agregar al carrito
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
