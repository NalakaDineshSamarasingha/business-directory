interface Service {
  id: string;
  name: string;
  description: string;
  price?: string;
  duration?: string;
}

interface ServiceAccessTabProps {
  services?: Service[];
}

export default function ServiceAccessTab({ services }: ServiceAccessTabProps) {
  if (!services || services.length === 0) {
    return (
      <div className="py-8 text-center text-gray-500">
        No services available for booking at this time
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Book a Service</h3>
        <p className="text-gray-600 mb-6">
          Select a service below to check availability and book an appointment
        </p>
        
        <div className="space-y-4">
          {services.map((service) => (
            <div
              key={service.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">{service.name}</h4>
                  {service.description && (
                    <p className="text-sm text-gray-600 mb-2">{service.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    {service.price && (
                      <span className="font-medium text-gray-900">
                        {service.price}
                      </span>
                    )}
                    {service.duration && (
                      <span>{service.duration}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex gap-3">
          <svg className="w-6 h-6 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h4 className="font-semibold text-blue-900 mb-1">Booking Information</h4>
            <p className="text-sm text-blue-800">
              All bookings are subject to availability. You will receive a confirmation email once your booking is confirmed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
