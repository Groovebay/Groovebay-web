import React, { useCallback } from 'react';
import {
  InlineTextButton,
  ResponsiveImage,
  QuantitySelector,
  NamedLink,
} from '../../../../components';

import css from './CartListing.module.css';
import { FormattedMessage, useIntl } from 'react-intl';
import classNames from 'classnames';
import { formatMoney } from '../../../../util/currency';
import { debounce } from 'lodash';
import { createSlug } from '../../../../util/urlHelpers';

const CartListing = props => {
  const {
    listing,
    removeFromCart,
    removeError,
    className,
    updateQuantity,
    quantity,
    allowOrdersOfMultipleItems,
  } = props;
  const { title, price } = listing.attributes;
  const intl = useIntl();

  const priceData = formatMoney(intl, price);
  const variantPrefix = 'cart-card';
  const firstImage = listing.images && listing.images.length > 0 ? listing.images[0] : null;
  const variants = firstImage
    ? Object.keys(firstImage?.attributes?.variants).filter(k => k.startsWith(variantPrefix))
    : [];
  const classes = classNames(css.root, className);

  const debouncedUpdateQuantity = useCallback(debounce(updateQuantity, 1000), [updateQuantity]);

  const actualStock = listing?.currentStock?.attributes?.quantity;
  const reachStock = quantity > actualStock && actualStock > 0;

  const handleQuantityChange = newQuantity => {
    debouncedUpdateQuantity(newQuantity);
  };

  return (
    <div className={classes}>
      <div className={css.content}>
        <div className={css.contentLayout}>
          <div className={css.itemLayout}>
            <ResponsiveImage
              rootClassName={css.rootForImage}
              alt={title}
              image={firstImage}
              variants={variants}
            />
            <div className={css.titleLayout}>
              <NamedLink
                name="ListingPage"
                params={{ id: listing.id.uuid, slug: createSlug(title) }}
                className={css.title}
              >
                {title}
              </NamedLink>
              <InlineTextButton className={css.removeButton} onClick={removeFromCart}>
                <FormattedMessage id="CartCard.remove" />
              </InlineTextButton>
            </div>
          </div>
          <div className={css.priceAndQuantityLayout}>
            <div className={css.quantityLayout}>
              {allowOrdersOfMultipleItems ? (
                <QuantitySelector
                  quantity={quantity}
                  onQuantityChange={handleQuantityChange}
                  maxQuantity={actualStock}
                  disabled={reachStock}
                />
              ) : null}
              {!actualStock ? (
                <p className={classNames(css.error, css.smallText)}>
                  <FormattedMessage id="CartCard.outOfStock" />
                </p>
              ) : reachStock ? (
                <p className={classNames(css.error, css.smallText)}>
                  <FormattedMessage id="CartCard.notEnoughStock" />
                </p>
              ) : null}
            </div>
            <div className={css.priceLayout}>
              <span>{priceData}</span>
            </div>
          </div>
        </div>
      </div>
      {removeError ? (
        <p className={css.error}>
          {removeError.message ?? 'Something went wrong. Please try again.'}
        </p>
      ) : null}
    </div>
  );
};

export default CartListing;
