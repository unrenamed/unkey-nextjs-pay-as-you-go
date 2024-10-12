import { InfoIcon } from "lucide-react";

export const InfoBanner = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-accent text-sm p-3 px-5 rounded-md text-foreground flex gap-3 items-center">
    <InfoIcon size={24} strokeWidth={2} />
    <p>{children}</p>
  </div>
);
