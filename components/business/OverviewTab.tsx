"use client";

import { BusinessData } from "@/services/firestore.service";

interface OverviewTabProps {
  businessData: BusinessData;
  formData: {
    businessName: string;
    description: string;
    category: string;
  };
  isEditing: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

export default function OverviewTab({
  businessData,
  formData,
  isEditing,
  onInputChange,
}: OverviewTabProps) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Business Name
        </label>
        <input
          type="text"
          name="businessName"
          value={formData.businessName}
          onChange={onInputChange}
          disabled={!isEditing}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#151D26] disabled:bg-gray-50"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Category
        </label>
        <select
          name="category"
          value={formData.category}
          onChange={onInputChange}
          disabled={!isEditing}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#151D26] disabled:bg-gray-50"
        >
          <option value="">Select a category</option>
          <option value="Restaurant">Restaurant</option>
          <option value="Hotel">Hotel</option>
          <option value="Retail">Retail</option>
          <option value="Service">Service</option>
          <option value="Healthcare">Healthcare</option>
          <option value="Education">Education</option>
          <option value="Technology">Technology</option>
          <option value="Entertainment">Entertainment</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={onInputChange}
          disabled={!isEditing}
          rows={6}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#151D26] disabled:bg-gray-50"
          placeholder="Tell customers about your business..."
        />
      </div>
    </div>
  );
}
