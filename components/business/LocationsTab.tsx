"use client";

import { useState } from "react";
import { BusinessData } from "@/services/firestore.service";

interface LocationsTabProps {
  businessData: BusinessData;
  isEditing: boolean;
  onDataUpdate: () => void;
  userId: string;
}

export default function LocationsTab({
  businessData,
  isEditing,
  onDataUpdate,
  userId,
}: LocationsTabProps) {
  const [locations, setLocations] = useState(businessData.locations || []);
  const [isAddingLocation, setIsAddingLocation] = useState(false);
  const [editingLocationId, setEditingLocationId] = useState<string | null>(null);
  const [newLocation, setNewLocation] = useState({
    name: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    googleMapUrl: "",
    phone: "",
  });

  const handleAddLocation = async () => {
    if (!newLocation.name || !newLocation.city) {
      return;
    }

    const locationData = {
      id: Date.now().toString(),
      name: newLocation.name,
      address: {
        street: newLocation.street,
        city: newLocation.city,
        state: newLocation.state,
        zipCode: newLocation.zipCode,
        country: newLocation.country,
      },
      googleMapUrl: newLocation.googleMapUrl,
      phone: newLocation.phone,
      isPrimary: locations.length === 0,
    };

    try {
      const updatedLocations = [...locations, locationData];
      
      // Update Firestore
      const { doc, updateDoc } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase/config');
      const { COLLECTIONS } = await import('@/services/firestore.service');
      
      const businessRef = doc(db, COLLECTIONS.BUSINESSES, userId);
      await updateDoc(businessRef, { locations: updatedLocations });

      setLocations(updatedLocations);
      setNewLocation({
        name: "",
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "",
        googleMapUrl: "",
        phone: "",
      });
      setIsAddingLocation(false);
      onDataUpdate();
    } catch (error) {
      console.error("Error adding location:", error);
    }
  };

  const handleDeleteLocation = async (locationId: string) => {
    if (!confirm("Are you sure you want to delete this location?")) {
      return;
    }

    try {
      const updatedLocations = locations.filter((loc) => loc.id !== locationId);
      
      const { doc, updateDoc } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase/config');
      const { COLLECTIONS } = await import('@/services/firestore.service');
      
      const businessRef = doc(db, COLLECTIONS.BUSINESSES, userId);
      await updateDoc(businessRef, { locations: updatedLocations });

      setLocations(updatedLocations);
      onDataUpdate();
    } catch (error) {
      console.error("Error deleting location:", error);
    }
  };

  const handleSetPrimary = async (locationId: string) => {
    try {
      const updatedLocations = locations.map((loc) => ({
        ...loc,
        isPrimary: loc.id === locationId,
      }));
      
      const { doc, updateDoc } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase/config');
      const { COLLECTIONS } = await import('@/services/firestore.service');
      
      const businessRef = doc(db, COLLECTIONS.BUSINESSES, userId);
      await updateDoc(businessRef, { locations: updatedLocations });

      setLocations(updatedLocations);
      onDataUpdate();
    } catch (error) {
      console.error("Error setting primary location:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Business Locations</h3>
          <p className="text-sm text-gray-600 mt-1">
            Manage all your business locations here
          </p>
        </div>
        {isEditing && !isAddingLocation && (
          <button
            onClick={() => setIsAddingLocation(true)}
            className="px-4 py-2 bg-[#151D26] text-white rounded-lg hover:bg-[#2B3D4F] transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Location
          </button>
        )}
      </div>

      {/* Add New Location Form */}
      {isAddingLocation && (
        <div className="bg-gray-50 rounded-lg p-6 border-2 border-[#151D26]">
          <h4 className="font-semibold text-gray-900 mb-4">Add New Location</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location Name *
              </label>
              <input
                type="text"
                value={newLocation.name}
                onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#151D26]"
                placeholder="e.g., Downtown Branch, Main Office"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Street Address
              </label>
              <input
                type="text"
                value={newLocation.street}
                onChange={(e) => setNewLocation({ ...newLocation, street: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#151D26]"
                placeholder="123 Main Street"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City *
              </label>
              <input
                type="text"
                value={newLocation.city}
                onChange={(e) => setNewLocation({ ...newLocation, city: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#151D26]"
                placeholder="New York"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State/Province
              </label>
              <input
                type="text"
                value={newLocation.state}
                onChange={(e) => setNewLocation({ ...newLocation, state: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#151D26]"
                placeholder="NY"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ZIP/Postal Code
              </label>
              <input
                type="text"
                value={newLocation.zipCode}
                onChange={(e) => setNewLocation({ ...newLocation, zipCode: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#151D26]"
                placeholder="10001"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country
              </label>
              <input
                type="text"
                value={newLocation.country}
                onChange={(e) => setNewLocation({ ...newLocation, country: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#151D26]"
                placeholder="United States"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={newLocation.phone}
                onChange={(e) => setNewLocation({ ...newLocation, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#151D26]"
                placeholder="+1 (555) 123-4567"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Google Maps URL
              </label>
              <input
                type="url"
                value={newLocation.googleMapUrl}
                onChange={(e) => setNewLocation({ ...newLocation, googleMapUrl: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#151D26]"
                placeholder="https://www.google.com/maps/embed?pb=..."
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleAddLocation}
              disabled={!newLocation.name || !newLocation.city}
              className="px-4 py-2 bg-[#151D26] text-white rounded-lg hover:bg-[#2B3D4F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Location
            </button>
            <button
              onClick={() => {
                setIsAddingLocation(false);
                setNewLocation({
                  name: "",
                  street: "",
                  city: "",
                  state: "",
                  zipCode: "",
                  country: "",
                  googleMapUrl: "",
                  phone: "",
                });
              }}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Locations List */}
      {locations.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No locations added yet</h3>
          <p className="text-gray-600 mb-4">
            Add your business locations to help customers find you
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {locations.map((location) => (
            <div key={location.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-[#151D26] rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900">{location.name}</h4>
                      {location.isPrimary && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                          Primary
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {[
                        location.address.street,
                        location.address.city,
                        location.address.state,
                        location.address.zipCode,
                        location.address.country,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                    {location.phone && (
                      <p className="text-sm text-gray-600 mt-1">
                        <span className="font-medium">Phone:</span> {location.phone}
                      </p>
                    )}
                  </div>
                </div>
                {isEditing && (
                  <div className="flex gap-2">
                    {!location.isPrimary && (
                      <button
                        onClick={() => handleSetPrimary(location.id)}
                        className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Set as primary location"
                      >
                        Set Primary
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteLocation(location.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete location"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
              {location.googleMapUrl && (
                <div className="mt-4 aspect-video rounded-lg overflow-hidden">
                  <iframe
                    src={location.googleMapUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
