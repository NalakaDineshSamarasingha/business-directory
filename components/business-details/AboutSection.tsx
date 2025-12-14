interface AboutSectionProps {
  description?: string | null;
  amenities?: string[];
  specialties?: string[];
  paymentMethods?: string[];
  languages?: string[];
}

export default function AboutSection({
  description,
  amenities,
  specialties,
  paymentMethods,
  languages
}: AboutSectionProps) {
  return (
    <div className="space-y-6">
      {/* Description */}
      {description && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">About</h3>
          <p className="text-gray-700 leading-relaxed">{description}</p>
        </div>
      )}

      {/* Amenities & More */}
      {(amenities && amenities.length > 0) && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Amenities & More</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {amenities.map((amenity, index) => (
              <div key={index} className="flex items-center gap-2 text-gray-700">
                <svg className="w-5 h-5 text-[#00aa6c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {amenity}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Specialties */}
      {(specialties && specialties.length > 0) && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Specialties</h3>
          <div className="flex flex-wrap gap-2">
            {specialties.map((specialty, index) => (
              <span
                key={index}
                className="px-4 py-2 bg-gray-100 text-gray-800 rounded-full text-sm"
              >
                {specialty}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Payment Methods */}
      {(paymentMethods && paymentMethods.length > 0) && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Accepted Payment Methods</h3>
          <div className="flex flex-wrap gap-2">
            {paymentMethods.map((method, index) => (
              <span
                key={index}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-full text-sm"
              >
                {method}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Languages */}
      {(languages && languages.length > 0) && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Languages Spoken</h3>
          <div className="flex flex-wrap gap-2">
            {languages.map((language, index) => (
              <span
                key={index}
                className="px-4 py-2 bg-gray-100 text-gray-800 rounded-full text-sm"
              >
                {language}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
