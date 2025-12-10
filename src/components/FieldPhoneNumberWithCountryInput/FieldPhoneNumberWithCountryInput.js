import React, { Component } from 'react';
import { Field } from 'react-final-form';
import classNames from 'classnames';
import PhoneInput from 'react-phone-number-input';
import { ValidationError } from '../../components';

import css from './FieldPhoneNumberWithCountryInput.module.css';

const FieldPhoneNumberWithCountryInputComponent = props => {
  const {
    rootClassName,
    className,
    inputRootClass,
    customErrorText,
    id,
    label,
    input,
    meta,
    onUnmount,
    isUncontrolled,
    inputRef,
    hideErrorMessage,
    defaultCountry,
    countries,
    international,
    withCountryCallingCode,
    ...rest
  } = props;

  if (label && !id) {
    throw new Error('id required when a label is given');
  }

  const { valid, invalid, touched, error } = meta;
  const errorText = customErrorText || error;
  const hasError = !!customErrorText || !!(touched && invalid && error);
  const fieldMeta = { touched: hasError, error: errorText };

  const inputClasses =
    inputRootClass ||
    classNames(css.input, {
      [css.inputSuccess]: valid,
      [css.inputError]: hasError,
    });

  const classes = classNames(rootClassName || css.root, className);

  // PhoneInput props
  const phoneInputProps = {
    className: inputClasses,
    id,
    defaultCountry: defaultCountry || 'NL',
    countries: countries || undefined,
    international: international !== false,
    withCountryCallingCode: withCountryCallingCode !== false,
    showCountryName: false,
    ...input,
    ...rest,
  };

  // Handle uncontrolled input
  if (isUncontrolled) {
    phoneInputProps.defaultValue = input.value;
    delete phoneInputProps.value;
  }

  return (
    <div className={classes}>
      {label ? <label htmlFor={id}>{label}</label> : null}
      <PhoneInput {...phoneInputProps} />
      {hideErrorMessage ? null : <ValidationError fieldMeta={fieldMeta} />}
    </div>
  );
};

/**
 * Create Final Form field for phone number input with country selection using react-phone-number-input.
 *
 * @component
 * @param {Object} props
 * @param {string?} props.className add more style rules in addition to components own css.root
 * @param {string?} props.rootClassName overwrite components own css.root
 * @param {string?} props.inputRootClass overwrite components own css.input
 * @param {string} props.name Name of the input in Final Form
 * @param {string} props.id
 * @param {string?} props.label Label is optional, but if it is given, an id is also required.
 * @param {string?} props.customErrorText Error message that can be manually passed to input field
 * @param {boolean} props.isUncontrolled is value tracked by parent component
 * @param {Object} props.inputRef a ref object passed for input element.
 * @param {Function} props.onUnmount Uncontrolled input uses defaultValue prop
 * @param {string} props.defaultCountry default country code (e.g., 'US', 'GB')
 * @param {Array} props.countries array of country codes to show in dropdown
 * @param {boolean} props.international whether to show international format
 * @param {boolean} props.withCountryCallingCode whether to show country calling code
 * @returns {JSX.Element} Final Form Field containing phone number input with country selection
 */
class FieldPhoneNumberWithCountryInput extends Component {
  componentWillUnmount() {
    if (this.props.onUnmount) {
      this.props.onUnmount();
    }
  }

  render() {
    return <Field component={FieldPhoneNumberWithCountryInputComponent} {...this.props} />;
  }
}

export default FieldPhoneNumberWithCountryInput;
