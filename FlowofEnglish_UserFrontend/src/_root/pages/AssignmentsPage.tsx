import React from "react";
// Assuming AssignmentsTable component exists in the specified path
// You might need to adjust the import path based on your project structure
import AssignmentsTable from "@/components/AssignmentsTable";
import { useParams } from "react-router-dom";

const AssignmentsPage: React.FC = () => {
  const { cohortId } = useParams<{ cohortId: string }>(); // Get cohortId from URL params

  return (
    <div className="min-h-screen bg-slate-100 font-sans p-4">
      <main className="container mx-auto max-w-6xl">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-emerald-700">
            Cohort Assignments
          </h1>
          {/* <p className="text-gray-600">
            View and manage assignments for Cohort {cohortId || "N/A"}.
          </p> */}
        </header>

        {/* Render the AssignmentsTable component */}
        {/* Pass necessary props like cohortId if the table needs it */}
        <AssignmentsTable cohortId={cohortId} />
      </main>
    </div>
  );
};

export default AssignmentsPage;
