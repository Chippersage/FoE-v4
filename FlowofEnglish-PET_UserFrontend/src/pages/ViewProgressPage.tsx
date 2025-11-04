// @ts-nocheck
import React, { useState } from "react";
import { motion } from "framer-motion";

export default function ViewProgressPage() {
  const [activeTab, setActiveTab] = useState("overview");

  const tabs = ["overview", "skills", "concepts", "recommendations"];

  const OverviewCard = ({ title, value, description, icon }) => (
    <div className="rounded-2xl bg-white shadow-sm border border-gray-200 p-4 flex flex-col justify-between hover:shadow-md transition-all duration-300">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <span className="text-2xl">{icon}</span>
      </div>
      <div className="mt-2 text-2xl font-semibold text-gray-800">{value}</div>
      <p className="text-xs text-gray-500 mt-1">{description}</p>
    </div>
  );

  return (
    <div className="relative min-h-screen bg-slate-50 overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          backgroundImage: "url('/images/cohort-bg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />
      <div className="absolute inset-0 bg-black/10 -z-10" />

      {/* Header */}
      <div className="container mx-auto py-8 px-4">
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-bold text-gray-800">Progress Overview</h1>
          <p className="text-gray-600 mt-1">
            Track your learning progress and insights
          </p>
        </div>

        {/* Select Program Dropdown */}
        <div className="mt-6 max-w-xs">
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Select Program
          </label>
          <select className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400">
            <option>Program A</option>
            <option>Program B</option>
            <option>Program C</option>
          </select>
        </div>

        {/* Tabs */}
        <div className="mt-8">
          <div className="grid grid-cols-4 gap-2 text-center border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 text-sm font-medium capitalize transition-all ${
                  activeTab === tab
                    ? "border-b-2 border-orange-500 text-orange-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Contents */}
          <div className="mt-8">
            {activeTab === "overview" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <OverviewCard
                    title="Overall Progress"
                    value="78%"
                    description="Completion across all concepts"
                    icon="📈"
                  />
                  <OverviewCard
                    title="Total Score"
                    value="420 / 500"
                    description="Points earned out of maximum"
                    icon="🏆"
                  />
                  <OverviewCard
                    title="Concepts Mastered"
                    value="14"
                    description="High proficiency areas"
                    icon="⭐"
                  />
                  <OverviewCard
                    title="Focus Areas"
                    value="3"
                    description="Concepts needing attention"
                    icon="🎯"
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="rounded-2xl bg-white shadow-sm border border-gray-200 p-5 h-80 flex items-center justify-center text-gray-500">
                    Pie Chart Placeholder
                  </div>
                  <div className="rounded-2xl bg-white shadow-sm border border-gray-200 p-5 h-80 flex items-center justify-center text-gray-500">
                    Radar Chart Placeholder
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "skills" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="rounded-2xl bg-white shadow-sm border border-gray-200 p-6 text-gray-600"
              >
                <h2 className="text-lg font-semibold text-gray-800 mb-3">
                  Skill Breakdown
                </h2>
                <p>
                  Placeholder for skill details and analysis. Will show visual
                  charts later.
                </p>
              </motion.div>
            )}

            {activeTab === "concepts" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                <div className="rounded-2xl bg-white shadow-sm border border-gray-200 p-6 h-96 flex items-center justify-center text-gray-500">
                  Bar Chart Placeholder
                </div>
                <div className="rounded-2xl bg-white shadow-sm border border-gray-200 p-6 h-96 flex items-center justify-center text-gray-500">
                  Heat Map Placeholder
                </div>
              </motion.div>
            )}

            {activeTab === "recommendations" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="rounded-2xl bg-white shadow-sm border border-gray-200 p-6 text-gray-600"
              >
                <h2 className="text-lg font-semibold text-gray-800 mb-3">
                  Recommendations
                </h2>
                <p>
                  Placeholder for personalized learning recommendations. Will be
                  dynamically generated later.
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}