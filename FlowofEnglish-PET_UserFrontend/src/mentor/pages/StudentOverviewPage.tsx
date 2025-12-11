// @ts-nocheck
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import axios from "axios";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip as ReTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
  Legend,
} from "recharts";

/*
  Full self-contained StudentOverviewPage.jsx
  - Fetches user-list, cohort progress, and concept progress
  - Processes concepts into 8 fixed umbrella skills (radar + mastery)
  - Renders RadarSkillChart inline (Recharts)
  - Export/Download PDF (html2canvas + jsPDF)
  - Uses VITE_API_BASE_URL
*/

/* ---------------------------
   UMBRELLA SKILL MAPPING
   covers all skill names from API -> 8 fixed skills
---------------------------- */
const UMBRELLA_SKILLS = {
  Speaking: "Speaking",
  Grammar: "Grammar",
  Reading: "Reading",
  Writing: "Writing",
  Vocabulary: "Vocabulary",
  Listening: "Listening",

  // everything else groups into Skill Development
  Communication: "Skill Development",
  "Classroom Management": "Skill Development",
  "Professional Development": "Skill Development",
  Planning: "Skill Development",
  Leadership: "Skill Development",
  Evaluation: "Skill Development",
  "Project Management": "Skill Development",
  Questioning: "Skill Development",
  Project: "Skill Development",
  // ConceptSkill2 values sometimes contain 'Speaking' etc. We'll fallback later.

  // Etiquette / Critical Thinking mapping:
  Etiquette: "Critical Thinking",
  "Critical Thinking": "Critical Thinking",
};

/* ---------------------------
   Helper: build final mapped skill (fallbacks)
---------------------------- */
function mapToUmbrellaSkill(rawSkill, altSkill) {
  if (!rawSkill && !altSkill) return "Skill Development";
  if (rawSkill && UMBRELLA_SKILLS[rawSkill]) return UMBRELLA_SKILLS[rawSkill];
  if (altSkill && UMBRELLA_SKILLS[altSkill]) return UMBRELLA_SKILLS[altSkill];

  // try to normalize common variations (lowercase, trim)
  const r = (rawSkill || "").toString().trim();
  const a = (altSkill || "").toString().trim();
  for (const key of Object.keys(UMBRELLA_SKILLS)) {
    if (key.toLowerCase() === r.toLowerCase()) return UMBRELLA_SKILLS[key];
    if (key.toLowerCase() === a.toLowerCase()) return UMBRELLA_SKILLS[key];
  }

  // fallback: if rawSkill looks like "Grammar" etc, use it directly if matches 8
  const direct = ["Speaking","Grammar","Reading","Writing","Vocabulary","Listening","Critical Thinking"];
  if (direct.includes(rawSkill)) return rawSkill;
  if (direct.includes(altSkill)) return altSkill;

  // unknown -> Skill Development
  return "Skill Development";
}

/* ---------------------------
   Process concepts -> radar + distribution
   Radar uses percentages (0-100)
   Distribution uses counts (completedSubconcepts)
---------------------------- */
function processConceptSkills(concepts = []) {
  const map = {
    Speaking: { score: 0, max: 0, count: 0 },
    Grammar: { score: 0, max: 0, count: 0 },
    "Skill Development": { score: 0, max: 0, count: 0 },
    Vocabulary: { score: 0, max: 0, count: 0 },
    Reading: { score: 0, max: 0, count: 0 },
    Writing: { score: 0, max: 0, count: 0 },
    Listening: { score: 0, max: 0, count: 0 },
    "Critical Thinking": { score: 0, max: 0, count: 0 },
  };

  concepts.forEach((c) => {
    // Prefer conceptSkill-1, but some entries may store relevant skill in conceptSkill-2
    const raw1 = c["conceptSkill-1"];
    const raw2 = c["conceptSkill-2"];
    const skill = mapToUmbrellaSkill(raw1, raw2);

    // Accumulate. Use userTotalScore and totalMaxScore to compute radar %
    const userScore = Number(c.userTotalScore || 0);
    const maxScore = Number(c.totalMaxScore || 0);
    const completed = Number(c.completedSubconcepts || 0);

    map[skill].score += userScore;
    map[skill].max += maxScore;
    map[skill].count += completed;
  });

  // radar data: calculate percent for each fixed skill
  const radar = [
    "Speaking",
    "Grammar",
    "Skill Development",
    "Vocabulary",
    "Reading",
    "Writing",
    "Listening",
    "Critical Thinking",
  ].map((skill) => {
    const entry = map[skill] || { score: 0, max: 0 };
    const value = entry.max === 0 ? 0 : Math.round((entry.score / entry.max) * 100);
    return { skill, value };
  });

  // distribution/mastery: we can use completed counts to show mastery
  const distribution = [
    "Speaking",
    "Grammar",
    "Skill Development",
    "Vocabulary",
    "Reading",
    "Writing",
    "Listening",
    "Critical Thinking",
  ].map((skill) => {
    const entry = map[skill] || { count: 0 };
    return { skill, count: entry.count };
  });

  return { radar, distribution, rawMap: map };
}

