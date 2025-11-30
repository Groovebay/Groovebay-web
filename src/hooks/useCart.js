import { useDispatch, useSelector } from 'react-redux';
import { updateCartThunk } from '../ducks/cart.duck';

const useCart = () => {
  const dispatch = useDispatch();
  const cart = useSelector(state => state.cart.cart);
  const updateCartInProgress = useSelector(state => state.cart.updateCartInProgress);
  const updateCartError = useSelector(state => state.cart.updateCartError);

  const updateCart = params => {
    return dispatch(updateCartThunk(params));
  };

  const getTotalCartCount = () => {
    return Object.values(cart).reduce(
      (acc, curr) => acc + Object.values(curr).reduce((acc, curr) => acc + curr.quantity, 0),
      0
    );
  };

  return {
    cart,
    updateCartInProgress,
    updateCartError,
    updateCart,
    totalCartCount: getTotalCartCount(cart),
  };
};

export default useCart;
