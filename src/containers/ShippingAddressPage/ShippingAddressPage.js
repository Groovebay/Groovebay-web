import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';

import TopbarContainer from '../../containers/TopbarContainer/TopbarContainer';
import FooterContainer from '../../containers/FooterContainer/FooterContainer';
import { H3, Page, UserNav, LayoutSideNavigation, ShippingAddressForm } from '../../components';
import { isScrollingDisabled } from '../../ducks/ui.duck';
import { useIntl } from '../../util/reactIntl';
import { showCreateListingLinkForUser, showPaymentDetailsForUser } from '../../util/userHelpers';
import { ensureCurrentUser } from '../../util/data';
import { useConfiguration } from '../../context/configurationContext';

import css from './ShippingAddressPage.module.css';

/**
 * @param {Object} props
 * @param {propTypes.currentUser} [props.currentUser] - The current user
 * @param {boolean} props.scrollingDisabled - Whether the scrolling is disabled
 * @returns {JSX.Element}
 */
export const ShippingAddressPageComponent = props => {
  const config = useConfiguration();
  const intl = useIntl();
  const { scrollingDisabled, currentUser } = props;
  const user = ensureCurrentUser(currentUser);

  const shippingAddressForm = user.id ? <ShippingAddressForm showHeading={false} /> : null;

  const title = intl.formatMessage({ id: 'ShippingAddressPage.title' });
  const heading = intl.formatMessage({ id: 'ShippingAddressPage.heading' });

  const showManageListingsLink = showCreateListingLinkForUser(config, currentUser);
  const { showPayoutDetails, showPaymentMethods } = showPaymentDetailsForUser(config, currentUser);
  const accountSettingsNavProps = {
    currentPage: 'ShippingAddressPage',
    showPaymentMethods,
    showPayoutDetails,
  };

  return (
    <Page title={title} scrollingDisabled={scrollingDisabled}>
      <LayoutSideNavigation
        topbar={
          <>
            <TopbarContainer
              desktopClassName={css.desktopTopbar}
              mobileClassName={css.mobileTopbar}
            />
            <UserNav
              currentPage="ShippingAddressPage"
              showManageListingsLink={showManageListingsLink}
            />
          </>
        }
        sideNav={null}
        useAccountSettingsNav
        accountSettingsNavProps={accountSettingsNavProps}
        footer={<FooterContainer />}
        intl={intl}
      >
        <div className={css.content}>
          <H3 as="h1">{heading}</H3>
          {shippingAddressForm}
        </div>
      </LayoutSideNavigation>
    </Page>
  );
};

const mapStateToProps = state => {
  // Topbar needs user info.
  const { currentUser } = state.user;
  return {
    currentUser,
    scrollingDisabled: isScrollingDisabled(state),
  };
};

const ShippingAddressPage = compose(connect(mapStateToProps))(ShippingAddressPageComponent);

export default ShippingAddressPage;
