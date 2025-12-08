import { updateShippingAddressThunk } from '../components/ShippingAddressForm/ShippingAddressForm.duck';
import { useDispatch, useSelector } from 'react-redux';

const useUpdateShippingAddress = () => {
  const dispatch = useDispatch();
  const { updateShippingAddressError, updateShippingAddressInProgress } = useSelector(
    state => state.ShippingAddressForm
  );

  const onUpdateShippingAddress = address => {
    return dispatch(updateShippingAddressThunk(address));
  };

  return {
    onUpdateShippingAddress,
    updateShippingAddressError,
    updateShippingAddressInProgress,
  };
};

export default useUpdateShippingAddress;
