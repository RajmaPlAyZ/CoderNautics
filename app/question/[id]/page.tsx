// Server component — exports generateStaticParams required for static export (Tauri)
import QuestionContent from "./QuestionContent";

// Empty array = no pages pre-built; they render client-side at runtime via Firebase
export function generateStaticParams() {
  return [];
}

export default async function QuestionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <QuestionContent questionId={id} />;
}
