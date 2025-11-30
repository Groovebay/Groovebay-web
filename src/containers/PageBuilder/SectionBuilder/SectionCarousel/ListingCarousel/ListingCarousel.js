import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import classNames from 'classnames';
import useEmblaCarousel from 'embla-carousel-react';

import css from './ListingCarousel.module.css';
import { ListingCard } from '../../../../../components';
import { useViewportSize } from '../../../../../hooks';
import { useIntl } from 'react-intl';

/**
 * Get responsive slides count based on viewport width
 */
const getResponsiveSlidesToShow = (viewportWidth, defaultSlidesToShow) => {
  if (viewportWidth < 1024) return Math.min(2, defaultSlidesToShow); // Tablet
  return defaultSlidesToShow; // Desktop
};

/**
 * Get appropriate renderSizes based on viewport and slides count
 */
const getRenderSizes = (viewportWidth, slidesToShow) => {
  if (viewportWidth < 550) {
    // Mobile: account for container padding + navigation space
    return '(max-width: 549px) calc(100vw - 100px)';
  }
  if (viewportWidth < 768) {
    // Small tablet: 2 slides
    return '(max-width: 767px) calc(50vw - 80px)';
  }
  if (viewportWidth < 1024) {
    // Large tablet: 3 slides
    return '(max-width: 1023px) calc(33.333vw - 70px)';
  }

  // Desktop - calculate based on actual slides shown and container constraints
  const containerMaxWidth = 1120; // --contentMaxWidthPages
  const containerPadding = 64; // 32px on each side
  const navigationSpace = 100; // Space for navigation buttons
  const availableWidth = containerMaxWidth - containerPadding - navigationSpace;
  const slideGaps = (slidesToShow - 1) * 16; // Space between slides
  const slideWidth = Math.floor((availableWidth - slideGaps) / slidesToShow);

  return `(min-width: 1024px) ${slideWidth}px, calc(${100 / slidesToShow}vw - 80px)`;
};

const getShouldShowArrows = (viewportWidth, slidesToShow, numberOfSlides) => {
  if (viewportWidth < 550) return numberOfSlides > slidesToShow;
  if (viewportWidth < 768) return numberOfSlides > slidesToShow;
  if (viewportWidth < 1024) return numberOfSlides > slidesToShow;
  return numberOfSlides > slidesToShow;
};

const DEFAULT_SETTINGS = {
  align: 'center',
  loop: true,
  dragThreshold: 0.1,
  slidesToScroll: 1,
  containScroll: 'trimSnaps',
  skipSnaps: true,
};

