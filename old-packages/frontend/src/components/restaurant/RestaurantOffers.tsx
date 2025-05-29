interface RestaurantOffersProps {
  offers?: Array<{
    type: string;
    discount: string;
    validTime: string;
  }>;
}

export const RestaurantOffers = ({
  offers = [],
}: RestaurantOffersProps): JSX.Element => {
  if (offers.length === 0) {
    offers = [
      {
        type: 'PRE-BOOK OFFER',
        discount: 'Flat 20% OFF',
        validTime: 'Valid from 8PM to 11:55PM',
      },
    ];
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Dining Offers</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {offers.map((offer, index) => (
          <div key={index} className="border rounded-lg p-4">
            <div className="text-blue-600 font-semibold mb-2">{offer.type}</div>
            <div className="text-lg font-bold">{offer.discount}</div>
            <div className="text-sm text-gray-600 mt-1">{offer.validTime}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
