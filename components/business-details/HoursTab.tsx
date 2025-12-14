interface HoursTabProps {
  businessHours?: Record<string, { open?: string; close?: string; closed?: boolean }>;
  formatTime: (time: string) => string;
  getDayName: (day: string) => string;
}

export default function HoursTab({ businessHours, formatTime, getDayName }: HoursTabProps) {
  if (!businessHours) {
    return (
      <div className="py-8 text-center text-gray-500">
        No hours information available
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Business Hours</h3>
      <div className="space-y-4">
        {Object.entries(businessHours).map(([day, hours]) => (
          <div key={day} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
            <span className="text-gray-900 font-medium capitalize">{getDayName(day)}</span>
            <span className="text-gray-700">
              {hours.closed ? (
                <span className="text-red-600">Closed</span>
              ) : (
                `${formatTime(hours.open || '')} - ${formatTime(hours.close || '')}`
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
