import React from 'react';
import { FormattedMessage } from '../../util/reactIntl';
import { createSlug } from '../../util/urlHelpers';
import { formatMoney } from '../../util/currency';

import { AvatarMedium, H4, H6, NamedLink, ResponsiveImage } from '../../components';

import css from './CheckoutPage.module.css';
import classNames from 'classnames';
import { types as sdkTypes } from '../../util/sdkLoader';

const { Money } = sdkTypes;

const ListingCard = ({ listing, intl, quantity }) => {
  const { price, title } = listing?.attributes || {};
  const firstImage = listing?.images[0];
  const variants = firstImage
    ? Object.keys(firstImage?.attributes?.variants).filter(k =>
        ['default', 'scaled-small', 'listing-card'].includes(k)
      )
    : [];
  const totalPrice = price.amount * quantity;
  const totalPriceFormatted = formatMoney(intl, new Money(totalPrice, price.currency));
  return (
    <div className={css.listingDetailsWrapper} key={`${listing?.id?.uuid}`}>
      <div className={css.listingDetails}>
        <ResponsiveImage
          rootClassName={css.listingImage}
          alt={title}
          image={firstImage}
          variants={variants}
        />
        <div className={css.listingDetailsTextWrapper}>
          <div className={css.listingDetailsText}>
            <NamedLink
              className={css.listingDetailsTextTitle}
              name="ListingPage"
              params={{ id: listing?.id?.uuid, slug: createSlug(title) }}
            >
              <H4 as="h5">{title}</H4>
            </NamedLink>
          </div>
          <div className={css.listingDetailsTextPrice}>
            <span className={css.listingDetailsTextDescription}>{formatMoney(intl, price)}</span>
            <span className={css.listingDetailsTextQuantity}>x {quantity}</span>
          </div>
        </div>
      </div>
      <div className={css.priceContainer}>
        <p className={css.price}>{totalPriceFormatted}</p>
      </div>
    </div>
  );
};

const RenderListings = ({ listings, intl, providerCart }) => {
  return (
    <div className={css.listingsContainer}>
      {listings.map(listing => (
        <ListingCard
          listing={listing}
          quantity={providerCart?.[listing.id.uuid]?.quantity || 0}
          key={`${listing?.id?.uuid}`}
          intl={intl}
        />
      ))}
    </div>
  );
};

const CartDetailsSideCard = props => {
  const {
    listings,
    author,
    speculateTransactionErrorMessage,
    processName,
    breakdown,
    className,
    intl,
    providerCart,
  } = props;

  return (
    <div className={classNames(css.detailsContainer, className)}>
      <div className={css.orderSummaryWrapper}>
        <h4 className={css.detailsHeading}>
          <FormattedMessage id="CheckoutPage.orderSummary" />
        </h4>
        <div className={css.authorDetailsWrapper}>
          <div className={classNames(css.avatarWrapperCart)}>
            <AvatarMedium user={author} disableProfileLink />
            <p className={css.authorName}>
              <FormattedMessage id="CheckoutPage.orderFrom" />
              <NamedLink name="ProfilePage" params={{ id: author?.id?.uuid }}>
                {author?.attributes?.profile?.displayName}
              </NamedLink>
            </p>
          </div>

          {speculateTransactionErrorMessage}
        </div>
      </div>
      {providerCart && (
        <RenderListings listings={listings} intl={intl} providerCart={providerCart} />
      )}

      {!!breakdown ? (
        <div className={css.orderBreakdownHeader}>
          <H6 as="h3" className={css.orderBreakdownTitle}>
            <FormattedMessage id={`CheckoutPage.${processName}.orderBreakdown`} />
          </H6>
          <hr className={css.totalDivider} />
        </div>
      ) : null}
      {breakdown}
    </div>
  );
};

export default CartDetailsSideCard;
