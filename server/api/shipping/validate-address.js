const { serialize, handleError } = require('../../api-util/sdk');
const { ShippingServices } = require('../../services');

const validateAddress = async (req, res) => {
  const { cc, postal_code, city, number, street, region } = req.body;
  try {
    const response = await ShippingServices.addresses.validate({
      countryCode: cc,
      postalCode: postal_code,
      city: city,
      houseNumber: number,
      street: street,
      ...(region ? { region: region } : {}),
    });
    return res
      .status(200)
      .set('Content-Type', 'application/transit+json')
      .send(
        serialize({
          status: 200,
          statusText: 'OK',
          data: {
            valid: response.valid,
          },
        })
      );
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = validateAddress;
