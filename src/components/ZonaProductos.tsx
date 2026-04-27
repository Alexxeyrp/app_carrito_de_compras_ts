import type { ProductProps } from '../types';

export default function ZonaProductos({ producto, addToCart }: ProductProps) {
  const { name, category, price, image } = producto;

  return (
    <>
      <div className="col-4 producto-card">
        <div className="card h-100">
          <img src={`${image.thumbnail}`} className="card-img-top" alt={name} />
          <div className="card-body">
            <h5 className="card-title">{name}</h5>
            <p className="card-text">{category}</p>
            <p className="card-text">${price.toFixed(2)}</p>
            <button className="btn btn-primary"
            onClick={() => addToCart(producto)}
            >Agregar</button>
          </div>

          
        </div>
      </div>

      
    </>
  );
}
