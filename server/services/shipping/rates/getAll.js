// Carrier constants
const CARRIERS = {
  POSTNL: {
    id: 1,
    label: 'PostNL',
  },
  DHL: {
    id: 9,
    label: 'DHL',
  },
  DPD: {
    id: 4,
    label: 'DPD',
  },
  UPS: {
    id: 12,
    label: 'UPS',
  },
};

// All available carriers
const ALL_CARRIERS = Object.values(CARRIERS);

/**
 * Get all shipping rates for parcel shipments within Netherlands
 * Based on MyParcel 2026 tariff rates
 *
 * @param {Object} params - Optional parameters
 * @param {number} params.weight - Package weight in kg (default: 5)
 * @param {number} params.volume - Package volume in dm3 (default: 25)
 * @param {number} params.monthlyShipments - Number of shipments per month (default: 100)
 * @param {string[]} params.carriers - Array of carrier names to filter (default: all carriers)
 * @param {boolean} params.useMyParcelRates - Use MyParcel Parcel discounted rates instead of Tariff rates (default: false)
 * @returns {Array} Array of shipping rate options with prices in cents (subunits)
 */
const getAll = (params = {}) => {
  const {
    weight = 1, // kg, default 1kg (typical vinyl record with packaging)
    volume = 3.5, // dm3, default 3.5dm3 (typical 12" vinyl record mailer: ~32cm × 32cm × 3.5cm)
    monthlyShipments = 249, // number of shipments per month
    carriers = ALL_CARRIERS, // filter by specific carriers, default: all
    useMyParcelRates = false, // Use MyParcel Parcel discounted rates (includes €0.10 label contribution)
  } = params;

  // Normalize carriers to array and validate
  const requestedCarriers = Array.isArray(carriers) ? carriers : [carriers];
  const validCarriers = requestedCarriers.filter(c =>
    ALL_CARRIERS.some(carrier => carrier.id === c.id)
  );

  // If no valid carriers, return empty array
  if (validCarriers.length === 0) {
    return [];
  }

  // Determine volume tier based on monthly shipments
  const getVolumeTier = shipments => {
    if (shipments >= 5000) return 'premium';
    if (shipments >= 2500) return '2500-5000';
    if (shipments >= 1000) return '1000-2500';
    if (shipments >= 500) return '500-1000';
    if (shipments >= 250) return '250-500';
    return '1-250';
  };

  // Determine DHL size category
  const getDHLSize = (volume, weight) => {
    if (volume < 10 && weight < 5) return 'S';
    if (volume < 24 && weight < 10) return 'M';
    if (volume < 60 && weight < 15) return 'L';
    if (volume < 240 && weight < 20) return 'XL';
    if (volume < 432 && weight < 31.5) return 'XXL';
    return 'XXL'; // Default to largest
  };

  // Determine UPS size category
  const getUPSSize = (volume, weight) => {
    if (volume <= 15 && weight <= 3) return { volume: '15dm3', weight: '0-3kg' };
    if (volume <= 25 && weight <= 5) return { volume: '25dm3', weight: '3-5kg' };
    if (volume <= 50 && weight <= 10) return { volume: '50dm3', weight: '5-10kg' };
    if (volume <= 75 && weight <= 15) return { volume: '75dm3', weight: '10-15kg' };
    if (volume <= 100 && weight <= 20) return { volume: '100dm3', weight: '15-20kg' };
    return { volume: '150dm3', weight: '20-30kg' };
  };

  const volumeTier = getVolumeTier(monthlyShipments);
  const dhlSize = getDHLSize(volume, weight);
  const upsSize = getUPSSize(volume, weight);

  // PostNL Parcel Shipment Netherlands rates - Tariff (standard rates)
  const postNLRatesTariff = {
    '1-250': 7.45,
    '250-500': 7.3,
    '500-1000': 7.1,
    '1000-2500': 6.9,
    '2500-5000': 6.7,
    premium: null, // Request quote
  };

  // PostNL Parcel Shipment Netherlands rates - MyParcel Parcel* (discounted rates, includes €0.10 label contribution)
  const postNLRatesMyParcel = {
    '1-250': 7.2,
    '250-500': 7.05,
    '500-1000': 6.85,
    '1000-2500': 6.65,
    '2500-5000': 6.45,
    premium: null, // Request quote
  };

  const postNLRates = useMyParcelRates ? postNLRatesMyParcel : postNLRatesTariff;

  // DHL Parcel Shipment (DHL For You - consumer delivery) rates - Tariff (standard rates)
  const dhlRatesTariff = {
    '1-250': {
      S: 6.25,
      M: 6.55,
      L: 7.5,
      XL: 10.9,
      XXL: 19.8,
    },
    '250-500': {
      S: 6.0,
      M: 6.35,
      L: 7.3,
      XL: 10.65,
      XXL: 19.45,
    },
    '500-1000': {
      S: 5.8,
      M: 6.15,
      L: 7.1,
      XL: 10.45,
      XXL: 19.2,
    },
    '1000-2500': {
      S: 5.55,
      M: 5.95,
      L: 6.9,
      XL: 10.25,
      XXL: 19.0,
    },
    '2500-5000': {
      S: 5.4,
      M: 5.8,
      L: 6.65,
      XL: 10.05,
      XXL: 18.8,
    },
    premium: null, // Request quote
  };

  // DHL Parcel Shipment (DHL For You - consumer delivery) rates - MyParcel Parcel* (discounted rates)
  const dhlRatesMyParcel = {
    '1-250': {
      S: 6.0,
      M: 6.3,
      L: 7.25,
      XL: 10.65,
      XXL: 19.55,
    },
    '250-500': {
      S: 5.75,
      M: 6.1,
      L: 7.05,
      XL: 10.4,
      XXL: 19.2,
    },
    '500-1000': {
      S: 5.55,
      M: 5.9,
      L: 6.85,
      XL: 10.2,
      XXL: 18.95,
    },
    '1000-2500': {
      S: 5.3,
      M: 5.7,
      L: 6.65,
      XL: 10.0,
      XXL: 18.75,
    },
    '2500-5000': {
      S: 5.15,
      M: 5.55,
      L: 6.4,
      XL: 9.8,
      XXL: 18.55,
    },
    premium: null, // Request quote
  };

  const dhlRates = useMyParcelRates ? dhlRatesMyParcel : dhlRatesTariff;

  // DPD Parcel Shipment Netherlands rates - Tariff (standard rates)
  const dpdRatesTariff = {
    '1-250': 6.95,
    '250-500': 6.75,
    '500-1000': 6.55,
    '1000-2500': 6.35,
    '2500-5000': 6.2,
    premium: null, // Request quote
  };

  // DPD Parcel Shipment Netherlands rates - MyParcel Parcel* (discounted rates, includes €0.10 label contribution)
  const dpdRatesMyParcel = {
    '1-250': 6.7,
    '250-500': 6.5,
    '500-1000': 6.3,
    '1000-2500': 6.1,
    '2500-5000': 5.95,
    premium: null, // Request quote
  };

  const dpdRates = useMyParcelRates ? dpdRatesMyParcel : dpdRatesTariff;

  // UPS Package Netherlands - Standard rates - Tariff (standard rates)
  const upsRatesTariff = {
    '1-250': {
      '15dm3-0-3kg': 6.45,
      '25dm3-3-5kg': 6.45,
      '50dm3-5-10kg': 6.45,
      '75dm3-10-15kg': 6.75,
      '100dm3-15-20kg': 7.25,
      '150dm3-20-30kg': 7.65,
    },
    '250-500': {
      '15dm3-0-3kg': 6.25,
      '25dm3-3-5kg': 6.25,
      '50dm3-5-10kg': 6.25,
      '75dm3-10-15kg': 6.55,
      '100dm3-15-20kg': 7.05,
      '150dm3-20-30kg': 7.45,
    },
    '500-1000': {
      '15dm3-0-3kg': 6.1,
      '25dm3-3-5kg': 6.1,
      '50dm3-5-10kg': 6.1,
      '75dm3-10-15kg': 6.4,
      '100dm3-15-20kg': 6.9,
      '150dm3-20-30kg': 7.3,
    },
    '1000-2500': {
      '15dm3-0-3kg': 5.9,
      '25dm3-3-5kg': 5.9,
      '50dm3-5-10kg': 5.9,
      '75dm3-10-15kg': 6.2,
      '100dm3-15-20kg': 6.7,
      '150dm3-20-30kg': 7.1,
    },
    '2500-5000': {
      '15dm3-0-3kg': 5.8,
      '25dm3-3-5kg': 5.8,
      '50dm3-5-10kg': 5.8,
      '75dm3-10-15kg': 6.1,
      '100dm3-15-20kg': 6.6,
      '150dm3-20-30kg': 7.0,
    },
    premium: null, // Request quote
  };

  // UPS Package Netherlands - Standard rates - MyParcel Parcel* (discounted rates)
  const upsRatesMyParcel = {
    '1-250': {
      '15dm3-0-3kg': 6.2,
      '25dm3-3-5kg': 6.2,
      '50dm3-5-10kg': 6.2,
      '75dm3-10-15kg': 6.5,
      '100dm3-15-20kg': 7.0,
      '150dm3-20-30kg': 7.4,
    },
    '250-500': {
      '15dm3-0-3kg': 6.0,
      '25dm3-3-5kg': 6.0,
      '50dm3-5-10kg': 6.0,
      '75dm3-10-15kg': 6.3,
      '100dm3-15-20kg': 6.8,
      '150dm3-20-30kg': 7.2,
    },
    '500-1000': {
      '15dm3-0-3kg': 5.85,
      '25dm3-3-5kg': 5.85,
      '50dm3-5-10kg': 5.85,
      '75dm3-10-15kg': 6.15,
      '100dm3-15-20kg': 6.65,
      '150dm3-20-30kg': 7.05,
    },
    '1000-2500': {
      '15dm3-0-3kg': 5.65,
      '25dm3-3-5kg': 5.65,
      '50dm3-5-10kg': 5.65,
      '75dm3-10-15kg': 5.95,
      '100dm3-15-20kg': 6.45,
      '150dm3-20-30kg': 6.85,
    },
    '2500-5000': {
      '15dm3-0-3kg': 5.55,
      '25dm3-3-5kg': 5.55,
      '50dm3-5-10kg': 5.55,
      '75dm3-10-15kg': 5.85,
      '100dm3-15-20kg': 6.35,
      '150dm3-20-30kg': 6.75,
    },
    premium: null, // Request quote
  };

  const upsRates = useMyParcelRates ? upsRatesMyParcel : upsRatesTariff;

  // Calculate rates for each carrier
  const rates = [];

  // PostNL
  if (validCarriers.includes(CARRIERS.POSTNL)) {
    const postNLPrice = postNLRates[volumeTier];
    if (postNLPrice !== null) {
      const rateType = useMyParcelRates ? 'MyParcel Parcel*' : 'Tariff';
      rates.push({
        id: `${CARRIERS.POSTNL.id}-${volumeTier}-${rateType
          .replace(/\s+/g, '-')
          .replace(/\*/g, '')}`,
        carrier: CARRIERS.POSTNL,
        service: 'Parcel Shipment',
        destination: 'Netherlands',
        price: Math.round(postNLPrice * 100), // Convert to cents (subunits)
        currency: 'EUR',
        volumeTier,
        rateType,
        estimatedDays: 1,
        description: useMyParcelRates
          ? 'Standard parcel delivery within Netherlands (MyParcel Parcel rate, includes €0.10 label contribution)'
          : 'Standard parcel delivery within Netherlands (Tariff rate)',
      });
    }
  }

  // DHL
  if (validCarriers.includes(CARRIERS.DHL)) {
    const dhlPrice = dhlRates[volumeTier]?.[dhlSize];
    if (dhlPrice !== null && dhlPrice !== undefined) {
      const rateType = useMyParcelRates ? 'MyParcel Parcel*' : 'Tariff';
      rates.push({
        id: `${CARRIERS.DHL.id}-${volumeTier}-${dhlSize}-${rateType
          .replace(/\s+/g, '-')
          .replace(/\*/g, '')}`,
        carrier: CARRIERS.DHL,
        service: 'DHL For You',
        destination: 'Netherlands',
        price: Math.round(dhlPrice * 100), // Convert to cents (subunits)
        currency: 'EUR',
        volumeTier,
        size: dhlSize,
        rateType,
        estimatedDays: 1,
        description: 'DHL For You - consumer delivery (Monday to Saturday)',
      });
    }
  }

  // DPD
  if (validCarriers.includes(CARRIERS.DPD)) {
    const dpdPrice = dpdRates[volumeTier];
    if (dpdPrice !== null) {
      const rateType = useMyParcelRates ? 'MyParcel Parcel*' : 'Tariff';
      rates.push({
        id: `${CARRIERS.DPD.id}-${volumeTier}-${rateType.replace(/\s+/g, '-').replace(/\*/g, '')}`,
        carrier: CARRIERS.DPD,
        service: 'Parcel Shipment',
        destination: 'Netherlands',
        price: Math.round(dpdPrice * 100), // Convert to cents (subunits)
        currency: 'EUR',
        volumeTier,
        rateType,
        estimatedDays: 1,
        description: useMyParcelRates
          ? 'Standard parcel delivery within Netherlands (MyParcel Parcel rate, includes €0.10 label contribution)'
          : 'Standard parcel delivery within Netherlands (Tariff rate)',
      });
    }
  }

  // UPS
  if (validCarriers.includes(CARRIERS.UPS)) {
    const upsKey = `${upsSize.volume}-${upsSize.weight}`;
    const upsPrice = upsRates[volumeTier]?.[upsKey];
    if (upsPrice !== null && upsPrice !== undefined) {
      const rateType = useMyParcelRates ? 'MyParcel Parcel*' : 'Tariff';
      rates.push({
        id: `${CARRIERS.UPS.id}-${volumeTier}-${upsKey}-${rateType
          .replace(/\s+/g, '-')
          .replace(/\*/g, '')}`,
        carrier: CARRIERS.UPS,
        service: 'Standard',
        destination: 'Netherlands',
        price: Math.round(upsPrice * 100), // Convert to cents (subunits)
        currency: 'EUR',
        volumeTier,
        size: upsKey,
        rateType,
        estimatedDays: 1,
        description: 'UPS Standard delivery within Netherlands',
      });
    }
  }
  return rates;
};

// Export constants for reuse
module.exports = getAll;
module.exports.CARRIERS = CARRIERS;
module.exports.ALL_CARRIERS = ALL_CARRIERS;
