import QuestionContent from "./QuestionContent";
import { Suspense } from "react";

export default function QuestionPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center p-8">Loading question...</div>}>
      <QuestionContent />
    </Suspense>
  );
}
