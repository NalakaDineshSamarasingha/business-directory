"use client";

import { useState } from "react";
import { BusinessData } from "@/services/firestore.service";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { COLLECTIONS } from "@/services/firestore.service";
import { showSuccess, showError } from "@/lib/utils/toast";

interface ServicesTabProps {
  businessData: BusinessData;
  userId: string;
  isEditing: boolean;
  onDataUpdate: () => void;
}

interface Service {
  id: string;
  name: string;
  description: string;
  price?: string;
  duration?: string;
}

export default function ServicesTab({
  businessData,
  userId,
  isEditing,
  onDataUpdate,
}: ServicesTabProps) {
  const [services, setServices] = useState<Service[]>(businessData.services || []);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    duration: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      duration: "",
    });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleAddService = async () => {
    if (!formData.name.trim() || !formData.description.trim()) {
      showError("Service name and description are required");
      return;
    }

    const newService: Service = {
      id: Date.now().toString(),
      name: formData.name.trim(),
      description: formData.description.trim(),
      ...(formData.price.trim() && { price: formData.price.trim() }),
      ...(formData.duration.trim() && { duration: formData.duration.trim() }),
    };

    const updatedServices = [...services, newService];

    try {
      const businessRef = doc(db, COLLECTIONS.BUSINESSES, userId);
      await updateDoc(businessRef, {
        services: updatedServices,
      });

      setServices(updatedServices);
      resetForm();
      showSuccess("Service added successfully!");
      onDataUpdate();
    } catch (error) {
      console.error("Error adding service:", error);
      showError("Failed to add service");
    }
  };

  const handleEditService = (service: Service) => {
    setEditingId(service.id);
    setFormData({
      name: service.name,
      description: service.description,
      price: service.price || "",
      duration: service.duration || "",
    });
    setIsAdding(true);
  };

  const handleUpdateService = async () => {
    if (!formData.name.trim() || !formData.description.trim()) {
      showError("Service name and description are required");
      return;
    }

    const updatedServices = services.map((service) =>
      service.id === editingId
        ? {
            ...service,
            name: formData.name.trim(),
            description: formData.description.trim(),
            ...(formData.price.trim() && { price: formData.price.trim() }),
            ...(formData.duration.trim() && { duration: formData.duration.trim() }),
          }
        : service
    );

    try {
      const businessRef = doc(db, COLLECTIONS.BUSINESSES, userId);
      await updateDoc(businessRef, {
        services: updatedServices,
      });

      setServices(updatedServices);
      resetForm();
      showSuccess("Service updated successfully!");
      onDataUpdate();
    } catch (error) {
      console.error("Error updating service:", error);
      showError("Failed to update service");
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    if (!confirm("Are you sure you want to delete this service?")) {
      return;
    }

    const updatedServices = services.filter((service) => service.id !== serviceId);

    try {
      const businessRef = doc(db, COLLECTIONS.BUSINESSES, userId);
      await updateDoc(businessRef, {
        services: updatedServices,
      });

      setServices(updatedServices);
      showSuccess("Service deleted successfully!");
      onDataUpdate();
    } catch (error) {
      console.error("Error deleting service:", error);
      showError("Failed to delete service");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Services Offered</h3>
          <p className="text-sm text-gray-600 mt-1">
            Add and manage the services your business offers
          </p>
        </div>
        {isEditing && !isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="bg-[#151D26] text-white px-4 py-2 rounded-lg hover:bg-[#2B3D4F] transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Service
          </button>
        )}
      </div>

      {/* Add/Edit Service Form */}
      {isEditing && isAdding && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h4 className="text-md font-semibold text-gray-900 mb-4">
            {editingId ? "Edit Service" : "Add New Service"}
          </h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#151D26] text-gray-900"
                placeholder="e.g., Haircut, Oil Change, Consultation"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#151D26] text-gray-900"
                placeholder="Describe what this service includes..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (Optional)
                </label>
                <input
                  type="text"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#151D26] text-gray-900"
                  placeholder="e.g., $50, $100-$150, Starting at $75"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (Optional)
                </label>
                <input
                  type="text"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#151D26] text-gray-900"
                  placeholder="e.g., 30 min, 1-2 hours"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={editingId ? handleUpdateService : handleAddService}
                className="bg-[#151D26] text-white px-6 py-2 rounded-lg hover:bg-[#2B3D4F] transition-colors"
              >
                {editingId ? "Update Service" : "Add Service"}
              </button>
              <button
                onClick={resetForm}
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Services List */}
      <div className="space-y-4">
        {services.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <svg
              className="w-16 h-16 mx-auto text-gray-400 mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No services added yet</h3>
            <p className="text-gray-500">
              {isEditing
                ? "Click the 'Add Service' button to add your first service"
                : "Enable editing to add services"}
            </p>
          </div>
        ) : (
          services.map((service) => (
            <div
              key={service.id}
              className="bg-white border border-gray-200 rounded-lg p-5 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    {service.name}
                  </h4>
                  <p className="text-gray-700 mb-3">{service.description}</p>
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    {service.price && (
                      <div className="flex items-center gap-2 text-green-700 bg-green-50 px-3 py-1 rounded-full">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-medium">{service.price}</span>
                      </div>
                    )}
                    {service.duration && (
                      <div className="flex items-center gap-2 text-blue-700 bg-blue-50 px-3 py-1 rounded-full">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-medium">{service.duration}</span>
                      </div>
                    )}
                  </div>
                </div>

                {isEditing && (
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleEditService(service)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit service"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteService(service.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete service"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
