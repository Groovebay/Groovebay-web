import { updateShippingAddressThunk } from '../components/ShippingAddressForm/ShippingAddressForm.duck';
import { useDispatch, useSelector } from 'react-redux';

const useUpdateShippingAddress = () => {
  const dispatch = useDispatch();
  const {
    updateShippingAddressError,
    updateShippingAddressInProgress,
    invalidAddress,
  } = useSelector(state => state.ShippingAddressForm);

  const onUpdateShippingAddress = address => {
    return dispatch(updateShippingAddressThunk(address));
  };

  return {
    onUpdateShippingAddress,
    updateShippingAddressError,
    updateShippingAddressInProgress,
    invalidAddress,
  };
};

export default useUpdateShippingAddress;
