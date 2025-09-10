import { Product } from '@/types/api';
import { ProductCardAccordion } from './ProductCardAccordion';

interface ProductListProps {
  products: Product[];
  onDeleteProduct: (productId: number) => void;
  onEditProduct?: (product: Product) => void;
}

export function ProductList({ products, onDeleteProduct, onEditProduct }: ProductListProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-8 sm:py-12 mx-3 sm:mx-4">
        <p className="text-gray-500 text-base sm:text-lg">Продукты не найдены</p>
        <p className="text-gray-400 text-xs sm:text-sm mt-1 sm:mt-2">Добавьте продукты, используя форму выше</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 sm:space-y-3 mx-2 sm:mx-3 lg:mx-4">
      {products.map((product) => (
        <ProductCardAccordion
          key={product.id}
          product={product}
          onDelete={onDeleteProduct}
          onEdit={onEditProduct}
        />
      ))}
    </div>
  );
}
