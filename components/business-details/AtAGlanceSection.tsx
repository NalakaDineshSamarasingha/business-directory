interface AtAGlanceSectionProps {
  isOpen: boolean;
  closingTime?: string;
  address?: string;
  website?: string | null;
  phone?: string | null;
  email?: string | null;
  onTabChange: (tab: 'hours' | 'location') => void;
}

export default function AtAGlanceSection({
  isOpen,
  closingTime,
  address,
  website,
  phone,
  email,
  onTabChange
}: AtAGlanceSectionProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">At a glance</h2>
      <div className="space-y-4">
        {/* Opening Hours */}
        {closingTime && (
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-[#00aa6c] mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-semibold text-[#00aa6c]">
                {isOpen ? 'Open' : 'Closed'} {closingTime}
              </p>
              <button
                onClick={() => onTabChange('hours')}
                className="text-sm text-gray-600 hover:underline"
              >
                See all hours
              </button>
            </div>
          </div>
        )}

        {/* Address */}
        {address && (
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-gray-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <button
              onClick={() => onTabChange('location')}
              className="text-gray-900 hover:underline text-left"
            >
              {address}
            </button>
          </div>
        )}

        {/* Contact */}
        <div className="flex flex-wrap gap-6">
          {website && (
            <a
              href={website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-900 hover:underline"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              Website
            </a>
          )}
          {phone && (
            <a
              href={`tel:${phone}`}
              className="flex items-center gap-2 text-gray-900 hover:underline"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              {phone}
            </a>
          )}
          {email && (
            <a
              href={`mailto:${email}`}
              className="flex items-center gap-2 text-gray-900 hover:underline"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Email
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
