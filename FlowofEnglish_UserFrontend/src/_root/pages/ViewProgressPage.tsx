import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart,
  PieChart,
  RadarChart,
  HeatMapChart,
  ProgressCircle,
} from "@/components/charts";
import { SkillBreakdown } from "@/components/skill-breakdown";
import { AreasForImprovement } from "@/components/areas-for-improvement";
import { RecommendationSection } from "@/components/recommendation-section";
import { UserHeader } from "@/components/user-header";
import { motion } from "framer-motion";
import { fetchUserProgress } from "@/lib/api";
import { processUserData } from "@/lib/data-processing";
import type { UserProgressData, ProcessedUserData } from "@/types/types";
import { useUserContext } from "@/context/AuthContext";

export default function ViewProgressPage() {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<UserProgressData[]>([]);
  const [processedData, setProcessedData] = useState<ProcessedUserData | null>(
    null
  );
  const [activeTab, setActiveTab] = useState("overview");
  const { user } = useUserContext(); // where cohorts is: [{ id: 'c1', name: 'CC-8' }, ...]
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null);

  useEffect(() => {
    if (user && user?.cohorts && user?.cohorts.length > 0 && !selectedProgram) {
      setSelectedProgram(user?.cohorts[0]?.program?.programId);
    }
  }, [user]);


 useEffect(() => {
   const loadData = async () => {
     if (!selectedProgram) return;

     try {
       setLoading(true);
       const data = await fetchUserProgress(selectedProgram, user?.userId);
       console.log(data)
       setUserData(data);
       const processed = processUserData(data?.concepts);
       console.log(processed)
       setProcessedData(processed);
     } catch (error) {
       console.error("Failed to fetch user progress:", error);
     } finally {
       setLoading(false);
     }
   };

   loadData();
 }, [selectedProgram]);


  if (loading || !processedData) {
    return <DashboardSkeleton />;
  }

  const {
    overallCompletion,
    totalScore,
    totalMaxScore,
    skillDistribution,
    conceptProgress,
    strengths,
    areasToImprove,
    skillScores,
  } = processedData;

  return (
    <div className="relative w-full min-h-screen overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 -z-10 w-full min-h-screen"
        style={{
          backgroundImage: "url('/images/cohort-bg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/10 -z-10" />
      <div className="container mx-auto py-8 px-4">
        <UserHeader
          username={user?.userName}
          programName={
            user?.cohorts?.find(
              (c) => c?.program?.programId === selectedProgram
            )?.program?.programName || ""
          }
          overallCompletion={overallCompletion}
        />

        {user?.cohorts && user?.cohorts.length > 0 && (
          <div className="mb-4 max-w-sm">
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Select Program
            </label>
            <select
              className="w-full p-2 border rounded-md bg-white dark:bg-black"
              value={selectedProgram ?? ""}
              onChange={(e) => setSelectedProgram(e.target.value)}
            >
              {user?.cohorts.map((cohort) => (
                <option
                  key={cohort.cohortId}
                  value={cohort?.program?.programId}
                >
                  {cohort?.program?.programName}
                </option>
              ))}
            </select>
          </div>
        )}

        <Tabs
          defaultValue="overview"
          className="mt-8"
          onValueChange={setActiveTab}
        >
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="concepts">Concepts</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              <OverviewCard
                title="Overall Progress"
                value={`${Math.round(overallCompletion)}%`}
                description="Completion across all concepts"
                icon="📈"
              >
                <ProgressCircle value={overallCompletion} />
              </OverviewCard>

              <OverviewCard
                title="Total Score"
                value={`${totalScore}/${totalMaxScore}`}
                description="Points earned out of maximum"
                icon="🏆"
              >
                <Progress
                  value={(totalScore / totalMaxScore) * 100}
                  className="h-3"
                />
              </OverviewCard>

              <OverviewCard
                title="Concepts Mastered"
                value={`${strengths.length}`}
                description="Concepts with high proficiency"
                icon="⭐"
              />

              <OverviewCard
                title="Focus Areas"
                value={`${areasToImprove.length}`}
                description="Concepts needing attention"
                icon="🎯"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Skill Distribution</CardTitle>
                  <CardDescription>
                    Your proficiency across different skills
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <PieChart data={skillDistribution} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Skill Performance</CardTitle>
                  <CardDescription>
                    Your performance across core skills
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  {Array.isArray(skillScores) && skillScores.length >= 3 ? (
                    <RadarChart data={skillScores} />
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      Not enough data to visualize skill performance
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="skills">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <SkillBreakdown
                skillData={skillScores}
                skillDistribution={skillDistribution}
              />
            </motion.div>
          </TabsContent>

          <TabsContent value="concepts">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Concept Progress</CardTitle>
                  <CardDescription>
                    Your progress across all concepts
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-96">
                  <BarChart data={conceptProgress} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Concept Mastery Heatmap</CardTitle>
                  <CardDescription>
                    Visual representation of your concept mastery
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-96">
                  <HeatMapChart data={conceptProgress} />
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="recommendations">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <RecommendationSection
                strengths={strengths}
                areasToImprove={areasToImprove}
              />
            </motion.div>
          </TabsContent>
        </Tabs>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8"
        >
          <AreasForImprovement
            areasToImprove={areasToImprove.slice(0, 3)}
            conceptProgress={conceptProgress}
          />
        </motion.div>
      </div>
    </div>
  );
}

function OverviewCard({
  title,
  value,
  description,
  icon,
  children,
}: {
  title: string;
  value: string;
  description: string;
  icon: string;
  children?: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="text-2xl">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
        {children && <div className="mt-4">{children}</div>}
      </CardContent>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-12 w-[250px]" />
        <Skeleton className="h-4 w-[300px]" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array(4)
          .fill(0)
          .map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-[120px]" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-[80px] mb-2" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-24 w-full mt-4" />
              </CardContent>
            </Card>
          ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array(2)
          .fill(0)
          .map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-[150px]" />
                <Skeleton className="h-3 w-[250px]" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-80 w-full" />
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
}
