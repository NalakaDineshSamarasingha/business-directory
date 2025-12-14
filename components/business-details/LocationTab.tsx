interface LocationTabProps {
  address?: string;
  latitude?: number;
  longitude?: number;
}

export default function LocationTab({ address, latitude, longitude }: LocationTabProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Address</h3>
        <p className="text-gray-700">{address || 'Address not available'}</p>
        {address && (
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Get Directions
          </a>
        )}
      </div>

      {latitude && longitude && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="aspect-video bg-gray-200 flex items-center justify-center">
            <iframe
              width="100%"
              height="100%"
              frameBorder="0"
              style={{ border: 0 }}
              src={`https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${latitude},${longitude}`}
              allowFullScreen
            />
          </div>
        </div>
      )}
    </div>
  );
}
