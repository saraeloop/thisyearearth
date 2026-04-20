import { Suspense } from "react";
import { StoryApp } from "@/components/StoryApp";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <StoryApp />
    </Suspense>
  );
}
