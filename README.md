# Product List with Cart - React + TypeScript

Aplicacion de carrito de compras desarrollada como una mejora de un ejercicio de Frontend Mentor. El proyecto comenzo como una solucion en JavaScript, luego fue adaptado a React y finalmente migrado a React con TypeScript para reforzar el tipado, la organizacion de componentes y el manejo de estado.

El objetivo de esta version es mostrar mi progreso como desarrollador frontend junior: convertir una maqueta/interaccion estatica en una aplicacion dinamica, reutilizable y mas cercana a un flujo real de ecommerce.

## Que hace la app

- Renderiza una lista de productos de forma dinamica desde un archivo JSON.
- Permite agregar productos al carrito.
- Si el producto ya existe en el carrito, aumenta su cantidad en lugar de duplicarlo.
- Permite incrementar y disminuir cantidades.
- Permite eliminar productos individuales del carrito.
- Calcula el total de la compra en tiempo real.
- Permite vaciar el carrito completo.
- Guarda el carrito en `localStorage`, por lo que la seleccion se mantiene al recargar la pagina.
- Maneja de forma segura posibles errores al leer datos guardados en `localStorage`.

## Tecnologias usadas

- React
- TypeScript
- Vite
- CSS
- Bootstrap
- JSON como fuente de datos local
- LocalStorage para persistencia del carrito
- ESLint para mantener calidad de codigo

## Aprendizajes aplicados

Este proyecto me ayudo a practicar conceptos importantes de desarrollo frontend:

- Creacion de componentes reutilizables.
- Paso de datos y funciones mediante props.
- Manejo de estado con `useState`.
- Efectos secundarios con `useEffect`.
- Calculos derivados con `useMemo`.
- Tipado de productos, props y elementos del carrito con TypeScript.
- Renderizado dinamico usando `.map()`.
- Actualizacion inmutable de arrays y objetos.
- Separacion de responsabilidades entre datos, tipos y componentes.
- Persistencia basica de informacion en el navegador.

## Estructura principal

```txt
src/
+-- components/
|   +-- ZonaProductos.tsx
+-- data/
|   +-- db.json
+-- types/
|   +-- index.ts
+-- App.tsx
+-- index.css
+-- main.tsx
```

## Como ejecutar el proyecto

1. Instalar dependencias:

```bash
npm install
```

2. Iniciar el servidor de desarrollo:

```bash
npm run dev
```

3. Crear una version de produccion:

```bash
npm run build
```

4. Revisar reglas de lint:

```bash
npm run lint
```

## Detalles tecnicos destacados

El carrito se inicializa leyendo la informacion almacenada en `localStorage`. Si no hay datos guardados, comienza como un array vacio. Tambien se incluye un bloque `try/catch` para limpiar el almacenamiento si los datos no se pueden parsear correctamente.

Las cantidades y el total se calculan a partir del estado del carrito. Para evitar calculos innecesarios, el proyecto usa `useMemo` en valores derivados como el estado vacio del carrito y el total de la compra.

Los tipos `Producto`, `CartItem` y `ProductProps` ayudan a documentar la forma de los datos y reducen errores comunes al trabajar con props, productos y cantidades.

## Posibles mejoras futuras

- Mejorar el diseno responsive para que el carrito y los productos se adapten mejor a mobile.
- Crear un modal de confirmacion de pedido.
- Agregar imagenes responsive usando las versiones mobile, tablet y desktop disponibles en los assets.
- Mostrar la cantidad total de unidades del carrito, no solo la cantidad de productos distintos.
- Separar la logica del carrito en un custom hook como `useCart`.
- Agregar tests unitarios para las operaciones del carrito.
- Mejorar la accesibilidad de botones e imagenes.
- Agregar estados visuales para productos ya agregados al carrito.

## Sobre el proyecto

Este proyecto representa una refactorizacion progresiva: parti de un ejercicio frontend y lo lleve hacia una implementacion mas escalable con React y TypeScript. Mi foco estuvo en entender la logica del carrito, mejorar la estructura del codigo y aplicar buenas practicas que se esperan en proyectos frontend modernos.
