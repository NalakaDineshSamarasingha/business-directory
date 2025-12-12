"use client";

interface BusinessHoursTabProps {
  formData: {
    mondayOpen: string;
    mondayClose: string;
    mondayClosed: boolean;
    tuesdayOpen: string;
    tuesdayClose: string;
    tuesdayClosed: boolean;
    wednesdayOpen: string;
    wednesdayClose: string;
    wednesdayClosed: boolean;
    thursdayOpen: string;
    thursdayClose: string;
    thursdayClosed: boolean;
    fridayOpen: string;
    fridayClose: string;
    fridayClosed: boolean;
    saturdayOpen: string;
    saturdayClose: string;
    saturdayClosed: boolean;
    sundayOpen: string;
    sundayClose: string;
    sundayClosed: boolean;
  };
  isEditing: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const DAY_LABELS: { [key: string]: string } = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

export default function BusinessHoursTab({
  formData,
  isEditing,
  onInputChange,
}: BusinessHoursTabProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Hours</h3>
        <p className="text-sm text-gray-600 mb-6">
          Set your operating hours for each day of the week
        </p>

        <div className="space-y-4">
          {DAYS.map((day) => {
            const openKey = `${day}Open` as keyof typeof formData;
            const closeKey = `${day}Close` as keyof typeof formData;
            const closedKey = `${day}Closed` as keyof typeof formData;

            return (
              <div
                key={day}
                className="border border-gray-200 rounded-lg p-4 bg-white hover:border-gray-300 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  {/* Day Label */}
                  <div className="w-32">
                    <label className="font-medium text-gray-900">
                      {DAY_LABELS[day]}
                    </label>
                  </div>

                  {/* Closed Checkbox */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name={closedKey}
                      checked={formData[closedKey] as boolean}
                      onChange={onInputChange}
                      disabled={!isEditing}
                      className="w-4 h-4 text-[#151D26] border-gray-300 rounded focus:ring-[#151D26] disabled:opacity-50"
                    />
                    <label className="ml-2 text-sm text-gray-700">Closed</label>
                  </div>

                  {/* Time Inputs */}
                  <div className="flex-1 flex items-center gap-3">
                    <div className="flex-1">
                      <label className="block text-xs text-gray-600 mb-1">
                        Opening Time
                      </label>
                      <input
                        type="time"
                        name={openKey}
                        value={formData[openKey] as string}
                        onChange={onInputChange}
                        disabled={!isEditing || (formData[closedKey] as boolean)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#151D26] disabled:bg-gray-50 disabled:text-gray-400"
                      />
                    </div>

                    <span className="text-gray-500 mt-5">to</span>

                    <div className="flex-1">
                      <label className="block text-xs text-gray-600 mb-1">
                        Closing Time
                      </label>
                      <input
                        type="time"
                        name={closeKey}
                        value={formData[closeKey] as string}
                        onChange={onInputChange}
                        disabled={!isEditing || (formData[closedKey] as boolean)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#151D26] disabled:bg-gray-50 disabled:text-gray-400"
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-2">
          <svg
            className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Tips for Business Hours:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-700">
              <li>Use 24-hour format or select AM/PM based on your browser</li>
              <li>Check &quot;Closed&quot; for days you don&apos;t operate</li>
              <li>Make sure your hours are accurate to help customers plan their visits</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
