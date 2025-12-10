import React, { useMemo, useState } from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { string, func } from 'prop-types';
import { Form as FinalForm } from 'react-final-form';
import { FormattedMessage, useIntl } from 'react-intl';

import {
  Form,
  FieldTextInput,
  FieldSelect,
  H3,
  Button,
  FieldPhoneNumberWithCountryInput,
} from '../../components';
import * as validators from '../../util/validators';
import getCountryCodes from '../../translations/countryCodes';
import { useConfiguration } from '../../context/configurationContext';
import css from './ShippingAddressForm.module.css';
import { updateShippingAddressThunk } from './ShippingAddressForm.duck';
import isEqual from 'lodash/isEqual';

/**
 * ShippingAddressFormComponent is a component that allows the user to enter their shipping address.
 * It is used in the ShippingDetailsForm component.
 * @param {Object} onValidateAddress - The function to call when the address is validated.
 * @param {Object} initialValues - The initial values for the form.
 * @param {Object} validateAddressInProgress - The state of the validate address in progress.
 * @param {Object} validateAddressSuccess - The state of the validate address success.
 * @param {Object} validateAddressError - The state of the validate address error.
 * @param {Object} className - The class name for the form.
 * @param {Object} rootClassName - The root class name for the form.
 * @param {boolean} showHeading - Whether to show the heading.
 * @param {Object} submitTitle - The title for the submit button.
 * @returns {JSX.Element} - The ShippingAddressFormComponent.
 */
