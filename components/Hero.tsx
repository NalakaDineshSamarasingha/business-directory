"use client";

import Link from "next/link";
import { useState } from "react";

export default function Hero() {
  const [activeTab, setActiveTab] = useState("all");

  const tabs = [
    { id: "all", label: "Search All"},
    { id: "hotels", label: "Hotels" },
    { id: "electronic", label: "Gadget" },
    { id: "restaurants", label: "Restaurants"},
    { id: "cruises", label: "Mobile"},
  ];

  return (
    <section className="min-h-screen pt-32 bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center space-y-12">
          {/* Heading */}
          <h1 className="text-4xl lg:text-5xl font-black text-[#1E3A2B] leading-tight">
            What do you need?
          </h1>

          {/* Tabs */}
          <div className="flex flex-wrap justify-center items-center gap-8 border-b-2 border-gray-200 pb-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 pb-2 text-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? "text-black border-b-4 border-black"
                    : "text-gray-600 hover:text-black"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="max-w-4xl mx-auto">
            <div className="relative flex items-center bg-white rounded-full shadow-lg border border-gray-200 overflow-hidden">
              <div className="pl-6 pr-4">
                <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Find the best local business..."
                className="flex-1 py-5 text-lg text-gray-800 placeholder-gray-500 focus:outline-none"
              />
              <button className="bg-[#00D084] text-white px-12 py-5 font-bold text-lg hover:bg-[#00B56F] transition-colors">
                Search
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
