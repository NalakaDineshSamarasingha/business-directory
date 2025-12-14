interface Service {
  id: string;
  name: string;
  description: string;
  price?: string;
  duration?: string;
}

interface ServicesSectionProps {
  services: Service[];
}

export default function ServicesSection({ services }: ServicesSectionProps) {
  if (!services || services.length === 0) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Services Offered</h2>
      </div>
      <div className="grid gap-4">
        {services.map((service) => (
          <div key={service.id} className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">{service.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{service.description}</p>
                <div className="flex gap-3 text-sm">
                  {service.price && (
                    <span className="text-green-700 font-medium">{service.price}</span>
                  )}
                  {service.duration && (
                    <span className="text-gray-600">{service.duration}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
