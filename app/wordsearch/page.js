import WordSearchBuilder from "@/components/WordSearchBuilder";

export const metadata = {
  title: "Word Search Builder — Phoneme Activity Builder",
};

export default async function WordSearchBuilderPage({ searchParams }) {
  const query = await searchParams;
  return <WordSearchBuilder initialActivityId={query.activityId} />;
}