export const ShippingAddressFormComponent = props => {
  const intl = useIntl();
  const config = useConfiguration();
  const [submittedValues, setSubmittedValues] = useState({});

  const title = intl.formatMessage({ id: 'ShippingAddressForm.title' });
  const requireText = intl.formatMessage({ id: 'ShippingAddressForm.requireText' });
  const validateButton = intl.formatMessage({ id: 'ShippingAddressForm.validateButton' });

  const phoneLabel = intl.formatMessage({ id: 'ShippingAddressForm.phoneLabel' });
  const phonePlaceholder = intl.formatMessage({ id: 'ShippingAddressForm.phonePlaceholder' });
  const invalidPhoneNumber = intl.formatMessage({ id: 'ShippingAddressForm.invalidPhoneNumber' });
  const phoneRequired = validators.required(requireText);
  const phoneValid = validators.validPhoneNumber(invalidPhoneNumber);

  const streetLabel = intl.formatMessage({ id: 'ShippingAddressForm.streetLabel' });
  const streetPlaceholder = intl.formatMessage({ id: 'ShippingAddressForm.streetPlaceholder' });
  const streetRequired = validators.required(requireText);

  const aptLabel = intl.formatMessage({ id: 'ShippingAddressForm.aptLabel' });
  const aptPlaceholder = intl.formatMessage({ id: 'ShippingAddressForm.aptPlaceholder' });

  const cityLabel = intl.formatMessage({ id: 'ShippingAddressForm.cityLabel' });
  const cityPlaceholder = intl.formatMessage({ id: 'ShippingAddressForm.cityPlaceholder' });
  const cityRequired = validators.required(requireText);

  const postalCodeLabel = intl.formatMessage({ id: 'ShippingAddressForm.postalCodeLabel' });
  const postalCodePlaceholder = intl.formatMessage({
    id: 'ShippingAddressForm.postalCodePlaceholder',
  });
  const postalCodeRequired = validators.required(requireText);

  const regionLabel = intl.formatMessage({ id: 'ShippingAddressForm.regionLabel' });
  const regionPlaceholder = intl.formatMessage({ id: 'ShippingAddressForm.regionPlaceholder' });
  const regionRequired = validators.required(requireText);

  const countryLabel = intl.formatMessage({ id: 'ShippingAddressForm.countryLabel' });
  const countryPlaceholder = intl.formatMessage({ id: 'ShippingAddressForm.countryPlaceholder' });
  const countryRequired = validators.required(requireText);

  // Use the language set in config.localization.locale to get the correct translations of the country names
  const countryCodes = useMemo(() => {
    return getCountryCodes(config.localization.locale).filter(elm => ['NL'].includes(elm.code));
  }, [config.localization.locale]);

  // Use the language set in config.localization.locale to get the correct translations of the country names
  const initialValues = useMemo(() => {
    return {
      ...props.initialValues,
      cc: props.initialValues?.cc || 'NL',
    };
  }, [JSON.stringify(props.initialValues || {}), JSON.stringify(countryCodes)]);

  return (
    <FinalForm
      {...props}
      initialValues={initialValues}
      onSubmit={async values => {
        const { onSubmit } = props;
        const response = await onSubmit(values);
        if (response?.payload?.data) {
          setSubmittedValues(values);
          props.successCallback?.();
        }
      }}
      render={fieldRenderProps => {
        const {
          rootClassName,
          className,
          formId,
          handleSubmit,
          form,
          updateShippingAddressError,
          updateShippingAddressInProgress,
          showHeading = false,
          submitTitle,
          values,
          showShippingAddressFormError,
        } = fieldRenderProps;
        const submittedOnce = Object.keys(submittedValues).length > 0;
        const pristineSinceLastSubmit = submittedOnce && isEqual(values, submittedValues);
        const classes = classNames(rootClassName || css.root, className);

        return (
          <Form className={classes} onSubmit={handleSubmit}>
            {showHeading && <H3>{title}</H3>}

            {showShippingAddressFormError && (
              <p className={css.error}>
                <FormattedMessage id="ShippingAddressForm.formError" />
              </p>
            )}

            <div className={css.formRow}>
              <FieldPhoneNumberWithCountryInput
                id={`${formId}.phone`}
                autoComplete="shipping phoneNumber"
                name="phone"
                country="NL"
                className={classNames(css.field, css.fullField)}
                label={phoneLabel}
                placeholder={phonePlaceholder}
                validate={validators.composeValidators(phoneRequired, phoneValid)}
                onUnmount={() => form.change('phone', undefined)}
              />
            </div>

            <div className={css.formRow}>
              <FieldTextInput
                id={`${formId}.street`}
                name="street"
                className={css.field}
                type="text"
                label={streetLabel}
                placeholder={streetPlaceholder}
                validate={streetRequired}
                onUnmount={() => form.change('street', undefined)}
              />

              <FieldTextInput
                id={`${formId}.number`}
                name="number"
                className={css.field}
                type="text"
                label={aptLabel}
                placeholder={aptPlaceholder}
                onUnmount={() => form.change('number', undefined)}
              />
            </div>
            <div className={css.formRow}>
              <FieldTextInput
                id={`${formId}.postalCode`}
                name="postal_code"
                className={classNames(css.field, css.countryField)}
                type="text"
                label={postalCodeLabel}
                placeholder={postalCodePlaceholder}
                validate={postalCodeRequired}
                onUnmount={() => form.change('postal_code', undefined)}
              />
              <FieldTextInput
                id={`${formId}.city`}
                name="city"
                className={css.field}
                type="text"
                label={cityLabel}
                placeholder={cityPlaceholder}
                validate={cityRequired}
                onUnmount={() => form.change('city', undefined)}
              />
            </div>
            <div className={css.formRow}>
              <FieldTextInput
                id={`${formId}.region`}
                name="region"
                className={css.field}
                type="text"
                label={regionLabel}
                placeholder={regionPlaceholder}
                validate={regionRequired}
                onUnmount={() => form.change('region', undefined)}
              />

              <FieldSelect
                id={`${formId}.country`}
                name="cc"
                className={classNames(css.field, css.countryField)}
                label={countryLabel}
                validate={countryRequired}
                disabled
              >
                <option disabled value="">
                  {countryPlaceholder}
                </option>
                {countryCodes.map(country => {
                  return (
                    <option disabled key={country.code} value={country.code}>
                      {country.name}
                    </option>
                  );
                })}
              </FieldSelect>
            </div>

            {updateShippingAddressError?.error?.message && (
              <p className={css.error}>
                {updateShippingAddressError.error.message ?? (
                  <FormattedMessage id="ShippingAddressForm.validateError" />
                )}
              </p>
            )}

            <Button
              className={css.validateButton}
              type="submit"
              inProgress={updateShippingAddressInProgress}
              ready={pristineSinceLastSubmit}
            >
              {submitTitle ?? validateButton}
            </Button>
          </Form>
        );
      }}
    />
  );
};

ShippingAddressFormComponent.propTypes = {
  className: string,
  rootClassName: string,
  successCallback: func,
};

const mapStateToProps = state => {
  const {
    updateShippingAddressInProgress,
    updateShippingAddressSuccess,
    updateShippingAddressError,
  } = state.ShippingAddressForm;

  const currentUser = state.user.currentUser;

  const initialValues = currentUser?.attributes?.profile?.protectedData?.shippingAddress;

  return {
    initialValues,
    updateShippingAddressInProgress,
    updateShippingAddressSuccess,
    updateShippingAddressError,
  };
};

const mapDispatchToProps = dispatch => ({
  onSubmit: address => dispatch(updateShippingAddressThunk(address)),
});

const ShippingAddressForm = compose(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )
)(ShippingAddressFormComponent);

export default ShippingAddressForm;
