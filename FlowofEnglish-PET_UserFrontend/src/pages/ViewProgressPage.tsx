// @ts-nocheck
"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import axios from "axios";
import toast from "react-hot-toast";
import { fetchUserProgress } from "../lib/api";
import { processUserData } from "../lib/data-processing";
import { useUserContext } from "../context/AuthContext";

/**
 * ViewProgressPage (PET) - Tabs added: Overview | Skills | Concepts | Recommendations
 * - Uses existing fetchUserProgress & processUserData
 * - Fetches cohorts, persists selected cohort/program to localStorage
 * - Simple, dependency-free tabs UI
 */

export default function ViewProgressPage() {
  const [loading, setLoading] = useState(true);
  const [processedData, setProcessedData] = useState(null);
  const [fetchedCohorts, setFetchedCohorts] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const { user } = useUserContext();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // Fetch cohorts
  useEffect(() => {
    const fetchCohorts = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/users/${user?.userId}/cohorts`);
        const data = res.data.userDetails?.allCohortsWithPrograms || res.data || [];
        setFetchedCohorts(data);

        // prefer saved selection
        const stored = localStorage.getItem("selectedCohortWithProgram");
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            const found = data.find((c) => c.cohortId === parsed.cohortId);
            if (found?.program?.programId) {
              setSelectedProgram(found.program.programId);
              return;
            }
          } catch (err) {
            // fallback to first
          }
        }

        if (data.length > 0) {
          setSelectedProgram(data[0].program.programId);
        }
      } catch (err) {
        console.error("Failed to load cohorts:", err);
        toast.error("Failed to load cohorts");
      }
    };
    if (user?.userId) fetchCohorts();
  }, [user?.userId, API_BASE_URL]);

  // Persist selection to localStorage whenever user picks a program (store cohortId+program)
  useEffect(() => {
    if (!selectedProgram || !fetchedCohorts.length) return;
    const cohort = fetchedCohorts.find((c) => c.program?.programId === selectedProgram);
    if (cohort) {
      localStorage.setItem("selectedCohortWithProgram", JSON.stringify({
        cohortId: cohort.cohortId,
        program: cohort.program
      }));
    }
  }, [selectedProgram, fetchedCohorts]);

  // Fetch progress
  useEffect(() => {
    const loadProgress = async () => {
      if (!selectedProgram) return;
      try {
        setLoading(true);
        const data = await fetchUserProgress(selectedProgram, user?.userId);
        const processed = processUserData(data?.concepts || []);
        setProcessedData(processed);
      } catch (err) {
        console.error("Error loading progress:", err);
        toast.error("Error loading progress data");
      } finally {
        setLoading(false);
      }
    };
    loadProgress();
  }, [selectedProgram, user?.userId]);

  if (loading || !processedData) return <Loader />;

  const {
    overallCompletion,
    totalScore,
    totalMaxScore,
    skillDistribution,
    conceptProgress,
    strengths,
    areasToImprove,
    skillScores,
    skillBasedConceptGroups,
  } = processedData;

  // safe defaults for charts
  const pieData = Array.isArray(skillDistribution) ? skillDistribution : [];
  const radarData = Array.isArray(skillScores) ? skillScores : [];
  const barData = Array.isArray(skillBasedConceptGroups) && skillBasedConceptGroups.length
    ? skillBasedConceptGroups
    : Array.isArray(conceptProgress) ? conceptProgress : [];

  const currentProgramName =
    fetchedCohorts.find((c) => c?.program?.programId === selectedProgram)?.program
      ?.programName || "";

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#E0F7FA] to-white overflow-hidden">
      <motion.div
        className="container mx-auto px-4 py-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-[#5bc3cd] mb-1">
              Learning Progress Dashboard
            </h1>
            <p className="text-gray-600">
              {currentProgramName ? `Program: ${currentProgramName}` : "Track your improvement and find focus areas"}
            </p>
          </div>

          <div className="w-64">
            <label className="text-sm font-semibold text-gray-700 mb-1 block">Select Program</label>
            <select
              value={selectedProgram || ""}
              onChange={(e) => setSelectedProgram(e.target.value)}
              className="border border-gray-300 rounded-md w-full p-2 bg-white"
            >
              {fetchedCohorts.map((c) => (
                <option key={c.cohortId} value={c.program.programId}>
                  {c.program.programName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <Tabs active={activeTab} onChange={(t) => setActiveTab(t)} />
        </div>

        {/* Tab content */}
        <div>
          {activeTab === "overview" && (
            <div className="space-y-8">
              {/* Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard title="Overall Completion" value={`${Math.round(overallCompletion)}%`} color="#5bc3cd" />
                <MetricCard title="Total Score" value={`${totalScore}/${totalMaxScore}`} color="#DB5788" />
                <MetricCard title="Mastered Concepts" value={strengths?.length?.toString() || "0"} color="#5bc3cd" />
                <MetricCard title="Areas to Improve" value={areasToImprove?.length?.toString() || "0"} color="#DB5788" />
              </div>

              {/* Charts row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ChartCard title="Skill Distribution">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        outerRadius={100}
                        label
                      >
                        {pieData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={["#5bc3cd", "#DB5788", "#FFB74D", "#81C784"][index % 4]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Skill Performance">
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="skill" />
                      <PolarRadiusAxis />
                      <Radar dataKey="score" stroke="#5bc3cd" fill="#5bc3cd" fillOpacity={0.5} />
                    </RadarChart>
                  </ResponsiveContainer>
                </ChartCard>
              </div>

              {/* Concept + Focus areas */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ChartCard title="Concept Progress">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={barData}>
                      <XAxis dataKey="name" hide />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="userScore" fill="#5bc3cd" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Focus Areas">
                  <ul className="space-y-2 text-sm text-gray-700">
                    {areasToImprove && areasToImprove.length ? (
                      areasToImprove.slice(0, 5).map((a, i) => (
                        <li key={i} className="p-2 bg-[#F9F9F9] rounded-md shadow-sm flex justify-between items-center">
                          <span>{a.name}</span>
                          <span className="text-[#DB5788] font-semibold">
                            {a.maxScore ? `${Math.round((a.userScore / a.maxScore) * 100)}%` : "N/A"}
                          </span>
                        </li>
                      ))
                    ) : (
                      <li className="p-2 bg-[#F9F9F9] rounded-md">No focus areas detected</li>
                    )}
                  </ul>
                </ChartCard>
              </div>
            </div>
          )}

          {activeTab === "skills" && (
            <div>
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
                <h2 className="text-2xl font-semibold text-[#5bc3cd] mb-4">Skill Breakdown</h2>
                {Array.isArray(skillScores) && skillScores.length ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {skillScores.map((s, idx) => (
                      <div key={idx} className="bg-white rounded-xl shadow p-4">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-medium text-gray-600">{s.skill}</div>
                          <div className="text-lg font-bold">{s.score}</div>
                        </div>
                        <div className="mt-3 h-2 w-full bg-gray-100 rounded">
                          <div style={{ width: `${Math.min(100, (s.score / (s.maxScore || 100)) * 100)}%` }} className="h-2 rounded bg-[#5bc3cd]" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 bg-white rounded shadow">Not enough skill data to show breakdown.</div>
                )}
              </motion.div>
            </div>
          )}

          {activeTab === "concepts" && (
            <div>
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
                <h2 className="text-2xl font-semibold text-[#5bc3cd] mb-4">Concepts</h2>

                <div className="space-y-6">
                  <ChartCard title="Concept Progress (Bar)">
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={barData}>
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="userScore" fill="#5bc3cd" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartCard>

                  <ChartCard title="Concept Mastery (List)">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Array.isArray(conceptProgress) && conceptProgress.length ? (
                        conceptProgress.map((c, i) => (
                          <div key={i} className="p-3 bg-white rounded shadow flex justify-between items-center">
                            <div>
                              <div className="font-medium">{c.name}</div>
                              <div className="text-xs text-gray-500">Score: {c.userScore}/{c.maxScore}</div>
                            </div>
                            <div className="text-sm font-semibold text-[#5bc3cd]">
                              {c.maxScore ? `${Math.round((c.userScore / c.maxScore) * 100)}%` : "N/A"}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 bg-white rounded shadow">No concept progress available.</div>
                      )}
                    </div>
                  </ChartCard>
                </div>
              </motion.div>
            </div>
          )}

          {activeTab === "recommendations" && (
            <div>
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
                <h2 className="text-2xl font-semibold text-[#5bc3cd] mb-4">Recommendations</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <CardWithHeader title="Strengths">
                    {strengths && strengths.length ? (
                      <ul className="space-y-2">
                        {strengths.map((s, i) => (
                          <li key={i} className="p-2 bg-[#F9F9F9] rounded">{s.name}</li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-sm text-gray-500">No strong concepts detected yet.</div>
                    )}
                  </CardWithHeader>

                  <CardWithHeader title="Areas to Improve">
                    {areasToImprove && areasToImprove.length ? (
                      <ul className="space-y-2">
                        {areasToImprove.map((a, i) => (
                          <li key={i} className="p-2 bg-[#FFF7F9] rounded flex justify-between items-center">
                            <span>{a.name}</span>
                            <span className="text-[#DB5788] font-semibold">
                              {a.maxScore ? `${Math.round((a.userScore / a.maxScore) * 100)}%` : "N/A"}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-sm text-gray-500">No immediate improvement areas!</div>
                    )}
                  </CardWithHeader>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

/* ---------------- UI Helper Components ---------------- */

function Tabs({ active, onChange }) {
  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "skills", label: "Skills" },
    { id: "concepts", label: "Concepts" },
    { id: "recommendations", label: "Recommendations" },
  ];

  return (
    <div className="bg-white rounded-md shadow p-2 flex gap-2">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
            active === t.id ? "bg-[#5bc3cd] text-white" : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

function MetricCard({ title, value, color }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition-all">
      <h3 className="text-gray-600 text-sm font-medium">{title}</h3>
      <p className="text-3xl font-bold" style={{ color }}>
        {value}
      </p>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition-all">
      <h3 className="text-lg font-semibold text-[#5bc3cd] mb-3">{title}</h3>
      {children}
    </div>
  );
}

function CardWithHeader({ title, children }) {
  return (
    <div className="bg-white rounded-xl shadow p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-md font-semibold">{title}</h4>
      </div>
      <div>{children}</div>
    </div>
  );
}

function Loader() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-4 border-[#5bc3cd] opacity-30" />
        <div className="absolute inset-0 rounded-full border-4 border-t-[#5bc3cd] border-transparent animate-spin" />
      </div>
      <p className="mt-4 text-[#5bc3cd] font-medium animate-pulse">Loading your progress...</p>
    </div>
  );
}
