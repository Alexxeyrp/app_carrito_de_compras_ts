export type ProductProps = {
  producto: Producto;
  addToCart: (item: Producto) => void;
};

export type Producto = {
  id: number;
  name: string;
  category: string;
  price: number;
  image: {
    thumbnail: string;
    desktop: string;
  };
};

export type CartItem = Producto & {
  quantity: number;
};
