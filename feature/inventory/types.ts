export type InventoryTabKey = 'categorias' | 'productos' | 'movimientos';

export interface PaginationMeta {
  total: number;
  page: number;
  pageSize: number;
}

export interface CategoryItem {
  id: string;
  nombre: string;
  descripcion?: string;
  productCount: number;
}

export interface CategoryApiItem {
  id: string;
  nombre: string;
  descripcion?: string;
  productos?: { id: string }[];
}

export interface ProductItem {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  categoria: string;
  categoriaId: string;
  stock: number;
  precio: number;
  imagen?: string;
  estado: 'stock' | 'agotado';
}

export interface ProductApiItem {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  precio: string | number;
  stock: string | number;
  categoria_id: string;
  categoria?: {
    id: string;
    nombre: string;
    descripcion?: string;
  };
  imagen?: string;
}

export interface InventoryMovement {
  id: string;
  fecha: string;
  producto: string;
  producto_id?: string;
  tipo: 'entrada' | 'salida';
  cantidad: number;
  motivo: string;
  stockActual: number;
  stock_antes?: number;
  stock_despues?: number;
  usuario_id?: string;
  usuario_nombre?: string;
}

export interface MovementApiItem {
  id: string;
  fecha: string;
  tipo: 'entrada' | 'salida';
  cantidad: string | number;
  motivo: string;
  observacion?: string;
  producto_id: string;
  stock_antes?: string | number;
  stock_despues?: string | number;
  producto?: {
    id: string;
    nombre: string;
  };
  usuario_id?: string;
  usuario?: {
    id: string;
    nombre: string;
    apellido?: string;
  };
}

export type CreateProductPayload = {
  codigo: string;
  nombre: string;
  categoria_id: string;
  precio: number;
  stock: number;
  descripcion?: string;
  imagen?: string;
};

export type UpdateProductPayload = Partial<CreateProductPayload>;
