import { Loader2 } from 'lucide-react';

const LoadingScreen = () => (
  <div className="absolute inset-0 bg-background/70 backdrop-blur-md flex items-center justify-center z-50">
    <div className="bg-card p-10 rounded-xl shadow-xl text-center max-w-[350px] border border-border/40">
      <div className="relative mb-6">
        <Loader2 className="h-16 w-16 animate-spin mx-auto text-primary" />
        <div className="absolute inset-0 animate-ping opacity-15">
          <Loader2 className="h-16 w-16 mx-auto text-primary" />
        </div>
      </div>
      <h3 className="text-2xl font-bold mb-4 text-foreground opacity-80">Bear with me...</h3>
      <div className="space-y-4">
        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full animate-[loading_1.5s_ease-in-out_infinite] w-3/4" />
        </div>
        <p className="text-sm text-muted-foreground opacity-70 animate-pulse">
          thanks...
        </p>
      </div>
    </div>
  </div>
);

export default LoadingScreen;
