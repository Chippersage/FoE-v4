import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Skeleton from "@/components/skeletons/Skeleton";

export default function LeaderboardSkeleton() {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">
          <Skeleton className="h-8 w-48 mx-auto" />
        </CardTitle>
        <p className="text-muted-foreground">
          <Skeleton className="h-4 w-32 mx-auto" />
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Skeleton for the top 3 performers */}
          {[...Array(3)].map((_, index) => (
            <div key={index} className="flex justify-between items-center py-2">
              <div className="flex items-center">
                <div className="font-bold text-lg mr-4">
                  <Skeleton className="h-6 w-6" />
                </div>
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="ml-2">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-4 w-16 mt-1" />
                </div>
              </div>
              <div className="text-right">
                <Skeleton className="h-6 w-16" />
              </div>
            </div>
          ))}

          {/* Skeleton for the current user, if not in top 3 */}
          <div className="flex justify-between items-center py-2 bg-blue-100 p-2 rounded-xl shadow-lg">
            <div className="flex items-center">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="ml-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-4 w-16 mt-1" />
              </div>
            </div>
            <div className="text-right">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-4 w-20 mt-1" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
