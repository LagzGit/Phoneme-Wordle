import { getActivity } from "@/lib/activity-service";
import { AppError, errorResponse, parseId } from "@/lib/api-errors";
import { generateWordleHTML } from "@/lib/exportWordle";
import { generateWordSearchHTML } from "@/lib/exportWordSearch";
import { generateGrid } from "@/lib/wordsearch";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request, { params }) {
  try {
    const { id } = await params;
    const activity = await getActivity(parseId(id, "Activity ID"));
    let html;

    if (activity.type === "WORDLE") {
      const target = activity.words.find((word) => word.isTarget) || activity.words[0];
      if (!target) {
        throw new AppError(
          "Add a target word before generating this Wordle activity.",
          422,
          "ACTIVITY_NOT_READY"
        );
      }
      html = generateWordleHTML({
        target,
        maxGuesses: activity.maxGuesses,
        activityTitle: activity.title,
        activityHint: activity.hint || target.hint,
        instructions: activity.instructions,
        showHints: activity.showHints,
      });
    } else if (activity.type === "WORD_SEARCH") {
      if (activity.words.length < 2) {
        throw new AppError(
          "Add at least two words before generating this Word Search activity.",
          422,
          "ACTIVITY_NOT_READY"
        );
      }
      const { grid, placements } = generateGrid({
        words: activity.words,
        size: activity.gridSize,
        allowDiagonals: activity.allowDiagonals,
        seed: activity.id * 101,
      });
      html = generateWordSearchHTML({
        grid,
        placements,
        words: activity.words,
        activityTitle: activity.title,
        activityHint: activity.hint,
        instructions: activity.instructions,
        showHints: activity.showHints,
      });
    } else {
      throw new AppError("Unsupported activity type.", 422, "UNSUPPORTED_ACTIVITY");
    }

    return new Response(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `attachment; filename="${activity.outputFileName}.html"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