/* ---------------------------
   Simple color palette for radar bars / mastery
---------------------------- */
const SKILL_COLORS: Record<string, string> = {
  Speaking: "#4CAF50",
  Grammar: "#FF6B6B",
  "Skill Development": "#4ECDC4",
  Vocabulary: "#FFD166",
  Reading: "#5A67D8",
  Writing: "#EF9F9F",
  Listening: "#9AE6B4",
  "Critical Thinking": "#F472B6",
};

/* ---------------------------
   RadarSkillChart component (self-contained)
   expects prop `data` = [{ skill, value }, ...]
---------------------------- */
function RadarSkillChart({ data = [] }) {
  // ensure data in required order (fixed)
  const order = [
    "Speaking",
    "Grammar",
    "Skill Development",
    "Vocabulary",
    "Reading",
    "Writing",
    "Listening",
    "Critical Thinking",
  ];
  const displayData = order.map((s) => {
    const found = (data || []).find((d) => d.skill === s);
    return { skill: s, value: found ? Number(found.value || 0) : 0 };
  });

  const CustomTick = ({ payload, x, y, textAnchor }) => {
    const color = SKILL_COLORS[payload.value] || "#374151";
    return (
      <text x={x} y={y} textAnchor={textAnchor} fill={color} fontWeight="600" fontSize={12}>
        {payload.value}
      </text>
    );
  };

  const CustomTooltip = ({ payload, active }) => {
    if (!active || !payload || !payload.length) return null;
    const p = payload[0];
    return (
      <div className="bg-white p-2 rounded shadow text-sm border">
        <div className="font-semibold">{p.payload.skill}</div>
        <div>Score: {p.value}%</div>
      </div>
    );
  };

  return (
    <div style={{ width: "100%", height: 340 }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={displayData}>
          <PolarGrid />
          <PolarAngleAxis dataKey="skill" tick={CustomTick} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} />
          <ReTooltip content={<CustomTooltip />} />
          <Radar
            name="Score"
            dataKey="value"
            stroke="#374151"
            fill="#374151"
            fillOpacity={0.6}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ---------------------------
   StudentOverviewPage main
---------------------------- */
export default function StudentOverviewPage() {
  const { cohortId, programId, userId } = useParams();
  const navigate = useNavigate();
  const pageRef = useRef(null);

  const [user, setUser] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [conceptsDebug, setConceptsDebug] = useState(null);

  const API = import.meta.env.VITE_API_BASE_URL || "";

  const downloadReport = async () => {
    try {
      const element = pageRef.current;
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${(user?.userName || userId)}_Report.pdf`);
    } catch (e) {
      console.error("Download report error:", e);
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const mentor = JSON.parse(localStorage.getItem("user") || "{}");
        const mentorId = mentor?.userId;

        // 1. fetch user list (phone/email)
        const userListRes = await axios.get(
          `${API}/user-cohort-mappings/mentor/${mentorId}/cohort/${cohortId}/users`
        );
        const userInfo = userListRes.data.users.find((u) => u.userId === userId);
        if (!userInfo) {
          throw new Error("User not found in cohort users API");
        }

        // 2. fetch progress summary (stages/units)
        const progressRes = await axios.get(
          `${API}/reports/mentor/${mentorId}/program/${programId}/cohort/${cohortId}/progress`
        );
        const progressInfo = progressRes.data.users.find((u) => u.userId === userId) || {};

        // 3. fetch concept-level progress for this user
        const conceptRes = await axios.get(
          `${API}/programs/${programId}/concepts/progress/${userId}`
        );
        const concepts = conceptRes.data.concepts || [];

        // save raw for debugging if needed
        setConceptsDebug(concepts);

        // process into radar + distribution
        const { radar, distribution } = processConceptSkills(concepts);

        // set user meta
        setUser({
          userId: userInfo.userId,
          userName: userInfo.userName,
          userEmail: userInfo.userEmail,
          userPhoneNumber: userInfo.userPhoneNumber,
          createdAt: userInfo.createdAt,
        });

        // set progress summary, assignments are hardcoded as requested
        setProgress({
          cohortName: userListRes.data.cohort?.cohortName || "",
          joinedOn: userInfo.createdAt
            ? new Date(userInfo.createdAt * 1000).toLocaleDateString()
            : "--",
          lastActive: "--",
          completedStages: progressInfo.completedStages || 0,
          totalStages: progressInfo.totalStages || 0,
          completedUnits: progressInfo.completedUnits || 0,
          totalUnits: progressInfo.totalUnits || 0,
          concepts: radar,
          scores: distribution,
          assignments: [
            { name: "Stage 1 Assignment", status: "Completed", score: "18/20", due: "Jan 30" },
            { name: "Grammar Test 1", status: "Completed", score: "16/20", due: "Feb 2" },
            { name: "Reading Task", status: "Pending", score: "-", due: "Feb 15" },
          ],
          timeline: [
            { title: "Completed Stage 1", date: "Jan 28" },
            { title: "Completed Grammar Test 1", date: "Feb 03" },
            { title: "Submitted Speaking Practice", date: "Feb 08" },
          ],
        });
      } catch (err) {
        console.error("StudentOverviewPage load error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (userId && cohortId && programId) load();
    else setLoading(false);
  }, [userId, cohortId, programId, API]);

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center text-gray-500">
        <Loader2 className="animate-spin" /> Loading...
      </div>
    );

  if (!user || !progress)
    return (
      <div className="h-screen flex items-center justify-center text-gray-500">
        No data available
      </div>
    );

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto" ref={pageRef}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start border-b pb-3 mb-6 gap-3">
        <button
          className="text-blue-600 flex items-center gap-2"
          onClick={() => navigate(`/mentor/${cohortId}/${programId}/learners`)}
        >
          <ArrowLeft size={18} /> Back to Learners
        </button>

        <div className="text-center sm:text-left">
          <h1 className="text-xl sm:text-2xl font-semibold">{user.userName}</h1>
          <p className="text-gray-500 text-sm">Learner ID: {user.userId}</p>
          <p className="text-gray-500 text-sm">Email: {user.userEmail || "Not provided"}</p>
          <p className="text-gray-500 text-sm">Phone: {user.userPhoneNumber || "Not provided"}</p>
        </div>

        <div className="text-right text-sm">
          <p className="text-gray-700">
            Cohort: <span className="font-semibold">{progress.cohortName}</span>
          </p>
          <p className="text-gray-500">Joined: {progress.joinedOn}</p>
          <p className="text-gray-500">Last Active: {progress.lastActive}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Stages Completed"
          value={`${progress.completedStages}/${progress.totalStages}`}
          color="bg-blue-50 text-blue-700"
        />
        <StatCard
          label="Units Completed"
          value={`${progress.completedUnits}/${progress.totalUnits}`}
          color="bg-green-50 text-green-700"
        />
        <StatCard
          label="Skill Score (pts)"
          value={progress.scores.reduce((a, b) => a + (b.count || 0), 0)}
          color="bg-purple-50 text-purple-700"
        />
        <div className="flex items-center justify-center">
          <button
            onClick={downloadReport}
            className="bg-blue-600 text-white rounded-lg px-4 py-3 shadow text-sm font-semibold"
          >
            Download Report
          </button>
        </div>
      </div>

      {/* Radar + Score Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-2 bg-white rounded-xl shadow p-4">
          <h2 className="text-lg font-semibold mb-3">Skills Overview</h2>
          <RadarSkillChart data={progress.concepts} />
        </div>

        <div className="bg-white rounded-xl shadow p-4">
          <h2 className="text-lg font-semibold mb-3">Skill Mastery</h2>
          <div className="space-y-3 max-h-72 overflow-y-auto">
            {progress.scores.map((s) => (
              <div key={s.skill} className="p-2 rounded border" style={{ borderColor: SKILL_COLORS[s.skill] || "#e5e7eb" }}>
                <div className="flex justify-between items-center">
                  <div className="font-medium">{s.skill}</div>
                  <div className="font-semibold">{s.count}</div>
                </div>
                <div className="w-full bg-gray-200 h-2 rounded mt-2">
                  <div
                    className="h-2 rounded"
                    style={{
                      width: `${Math.min(100, (s.count / Math.max(1, Math.max(...progress.scores.map(p => p.count)))) * 100)}%`,
                      backgroundColor: SKILL_COLORS[s.skill] || "#374151",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Assignments */}
      <div className="bg-white rounded-xl shadow p-4 mb-8">
        <h2 className="text-lg font-semibold mb-4">Assignments & Grading</h2>
        <AssignmentsTable assignments={progress.assignments} />
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-xl shadow p-4 mb-8">
        <h2 className="text-lg font-semibold mb-4">Timeline & Activity</h2>
        <TimelineActivity events={progress.timeline} />
      </div>

      {/* Remarks */}
      <div className="bg-white rounded-xl shadow p-4 mb-20">
        <h2 className="text-lg font-semibold mb-3">Mentor Remarks</h2>
        <textarea rows={5} className="w-full border rounded-md p-3" placeholder="Write your remarks here..." />
        <div className="flex justify-end gap-4 mt-4">
          <button className="px-6 py-2 border rounded-md">Cancel</button>
          <button className="px-6 py-2 bg-blue-600 text-white rounded-md">Save</button>
        </div>
      </div>

      {/* Debug (hidden) */}
      {/* <pre className="text-xs text-gray-400">{JSON.stringify(conceptsDebug, null, 2)}</pre> */}
    </div>
  );
}

/* ---------------------------
   Reusable small UI components
---------------------------- */
const StatCard = ({ label, value, color }) => (
  <div className={`rounded-xl shadow p-4 text-center ${color}`}>
    <p className="text-sm">{label}</p>
    <p className="text-2xl font-semibold mt-1">{value}</p>
  </div>
);

const AssignmentsTable = ({ assignments }) => (
  <table className="w-full text-sm">
    <thead className="border-b text-gray-600">
      <tr>
        <th className="py-2 text-left">Assignment</th>
        <th className="py-2">Status</th>
        <th className="py-2">Score</th>
        <th className="py-2">Due</th>
      </tr>
    </thead>

    <tbody>
      {assignments?.map((a) => (
        <tr key={a.name} className="border-b">
          <td className="py-3">{a.name}</td>
          <td className="py-3">{a.status}</td>
          <td className="py-3">{a.score}</td>
          <td className="py-3">{a.due}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

const TimelineActivity = ({ events }) => (
  <div className="space-y-3">
    {events?.map((e, i) => (
      <div key={i} className="p-3 border rounded-md bg-gray-50">
        <p className="font-medium">{e.title}</p>
        <p className="text-gray-500 text-sm">{e.date}</p>
      </div>
    ))}
  </div>
);
