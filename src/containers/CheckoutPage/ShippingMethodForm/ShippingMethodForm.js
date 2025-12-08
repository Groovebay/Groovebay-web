import React from 'react';
import css from './ShippingMethodForm.module.css';
import Spinner from '../../../components/IconSpinner/IconSpinner';
import classNames from 'classnames';
import { PrimaryButton } from '../../../components';
import { FormattedMessage, useIntl } from '../../../util/reactIntl';
import { formatMoneyFromNumber } from '../../../util/currency';
import IconCarrier from '../../../components/IconCarrier/IconCarrier';

/**
 * @param {Object} props
 * @param {Object[]} props.shippingRates
 * @param {boolean} props.getShippingRatesInProgress
 * @param {Object} props.getShippingRatesError
 * @param {Function} props.onSelectShippingRate
 * @param {Object} props.selectedShippingRate
 * @param {Function} props.onNextStep - The function to call when the next step is clicked
 * @param {boolean} props.disabledNextStep - Whether the next step is disabled
 */
const ShippingMethodForm = ({
  shippingRates,
  getShippingRatesInProgress,
  onSelectShippingRate,
  selectedShippingRate,
  onNextStep,
  disabledNextStep,
}) => {
  const intl = useIntl();

  if (getShippingRatesInProgress) {
    return <Spinner />;
  }
  console.log({ shippingRates });
  return (
    <div className={css.ratesContainer}>
      {shippingRates.length === 0 ? (
        <div className={css.noRates}>
          <FormattedMessage id="ShippingMethodForm.noRates" />
        </div>
      ) : (
        shippingRates.map(rate => (
          <div
            role="button"
            key={rate.id}
            className={classNames(css.rate, {
              [css.selected]: selectedShippingRate?.id === rate.id,
            })}
            onClick={() => onSelectShippingRate(rate)}
          >
            <div className={css.rateHeader}>
              <div className={css.rateIconContainer}>
                <IconCarrier carrier={rate.carrier} className={css.rateIcon} />
              </div>
              <div className={css.rateDetails}>
                <div className={css.rateName}>
                  <span>{rate.carrier.label}</span>

                  {rate.service && <span className={css.rateServiceLevel}>({rate.service})</span>}
                </div>
                <div className={css.rateDuration}>{rate.description}</div>
              </div>
            </div>
            <div className={css.ratePrice}>
              {formatMoneyFromNumber(intl, { amount: rate.price / 100, currency: rate.currency })}
            </div>
          </div>
        ))
      )}
      <PrimaryButton
        type="submit"
        disabled={disabledNextStep || selectedShippingRate === null}
        className={css.submitButton}
        onClick={onNextStep}
      >
        <FormattedMessage id="ShippingMethodForm.submit" />
      </PrimaryButton>
    </div>
  );
};

export default ShippingMethodForm;
