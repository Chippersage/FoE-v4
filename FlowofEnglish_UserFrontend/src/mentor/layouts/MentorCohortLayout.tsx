import { Outlet, useParams } from "react-router-dom";
import MentorSideNav from "../MentorSideNav";

export default function MentorCohortLayout() {
  const { cohortId } = useParams();

  return (
    <div className="flex h-screen bg-gray-50">
      <MentorSideNav cohortId={cohortId!} />
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}