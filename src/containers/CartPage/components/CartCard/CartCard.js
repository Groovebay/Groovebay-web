import React from 'react';
import { Avatar, Button } from '../../../../components';
import { FormattedMessage } from 'react-intl';
import css from './CartCard.module.css';
import CartListing from '../CartListing/CartListing';
import classNames from 'classnames';
import NamedLink from '../../../../components/NamedLink/NamedLink';
import { createSlug } from '../../../../util/urlHelpers';

/**
 * @param {Object} props
 * @param {string} props.providerId
 * @param {Object[]} props.items
 * @param {boolean} props.inProgress
 * @param {string} props.updateCartError
 * @param {function} props.updateCart
 * @param {function} props.onRemoveFromCart
 * @param {Object} props.firstAuthor
 * @param {string} props.providerTotalFormatted
 * @param {number} props.providerTotalItems
 * @param {function} props.onCheckout
 * @param {string} [props.className]
 * @returns {JSX.Element}
 * @description CartCard component that displays all items from a specific provider
 * @example
 * <CartCard
 *   providerId="123"
 *   items={[{ listing: {...}, quantity: 1 }, { listing: {...}, quantity: 2 }]}
 *   inProgress={false}
 *   updateCartWithSizeQuantitiesError="Error"
 *   onUpdateCartWithSizeQuantities={() => {}}
 *   onRemoveFromCart={() => {}}
 *   firstAuthor={{ id: '123', attributes: { profile: { displayName: 'John Doe' } } }}
 *   providerTotalFormatted="100"
 *   providerTotalItems={3}
 * />
 */
const CartCard = ({
  providerId,
  items,
  inProgress,
  updateCartError,
  updateCart,
  onRemoveFromCart,
  firstAuthor,
  providerTotalFormatted,
  providerTotalItems,
  className,
  onCheckout,
}) => {
  const classes = classNames(css.root, className);

  if (!items || items.length === 0) {
    return null;
  }

  // Check if any item has insufficient stock
  const disabledCheckout = items.some(({ listing, quantity }) => {
    const actualStock = listing?.currentStock?.attributes?.quantity;
    return quantity > actualStock || !actualStock;
  });

  // Group items by listing for better organization

  return (
    <div key={providerId} className={classes}>
      <div className={css.cartListings}>
        {items.map(({ listing, quantity }) => {
          const listingId = listing.id.uuid;
          return (
            <div key={listingId} className={css.listingGroup}>
              <CartListing
                key={listingId}
                className={css.cartCard}
                listing={listing}
                quantity={quantity}
                removeError={updateCartError}
                removeFromCart={() => onRemoveFromCart(providerId, listingId)}
                updateQuantity={newQuantity => {
                  newQuantity > 0
                    ? updateCart({ providerId, listingId, quantity: newQuantity })
                    : onRemoveFromCart(providerId, listingId);
                }}
              />
            </div>
          );
        })}
      </div>

      <div className={css.checkoutButton}>
        <div>
          <FormattedMessage id="CartPage.cartWithProvider" />
          <NamedLink
            name="ProfilePage"
            params={{ id: firstAuthor?.id?.uuid }}
            className={css.providerLink}
          >
            {firstAuthor?.attributes?.profile?.displayName}
          </NamedLink>
        </div>
        <div className={css.subtotalContainer}>
          <span className={css.subtotal}>
            <FormattedMessage id="CartPage.subtotal" />
            <span className={css.subtotalPrice}>{providerTotalFormatted}</span>
          </span>
          <span className={css.totalItems}>
            <FormattedMessage id="CartPage.totalItems" values={{ quantity: providerTotalItems }} />
          </span>
        </div>
        <Button
          className={css.checkoutButtonCta}
          disabled={inProgress || disabledCheckout}
          inProgress={inProgress}
          onClick={onCheckout}
        >
          <FormattedMessage id="CartCard.checkout" />
        </Button>
      </div>
    </div>
  );
};

export default CartCard;
