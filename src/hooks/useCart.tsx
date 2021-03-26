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
      const productInCart = cart.find(product => product.id === productId);

      if (productInCart) {
        const productAmount = productInCart.amount + 1;
        
        const productInStock = (await api.get<Stock>(`stock/${productId}`)).data;
        
        if (productAmount > productInStock.amount) {
          toast.error('Quantidade solicitada fora de estoque');
          return;
        }

        let newCart = cart.filter(product => product.id !== productId)
        productInCart.amount = productAmount;
        newCart = [...newCart, productInCart]

        localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart));

        setCart(newCart);

        return;
      }

      const productDetails = (await api.get<Product>(`products/${productId}`)).data;
        
      setCart(oldCart => {
        const newCart = [...oldCart, {...productDetails, amount: 1}];

        localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart));

        return newCart;
      });
    } catch {
      toast.error('Erro na adição do produto');
    }
  };

  const removeProduct = (productId: number) => {
    try {
      if (cart.findIndex(product => product.id === productId) < 0) {
        throw new Error();
      }

      const products = cart.filter(product => product.id !== productId)

      setCart(products);
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(products));
    } catch {
      toast.error('Erro na remoção do produto');
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      if (amount <= 0) {
        return;
      }

      const inStock = (await api.get(`/stock/${productId}`)).data;

      if (amount > inStock.amount) {
        toast.error('Quantidade solicitada fora de estoque');
        return;
      }

      const productIndex = cart.findIndex(product => product.id === productId)
      cart[productIndex].amount = amount;

      setCart([...cart])
      setCart(state => {
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(state));
        return state;
      })
    } catch {
      toast.error('Erro na alteração de quantidade do produto');
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
