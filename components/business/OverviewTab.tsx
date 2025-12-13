"use client";

import { BusinessData } from "@/services/firestore.service";

interface OverviewTabProps {
  businessData: BusinessData;
  formData: {
    businessName: string;
    tagline: string;
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
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#151D26] disabled:bg-gray-50 text-gray-900"
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
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#151D26] disabled:bg-gray-50 text-gray-900"
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
          Tagline
        </label>
        <input
          type="text"
          name="tagline"
          value={formData.tagline}
          onChange={onInputChange}
          disabled={!isEditing}
          maxLength={100}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#151D26] disabled:bg-gray-50 text-gray-900"
          placeholder="A short catchy phrase about your business (max 100 characters)"
        />
        <p className="text-xs text-gray-500 mt-1">{formData.tagline.length}/100 characters</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Full Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={onInputChange}
          disabled={!isEditing}
          rows={6}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#151D26] disabled:bg-gray-50 text-gray-900"
          placeholder="Tell customers about your business in detail..."
        />
      </div>
    </div>
  );
}
