import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <div className="text-gray-400 text-6xl mb-4 text-center">404</div>
          <CardTitle className="text-center">Page Not Found</CardTitle>
          <CardDescription className="text-center">
            The page you're looking for doesn't exist or has been moved
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/dashboard" className="block">
            <Button className="w-full">Return to Dashboard</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
