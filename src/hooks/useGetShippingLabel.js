import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getShipmentLabelThunk } from '../containers/TransactionPage/TransactionPage.duck';
import { isFulfilled } from '@reduxjs/toolkit';

/**
 * Hook to get shipping label details for a transaction
 * Because after initiateOrder, the shipping label is created but not available immediately
 * so we need to poll for the shipping label details
 * @param {string} txId - The ID of the transaction
 * @returns {Object} - The shipping label details
 */

const useGetShippingLabel = ({ txId, skipPolling = false }) => {
  const { shipmentLabelUrl, linkTraceTraceUrl } = useSelector(state => state.TransactionPage);
  const dispatch = useDispatch();
  const intervalRef = useRef(null);
  const transactionUuid = txId?.uuid;
  const errorCountRef = useRef(0);

  useEffect(() => {
    if (transactionUuid && !shipmentLabelUrl && !skipPolling) {
      // Clear any existing interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      // Start polling for shipping label details
      intervalRef.current = setInterval(async () => {
        // Check if shipping label details are now available
        const hasEnoughData = !!shipmentLabelUrl;
        if (hasEnoughData) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        } else {
          // Fetch shipping label details if not available
          const success = await isFulfilled(dispatch(getShipmentLabelThunk(transactionUuid)));
          if (!success) {
            errorCountRef.current += 1;
            if (errorCountRef.current > 5) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
          }
        }
      }, 5000);
    }

    // Cleanup function
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [transactionUuid, shipmentLabelUrl, dispatch]);

  // Return the shipping label URL for convenience
  return { shipmentLabelUrl, linkTraceTraceUrl };
};

export default useGetShippingLabel;
