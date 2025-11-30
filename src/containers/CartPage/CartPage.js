import React from 'react';
import { Heading, IconSpinner, LayoutSingleColumn, NamedLink, Page } from '../../components';
import { isScrollingDisabled } from '../../ducks/ui.duck';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { FormattedMessage, useIntl } from 'react-intl';
import TopbarContainer from '../TopbarContainer/TopbarContainer';
import css from './CartPage.module.css';
import { getListingsById, getMarketplaceEntities } from '../../ducks/marketplaceData.duck';
import CartCard from './components/CartCard/CartCard';
import useCart from '../../hooks/useCart';
import { formatMoney } from '../../util/currency';
import { types as sdkTypes } from '../../util/sdkLoader';
import isEmpty from 'lodash/isEmpty';
import { useConfiguration } from '../../context/configurationContext';
import { handleSubmit } from '../ListingPage/ListingPage.shared';
import { useHistory } from 'react-router-dom';
import { initializeCardPaymentData } from '../../ducks/stripe.duck';
import { useRouteConfiguration } from '../../context/routeConfigurationContext';

const { Money } = sdkTypes;

/**
 * @typedef {Object} renderCartListingsProps
 * @param {Object} props
 * @param {Object[]} props.cartListings
 * @param {Object} props.cart
 * @param {Object} props.intl
 * @param {Object} props.updateCartInProgress
 * @param {function} props.updateCart
 * @param {Object} props.onRemoveFromCart
 * @param {Object} props.updateCartError
 * @param {function} props.onCheckout
 * @returns {JSX.Element}
 * @description Renders the cart listings
 * @example
 * <CartPage />
 */
const renderCartListings = props => {
  const {
    updateCart,
    cartListings,
    cart,
    intl,
    updateCartInProgress,
    onRemoveFromCart,
    updateCartError,
    onCheckout,
  } = props;
  if (!cartListings.length) {
    return null;
  }

  const providerGroups = [];

  Object.entries(cart).forEach(([providerId, listingIdMap]) => {
    const listingIds = Object.keys(listingIdMap);
    if (!listingIds.length) {
      return;
    }

    // Collect all items from this provider
    const providerItems = [];
    let providerTotalItems = 0;
    let providerTotalPrice = 0;
    let listingCurrency;
    let firstAuthor = null;

    listingIds.forEach(listingId => {
      const listing = cartListings.find(l => l.id.uuid === listingId);
      if (!listing) return;

      if (!firstAuthor) {
        firstAuthor = listing?.author;
      }

      const listingCart = listingIdMap[listingId];
      providerTotalPrice +=
        (listingCart?.quantity ?? 0) * (listing?.attributes?.price?.amount ?? 0);
      listingCurrency = listing?.attributes?.price?.currency;
      providerTotalItems += listingCart?.quantity ?? 0;
      providerItems.push({
        listing,
        quantity: listingCart?.quantity,
      });
    });

    if (providerItems.length > 0) {
      const inProgress = updateCartInProgress.some(id =>
        providerItems.some(item => item.listingId === id)
      );
      const providerTotalFormatted = formatMoney(
        intl,
        new Money(providerTotalPrice, listingCurrency)
      );

      providerGroups.push({
        providerId,
        items: providerItems,
        inProgress,
        firstAuthor,
        providerTotalFormatted,
        providerTotalItems,
      });
    }
  });

  return providerGroups.map(group => (
    <CartCard
      key={group.providerId}
      providerId={group.providerId}
      items={group.items}
      inProgress={group.inProgress}
      updateCartError={updateCartError}
      onRemoveFromCart={onRemoveFromCart}
      updateCart={updateCart}
      firstAuthor={group.firstAuthor}
      providerTotalFormatted={group.providerTotalFormatted}
      providerTotalItems={group.providerTotalItems}
      onCheckout={() => onCheckout(group.providerId)}
      updateCartInProgress={updateCartInProgress}
    />
  ));
};

/**
 * @returns {JSX.Element}
 * @description CartPage component that displays the cart page
 * @example
 * <CartPage />
 */
const CartPage = () => {
  const intl = useIntl();
  const title = intl.formatMessage({ id: 'CartPage.title' });
  const ui = useSelector(state => state.ui);

  const scrollingDisabled = isScrollingDisabled({ ui });
  const cartListingIds = useSelector(state => state.CartPage.cartListingIds);
  const fetchCartListingsInProgress = useSelector(
    state => state.CartPage.fetchCartListingsInProgress
  );
  const config = useConfiguration();
  const routeConfiguration = useRouteConfiguration();
  const marketplaceData = useSelector(state => state.marketplaceData);
  const cartListings = getListingsById({ marketplaceData }, cartListingIds);
  const { updateCart, updateCartError, cart, totalCartCount, updateCartInProgress } = useCart();

  const onRemoveFromCart = (providerId, listingId) => {
    updateCart({ providerId, listingId, quantity: 0 });
  };

  const isCartEmpty = totalCartCount === 0;

  const listingConfig = config?.listing;

  const listingFields = listingConfig?.listingFields;

  const sizeEnumOptions = listingFields?.find(field => field.key === 'size_id')?.enumOptions || [];

  const dispatch = useDispatch();
  const history = useHistory();
  const currentUser = useSelector(state => state.user.currentUser);
  const getListing = id => {
    const ref = { id, type: 'listing' };
    const listings = getMarketplaceEntities({ marketplaceData }, [ref]);
    return listings.length === 1 ? listings[0] : null;
  };
  const callSetInitialValues = (setInitialValues, values, saveToSessionStorage) => {
    dispatch(setInitialValues(values, saveToSessionStorage));
  };
  const onInitializeCardPaymentData = () => {
    dispatch(initializeCardPaymentData());
  };

  const onCheckout = providerId => {
    // Collect all items from this provider for checkout
    const providerCart = cart[providerId];
    const firstListingId = Object.keys(providerCart)[0];
    if (firstListingId) {
      handleSubmit({
        history,
        params: { id: firstListingId },
        currentUser,
        getListing,
        callSetInitialValues,
        onInitializeCardPaymentData,
        routes: routeConfiguration,
      })({
        providerCart,
        fromCart: true,
        deliveryMethod: 'shipping',
      });
    }
  };

  return (
    <Page title={title} scrollingDisabled={scrollingDisabled}>
      <TopbarContainer />
      <LayoutSingleColumn className={css.layout}>
        <div className={css.root}>
          <div className={css.titleWrapper}>
            <Heading as="h3" className={css.title}>
              {title}
            </Heading>
            {!isCartEmpty && (
              <NamedLink name="SearchPage" className={css.continueShoppingLink}>
                <FormattedMessage id="CartPage.continueShopping" />
              </NamedLink>
            )}
          </div>

          {fetchCartListingsInProgress ? (
            <IconSpinner />
          ) : !isCartEmpty ? (
            <div className={css.cartListings}>
              {renderCartListings({
                updateCart,
                cartListings,
                cart,
                intl,
                updateCartInProgress,
                updateCartError,
                onRemoveFromCart,
                sizeEnumOptions,
                onCheckout,
              })}
            </div>
          ) : (
            <div className={css.emptyCart}>
              <Heading as="h3" className={css.emptyCartTitle}>
                <FormattedMessage id="CartPage.emptyCart" />
              </Heading>
              <NamedLink name="SearchPage" className={css.goShoppingLink}>
                <FormattedMessage id="CartPage.goShopping" />
              </NamedLink>
            </div>
          )}
        </div>
      </LayoutSingleColumn>
    </Page>
  );
};

export default CartPage;

CartPage.displayName = 'CartPage';
