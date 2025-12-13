"use client";

import { useState } from "react";

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
  onBulkUpdate?: (days: string[], openTime: string, closeTime: string, closed: boolean) => void;
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
  onBulkUpdate,
}: BusinessHoursTabProps) {
  const [showQuickSet, setShowQuickSet] = useState(false);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [quickOpenTime, setQuickOpenTime] = useState("09:00");
  const [quickCloseTime, setQuickCloseTime] = useState("17:00");
  const [quickClosed, setQuickClosed] = useState(false);

  const handleDayToggle = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const selectPreset = (preset: string) => {
    switch (preset) {
      case "weekdays":
        setSelectedDays(["monday", "tuesday", "wednesday", "thursday", "friday"]);
        break;
      case "weekends":
        setSelectedDays(["saturday", "sunday"]);
        break;
      case "all":
        setSelectedDays([...DAYS]);
        break;
      case "none":
        setSelectedDays([]);
        break;
    }
  };

  const applyQuickSet = () => {
    if (selectedDays.length === 0) {
      alert("Please select at least one day");
      return;
    }

    if (onBulkUpdate) {
      onBulkUpdate(selectedDays, quickOpenTime, quickCloseTime, quickClosed);
    } else {
      // Fallback: trigger individual change events
      selectedDays.forEach((day) => {
        const openEvent = {
          target: { name: `${day}Open`, value: quickOpenTime, type: "time" },
        } as React.ChangeEvent<HTMLInputElement>;
        const closeEvent = {
          target: { name: `${day}Close`, value: quickCloseTime, type: "time" },
        } as React.ChangeEvent<HTMLInputElement>;
        const closedEvent = {
          target: { name: `${day}Closed`, checked: quickClosed, type: "checkbox" },
        } as React.ChangeEvent<HTMLInputElement>;

        onInputChange(openEvent);
        onInputChange(closeEvent);
        onInputChange(closedEvent);
      });
    }

    // Reset
    setSelectedDays([]);
    setShowQuickSet(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Business Hours</h3>
          <p className="text-sm text-gray-600 mt-1">
            Set your operating hours for each day of the week
          </p>
        </div>
        {isEditing && (
          <button
            onClick={() => setShowQuickSet(!showQuickSet)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Quick Set Hours
          </button>
        )}
      </div>

      {/* Quick Set Panel */}
      {isEditing && showQuickSet && (
        <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-semibold text-gray-900">Set Hours for Multiple Days</h4>
            <button
              onClick={() => setShowQuickSet(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Preset Buttons */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Quick Select:</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => selectPreset("weekdays")}
                className="px-3 py-1.5 bg-white border border-gray-300 rounded-md hover:bg-gray-50 text-sm font-medium"
              >
                Weekdays (Mon-Fri)
              </button>
              <button
                onClick={() => selectPreset("weekends")}
                className="px-3 py-1.5 bg-white border border-gray-300 rounded-md hover:bg-gray-50 text-sm font-medium"
              >
                Weekends (Sat-Sun)
              </button>
              <button
                onClick={() => selectPreset("all")}
                className="px-3 py-1.5 bg-white border border-gray-300 rounded-md hover:bg-gray-50 text-sm font-medium"
              >
                All Days
              </button>
              <button
                onClick={() => selectPreset("none")}
                className="px-3 py-1.5 bg-white border border-gray-300 rounded-md hover:bg-gray-50 text-sm font-medium"
              >
                Clear Selection
              </button>
            </div>
          </div>

          {/* Day Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Days:</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {DAYS.map((day) => (
                <label
                  key={day}
                  className={`flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                    selectedDays.includes(day)
                      ? "border-blue-500 bg-blue-100"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedDays.includes(day)}
                    onChange={() => handleDayToggle(day)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="font-medium text-sm">{DAY_LABELS[day]}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Closed Toggle */}
          <div className="mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={quickClosed}
                onChange={(e) => setQuickClosed(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="font-medium text-sm text-gray-700">Mark as Closed</span>
            </label>
          </div>

          {/* Time Inputs */}
          {!quickClosed && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Opening Time</label>
                <input
                  type="time"
                  value={quickOpenTime}
                  onChange={(e) => setQuickOpenTime(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Closing Time</label>
                <input
                  type="time"
                  value={quickCloseTime}
                  onChange={(e) => setQuickCloseTime(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>
            </div>
          )}

          {/* Apply Button */}
          <button
            onClick={applyQuickSet}
            disabled={selectedDays.length === 0}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            Apply to {selectedDays.length} Selected Day{selectedDays.length !== 1 ? "s" : ""}
          </button>
        </div>
      )}

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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#151D26] disabled:bg-gray-50 text-gray-900 disabled:text-gray-400"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#151D26] disabled:bg-gray-50 text-gray-900 disabled:text-gray-400"
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
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
