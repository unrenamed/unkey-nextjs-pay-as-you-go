import { CircleIcon } from "lucide-react";

export const NextTierInfo = ({
  nextTier,
}: {
  nextTier: {
    displayName: string;
    limitDisplay: string;
    price: number;
  };
}) => (
  <div className="flex flex-col gap-4">
    <h4 className="text-md font-medium text-foreground/40">Next tier:</h4>
    <ul className="flex flex-col gap-1">
      <li className="flex items-center font-medium ml-2 gap-2">
        <CircleIcon size={8} strokeWidth={2} /> {nextTier.displayName}
      </li>
      <li className="flex items-center font-medium ml-2 gap-2">
        <CircleIcon size={8} strokeWidth={2} /> {nextTier.limitDisplay}
      </li>
      <li className="flex items-center font-medium ml-2 gap-2">
        <CircleIcon size={8} strokeWidth={2} /> {nextTier.price}$ per credit
      </li>
    </ul>
  </div>
);
