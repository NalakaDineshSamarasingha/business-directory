"use client";

import { BusinessData } from "@/services/firestore.service";

interface OverviewTabProps {
  businessData: BusinessData;
  formData: {
    businessName: string;
    tagline: string;
    description: string;
    category: string;
    customCategory?: string;
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
          <optgroup label="Food & Beverage">
            <option value="Restaurant">Restaurant</option>
            <option value="Cafe">Cafe & Coffee Shop</option>
            <option value="Bar & Pub">Bar & Pub</option>
            <option value="Bakery">Bakery</option>
            <option value="Fast Food">Fast Food</option>
            <option value="Catering">Catering Service</option>
          </optgroup>
          <optgroup label="Retail & Shopping">
            <option value="Retail">Retail Store</option>
            <option value="Clothing">Clothing & Fashion</option>
            <option value="Grocery">Grocery & Supermarket</option>
            <option value="Electronics">Electronics Store</option>
            <option value="Furniture">Furniture & Home Decor</option>
            <option value="Jewelry">Jewelry & Accessories</option>
            <option value="Bookstore">Bookstore</option>
          </optgroup>
          <optgroup label="Professional Services">
            <option value="IT Services">IT Services & Support</option>
            <option value="Software Development">Software Development</option>
            <option value="Web Development">Web Development & Design</option>
            <option value="Consulting">Consulting Services</option>
            <option value="Accounting">Accounting & Tax Services</option>
            <option value="Legal">Legal Services</option>
            <option value="Marketing">Marketing & Advertising</option>
            <option value="Real Estate">Real Estate</option>
            <option value="Insurance">Insurance Services</option>
          </optgroup>
          <optgroup label="Health & Wellness">
            <option value="Healthcare">Healthcare & Medical</option>
            <option value="Dental">Dental Care</option>
            <option value="Pharmacy">Pharmacy</option>
            <option value="Fitness">Fitness & Gym</option>
            <option value="Spa & Salon">Spa & Salon</option>
            <option value="Yoga & Wellness">Yoga & Wellness</option>
          </optgroup>
          <optgroup label="Automotive & Transportation">
            <option value="Auto Repair">Auto Repair & Service</option>
            <option value="Car Dealership">Car Dealership</option>
            <option value="Logistics">Logistics & Shipping</option>
            <option value="Transportation">Transportation Services</option>
            <option value="Car Rental">Car Rental</option>
          </optgroup>
          <optgroup label="Hospitality & Travel">
            <option value="Hotel">Hotel & Lodging</option>
            <option value="Travel Agency">Travel Agency</option>
            <option value="Event Planning">Event Planning</option>
          </optgroup>
          <optgroup label="Home Services">
            <option value="Plumbing">Plumbing Services</option>
            <option value="Electrical">Electrical Services</option>
            <option value="Cleaning">Cleaning Services</option>
            <option value="Landscaping">Landscaping & Lawn Care</option>
            <option value="Construction">Construction & Contracting</option>
            <option value="Moving">Moving Services</option>
          </optgroup>
          <optgroup label="Education & Training">
            <option value="Education">Education & Training</option>
            <option value="Tutoring">Tutoring Services</option>
            <option value="Daycare">Daycare & Childcare</option>
            <option value="Driving School">Driving School</option>
          </optgroup>
          <optgroup label="Entertainment & Recreation">
            <option value="Entertainment">Entertainment</option>
            <option value="Photography">Photography & Videography</option>
            <option value="Music">Music & DJ Services</option>
            <option value="Sports">Sports & Recreation</option>
            <option value="Gaming">Gaming & Esports</option>
          </optgroup>
          <optgroup label="Beauty & Personal Care">
            <option value="Barber Shop">Barber Shop</option>
            <option value="Hair Salon">Hair Salon</option>
            <option value="Nail Salon">Nail Salon</option>
            <option value="Beauty Services">Beauty Services</option>
          </optgroup>
          <optgroup label="Pet Services">
            <option value="Veterinary">Veterinary Services</option>
            <option value="Pet Store">Pet Store</option>
            <option value="Pet Grooming">Pet Grooming</option>
          </optgroup>
          <optgroup label="Manufacturing & Production">
            <option value="Manufacturing">Manufacturing</option>
            <option value="Wholesale">Wholesale & Distribution</option>
            <option value="Printing">Printing Services</option>
          </optgroup>
          <optgroup label="Other">
            <option value="Non-Profit">Non-Profit Organization</option>
            <option value="Government">Government Services</option>
            <option value="Other">Other</option>
            <option value="Custom">Custom Category</option>
          </optgroup>
        </select>
      </div>

      {/* Custom Category Input */}
      {formData.category === 'Custom' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Enter Custom Category
          </label>
          <input
            type="text"
            name="customCategory"
            value={formData.customCategory || ''}
            onChange={onInputChange}
            disabled={!isEditing}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#151D26] disabled:bg-gray-50 text-gray-900"
            placeholder="Enter your business category"
          />
        </div>
      )}

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
