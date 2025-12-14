import { Construction, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface ComingSoonProps {
  title: string;
  description?: string;
}

export function ComingSoon({ title, description }: ComingSoonProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
      <Card className="w-full max-w-md border-dashed border-2">
        <CardContent className="flex flex-col items-center text-center pt-10 pb-10 px-6">
          <div className="relative mb-6">
            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary/10">
              <Construction className="h-10 w-10 text-primary" />
            </div>
            <div className="absolute -bottom-1 -right-1 flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 border-2 border-white">
              <Clock className="h-4 w-4 text-amber-600" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-foreground mb-2">{title}</h2>
          <p className="text-base text-primary font-medium mb-3">Coming Soon</p>
          <p className="text-sm text-muted-foreground max-w-sm">
            {description || "This feature is currently under development. We're working hard to bring you this functionality soon."}
          </p>

          <div className="mt-8 flex items-center gap-2 text-xs text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>Under Development</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
