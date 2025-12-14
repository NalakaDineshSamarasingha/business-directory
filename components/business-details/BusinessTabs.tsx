interface BusinessTabsProps {
  activeTab: 'overview' | 'hours' | 'location' | 'service access';
  onTabChange: (tab: 'overview' | 'hours' | 'location' | 'service access') => void;
}

export default function BusinessTabs({ activeTab, onTabChange }: BusinessTabsProps) {
  const tabs = ['overview', 'hours', 'location', 'service access'];

  return (
    <div className="bg-white border-b sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex gap-8">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => onTabChange(tab as any)}
              className={`py-4 font-semibold border-b-4 transition-colors capitalize ${
                activeTab === tab
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-600 hover:text-black'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