const ListingCarousel = ({
  listings = [],
  className,
  rootClassName,
  id,
  emblaSettings = {},
  showArrows = true,
  showDots = false,
  slidesToShow = 4,
  slidesToScroll = 1,
  autoplay = false,
  autoplaySpeed = 3000,
  setActiveListing,
  showAuthorInfo = true,
  blocks = [],
  ...rest
}) => {
  const intl = useIntl();
  const [isClient, setIsClient] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const viewportSize = useViewportSize();
  const carouselRef = useRef(null);
  const prevButtonRef = useRef(null);
  const nextButtonRef = useRef(null);

  // Generate unique ID for this carousel instance
  const uniqueId = useMemo(() => {
    return (
      id ||
      `carousel-${Math.random()
        .toString(36)
        .substr(2, 9)}`
    );
  }, [id]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const classes = classNames(rootClassName || css.root, className);

  // Get responsive slides count
  const responsiveSlidesToShow = useMemo(
    () => getResponsiveSlidesToShow(viewportSize.width, slidesToShow),
    [viewportSize.width, slidesToShow]
  );

  // Validate and sanitize slidesToShow
  const validSlidesToShow = Math.max(
    1,
    Math.min(responsiveSlidesToShow, listings.length || blocks.length || 4)
  );

  // Determine if we should show partial next item

  const hasMoreItems = listings.length > validSlidesToShow || blocks.length > validSlidesToShow;

  // Get appropriate renderSizes for current viewport
  const renderSizes = useMemo(() => getRenderSizes(viewportSize.width, validSlidesToShow), [
    viewportSize.width,
    validSlidesToShow,
  ]);

  // Embla carousel configuration
  const emblaOptions = useMemo(() => {
    return {
      ...DEFAULT_SETTINGS,
      ...emblaSettings,
    };
  }, [validSlidesToShow, viewportSize.width, emblaSettings]);

  const [emblaRef, emblaApi] = useEmblaCarousel(emblaOptions);

  // Handle navigation button clicks
  const handlePrevClick = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const handleNextClick = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  // Update scroll state
  const updateScrollState = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  // Set up Embla event listeners
  useEffect(() => {
    if (!emblaApi) return;

    updateScrollState();
    emblaApi.on('select', updateScrollState);
    emblaApi.on('reInit', updateScrollState);

    return () => {
      emblaApi.off('select', updateScrollState);
      emblaApi.off('reInit', updateScrollState);
    };
  }, [emblaApi, updateScrollState]);

  // Autoplay functionality (if needed)
  useEffect(() => {
    if (!emblaApi || !autoplay) return;

    const hasMultipleSlides = listings.length > validSlidesToShow;
    if (!hasMultipleSlides) return;

    // Pause autoplay on hover/focus
    let autoplayInterval;
    let isPaused = false;

    const startAutoplay = () => {
      if (isPaused) return;
      autoplayInterval = setInterval(() => {
        if (emblaApi.canScrollNext()) {
          emblaApi.scrollNext();
        } else {
          emblaApi.scrollTo(0); // Loop back to start
        }
      }, autoplaySpeed);
    };

    const stopAutoplay = () => {
      clearInterval(autoplayInterval);
    };

    const pauseAutoplay = () => {
      isPaused = true;
      stopAutoplay();
    };

    const resumeAutoplay = () => {
      isPaused = false;
      startAutoplay();
    };

    // Start autoplay
    startAutoplay();

    // Add event listeners for pause/resume
    const carouselElement = carouselRef.current;
    if (carouselElement) {
      carouselElement.addEventListener('mouseenter', pauseAutoplay);
      carouselElement.addEventListener('mouseleave', resumeAutoplay);
      carouselElement.addEventListener('focusin', pauseAutoplay);
      carouselElement.addEventListener('focusout', resumeAutoplay);
    }

    return () => {
      stopAutoplay();
      if (carouselElement) {
        carouselElement.removeEventListener('mouseenter', pauseAutoplay);
        carouselElement.removeEventListener('mouseleave', resumeAutoplay);
        carouselElement.removeEventListener('focusin', pauseAutoplay);
        carouselElement.removeEventListener('focusout', resumeAutoplay);
      }
    };
  }, [emblaApi, autoplay, autoplaySpeed, listings.length, validSlidesToShow]);

  // Memoize the listing slides
  const listingSlides = useMemo(
    () =>
      listings.map(listing => (
        <div key={listing.id.uuid} className={css.emblaSlide}>
          <ListingCard
            listing={listing}
            intl={intl}
            setActiveListing={setActiveListing}
            showAuthorInfo={showAuthorInfo}
            renderSizes={renderSizes}
            useBlockStyle
            isLink
          />
        </div>
      )),
    [listings, intl, setActiveListing, showAuthorInfo, renderSizes]
  );
  const blockAspectWidth = blocks.length < 4 ? 4 : 4;
  const blockAspectHeight = blocks.length < 4 ? 2 : 2.5;
  const blockSlides = useMemo(
    () =>
      blocks.map(block => (
        <div key={block.blockId || block.blockName} className={css.emblaSlide}>
          <ListingCard
            block={block}
            intl={intl}
            renderSizes={renderSizes}
            useBlockStyle
            aspectWidth={blockAspectWidth}
            aspectHeight={blockAspectHeight}
          />
        </div>
      )),
    [blocks, intl, renderSizes]
  );

  // Create pagination dots
  const paginationDots = useMemo(() => {
    if (!showDots || !emblaApi) return [];
    const scrollSnaps = emblaApi.scrollSnapList();
    return scrollSnaps.map((_, index) => (
      <button
        key={index}
        className={classNames(css.paginationDot, {
          [css.paginationDotActive]: index === selectedIndex,
        })}
        onClick={() => emblaApi.scrollTo(index)}
        aria-label={`Go to slide ${index + 1}`}
        type="button"
      />
    ));
  }, [emblaApi, showDots, selectedIndex]);

  const renderSlides = useMemo(() => {
    if (listings.length > 0) {
      return listingSlides;
    }
    if (blocks.length > 0) {
      return blockSlides;
    }
    return null;
  }, [listingSlides, blockSlides]);

  // Don't render anything if no listings or not on client side
  if (!isClient || (listings.length === 0 && blocks.length === 0)) {
    return null;
  }

  const numberOfSlides = listings.length ?? blocks.length;

  const shouldShowArrows = getShouldShowArrows(
    viewportSize.width,
    validSlidesToShow,
    numberOfSlides
  );

  return (
    <div id={uniqueId} className={classes} {...rest} ref={carouselRef}>
      <div className={css.carouselWrapper}>
        <div className={css.embla} ref={emblaRef}>
          <div
            className={css.emblaContainer}
            style={{
              '--slides-per-view': validSlidesToShow,
              '--slide-spacing': '16px',
              '--has-more-items': hasMoreItems ? '1' : '0',
            }}
          >
            {renderSlides}
          </div>
        </div>

        {/* Custom Navigation Buttons with proper event handlers */}
        {shouldShowArrows && (
          <>
            <button
              ref={prevButtonRef}
              className={classNames(css.emblaButtonPrev, css.customArrow, css.prevArrow)}
              onClick={handlePrevClick}
              disabled={!canScrollPrev}
              aria-label={`Previous ${uniqueId}`}
              type="button"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
              </svg>
            </button>
            <button
              ref={nextButtonRef}
              className={classNames(css.emblaButtonNext, css.customArrow, css.nextArrow)}
              onClick={handleNextClick}
              disabled={!canScrollNext}
              aria-label={`Next ${uniqueId}`}
              type="button"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
              </svg>
            </button>
          </>
        )}

        {/* Custom Pagination */}
        {showDots && paginationDots.length > 0 && (
          <div className={css.emblaPagination}>{paginationDots}</div>
        )}
      </div>
    </div>
  );
};

ListingCarousel.displayName = 'ListingCarousel';

export default ListingCarousel;
