import WordleBuilder from "@/components/WordleBuilder";

export const metadata = {
  title: "Wordle Builder — Phoneme Activity Builder",
};

export default async function WordleBuilderPage({ searchParams }) {
  const query = await searchParams;
  return <WordleBuilder initialActivityId={query.activityId} />;
}
