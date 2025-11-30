import { useSelector } from 'react-redux';
import css from './CustomCarousel.module.css';
import { cmsCustomListingsSelector, cmsInProgressSelector } from '../../../CMSPage/CMSPage.duck';
import { IconSpinner } from '../../../../components';
import ListingCarousel from './ListingCarousel/ListingCarousel';
import classNames from 'classnames';
import {
  customInProgressSelector,
  customListingsSelector,
} from '../../../LandingPage/LandingPage.duck';

const DEFAULT_SLIDES_TO_SHOW = 4;

function CustomCarousel(props) {
  const { sectionId, numColumns, isInsideContainer } = props;
  const listings = useSelector(state => customListingsSelector(state, sectionId));
  const progress = useSelector(state => customInProgressSelector(state, sectionId));
  const inProgress = progress || !listings || listings?.length === 0;
  const hasListings = listings?.length > 0;
  const slidesToShow = Math.min(numColumns ?? DEFAULT_SLIDES_TO_SHOW, listings.length);
  
  return (
    <section className={css.listingCards}>
      {inProgress ? (
        <div className={css.loadingContainer}>
          <IconSpinner />
        </div>
      ) : hasListings ? (
        <div
          className={classNames(css.carouselContainer, {
            [css.noSidePaddings]: isInsideContainer,
          })}
        >
          <ListingCarousel
            id={`${sectionId}-carousel`}
            listings={listings}
            slidesToShow={slidesToShow}
            showArrows={listings.length > slidesToShow}
            showDots={false}
            autoplay={false}
          />
        </div>
      ) : null}
    </section>
  );
}

export default CustomCarousel;
