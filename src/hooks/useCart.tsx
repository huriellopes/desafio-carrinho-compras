import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart')

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      const productDetails = (await api.get(`/products/${productId}`)).data;
      const inStock = (await api.get(`/stock/${productId}`)).data;
      const amountInCartUpdate = cart.findIndex(product => product.id === productId);

      if (inStock.amount === cart[amountInCartUpdate]?.amount) {
        toast.error('Quantidade solicitada fora de estoque');
        return;
      }

      if (amountInCartUpdate >= 0) {
        cart[amountInCartUpdate].amount += 1;
        setCart(cart);
      } else {
        setCart([...cart, {...productDetails, amount: 1}]);
      }

      setCart(state => {
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(state));

        return [...state];
      })
    } catch {
      toast.error('Erro na adição do produto');
    }
  };

  const removeProduct = (productId: number) => {
    try {
      // TODO
    } catch {
      // TODO
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      // TODO
    } catch {
      // TODO
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
