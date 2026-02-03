import { Outlet, useParams } from "react-router-dom";
import MentorSideNav from "../MentorSideNav";

export default function MentorCohortLayout() {
  const { cohortId, programId } = useParams();

  return (
    <div className="flex h-screen bg-gray-50">
      <MentorSideNav cohortId={cohortId!} programId={programId!} />
      <main className="flex-1 overflow-x-auto overflow-y-auto lg:ml-0">
        <div className="p-4 lg:p-6 w-full max-w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}