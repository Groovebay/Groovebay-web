import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { getShippingRatesThunk } from '../containers/CheckoutPage/CheckoutPage.duck';

const useGetShippingRates = ({ tx, currentUser, listing }) => {
  const { customer, provider } = tx;
  const customerId = customer?.id?.uuid;
  const providerId = provider?.id?.uuid;
  const dispatch = useDispatch();
  const getShippingRatesInProgress = useSelector(
    state => state.CheckoutPage.getShippingRatesInProgress
  );
  const getShippingRatesError = useSelector(state => state.CheckoutPage.getShippingRatesError);
  const shippingRates = useSelector(state => state.CheckoutPage.shippingRates);
  const providerCart = tx?.attributes?.protectedData?.providerCart;
  const onGetShippingRates = (providerId, customerId, providerCart) => {
    dispatch(getShippingRatesThunk({ providerId, customerId, providerCart }));
  };

  const shippingAddress = currentUser?.attributes?.profile?.protectedData?.shippingAddress || {};
  const { street, city, cc, phone, number, postal_code } = shippingAddress;
  const hasEnoughShippingAddressFields = !!(street && city && cc && phone && number && postal_code);
  useEffect(() => {
    if (
      hasEnoughShippingAddressFields &&
      providerId &&
      customerId &&
      providerCart &&
      shippingRates?.length === 0
    ) {
      onGetShippingRates(providerId, customerId, providerCart);
    }
  }, [
    hasEnoughShippingAddressFields,
    providerId,
    customerId,
    providerCart,
    JSON.stringify(shippingRates),
    JSON.stringify(shippingAddress),
  ]);
  return {
    shippingRates,
    getShippingRatesInProgress,
    getShippingRatesError,
    hasEnoughShippingAddressFields,
  };
};
export default useGetShippingRates;
