import { useState } from 'react';
import { ShippingAddressFormComponent } from '../../../components/ShippingAddressForm/ShippingAddressForm';
import SavedShippingAddress from './SavedShippingAddress';
import { FormattedMessage } from 'react-intl';
import { PrimaryButton } from '../../../components';
import classNames from 'classnames';
import css from './ShippingDetailsForm.module.css';

/**
 * ShippingAddressForm is a form that allows the user to update their shipping address.
 * It is used in the StripePaymentForm component.
 * @param {Object}  initialValues - The initial values for the form.
 * @param {Function} onSubmit - The function to call when the form is submitted.
 * @param {Object}  - The form api.
 * @param {Object} onNextStep - The function to call when the next step button is clicked.
 * @param {boolean} disabledNextStep - Whether the next step button is disabled.
 * @returns {JSX.Element} - The ShippingAddressForm component.
 */
const ShippingDetailsForm = props => {
  const {
    onSubmit,
    currentUser,
    className,
    onNextStep,
    disabledNextStep,
    defaultShowForm = false,
    invalidAddress,
    updateShippingAddressInProgress,
    ...rest
  } = props;
  const [showForm, setShowForm] = useState(defaultShowForm);
  const address = currentUser?.attributes?.profile?.protectedData?.shippingAddress;

  const hasEnoughAddressInfo =
    address?.street &&
    address?.city &&
    address?.postal_code &&
    address?.cc &&
    address?.phone &&
    address?.number;
  if (!showForm && address) {
    return (
      <SavedShippingAddress
        disabledNextStep={disabledNextStep}
        className={classNames(css.savedAddress, css.root, className)}
        address={address}
        onEdit={() => setShowForm(true)}
        onNextStep={hasEnoughAddressInfo ? onNextStep : undefined}
      />
    );
  }
  const initialValues = {
    name: address?.name || '',
    street: address?.street || '',
    city: address?.city || '',
    region: address?.region || '',
    postal_code: address?.postal_code || '',
    cc: address?.cc || '',
    phone: address?.phone || '',
    number: address?.number || '',
  };

  return (
    <div className={classNames(css.root, className)}>
      {address && !invalidAddress && !updateShippingAddressInProgress && (
        <PrimaryButton
          className={css.useSavedAddressButton}
          type="button"
          onClick={() => setShowForm(false)}
        >
          <FormattedMessage id="ShippingDetailsForm.useSavedAddress" />
        </PrimaryButton>
      )}
      <ShippingAddressFormComponent
        initialValues={initialValues}
        invalidAddress={invalidAddress}
        showHeading={false}
        onSubmit={onSubmit}
        submitTitle={<FormattedMessage id="ShippingDetailsForm.submitTitle" />}
        successCallback={onNextStep}
        updateShippingAddressInProgress={updateShippingAddressInProgress}
        {...rest}
      />
    </div>
  );
};

export default ShippingDetailsForm;
