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
        No services available
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Service Offered</h3>
      
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

      
    </div>
  );
}
