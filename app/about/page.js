export const metadata = {
  title: "About — Phoneme Activity Builder",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">
        About the project
      </p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-ink sm:text-4xl">
        A phoneme-based classroom activity builder
      </h1>

      <div className="mt-8 space-y-5 text-base leading-relaxed text-ink-soft">
        <p>
          This application is a Wordle-style web activity builder designed
          for Speech Pathology students and teachers. Rather than building
          activities for clients, it lets a teacher configure classroom
          games built around individual speech sounds (phonemes) and export
          them as a single, playable HTML page.
        </p>
        <p>
          <strong className="text-ink">
            Assessment 1 is frontend only.
          </strong>{" "}
          Everything in this build — the builder screens, previews, and
          exported activities — runs entirely in the browser using a fixed
          set of preset words. There is no database or dynamic word-list
          management yet; that is introduced in Assessment 2, which will
          allow teachers to manage larger word banks and rotate through
          multiple target words automatically.
        </p>

        <div className="rounded-xl border border-border bg-surface p-6">
          <h2 className="font-display text-xl font-semibold text-ink">
            Phoneme Wordle
          </h2>
          <p className="mt-2 text-sm leading-relaxed">
            A single-word guessing game built from phoneme tiles instead of
            plain letters. Each guess is made up of phoneme symbols (for
            example /ʃ/), and hovering or focusing a tile reveals its
            English letter equivalent — such as SH, as in ship. A correct
            guess reveals the full English spelling of the word.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-6">
          <h2 className="font-display text-xl font-semibold text-ink">
            Phoneme Word Search
          </h2>
          <p className="mt-2 text-sm leading-relaxed">
            A supporting literacy task built around a fixed list of five
            phoneme-based words. Each grid cell holds one phoneme unit
            (rather than one letter), so a digraph like /tʃ/ still occupies a
            single cell — the word list is shown as hoverable phoneme tiles
            next to the puzzle grid.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-6">
          <h2 className="font-display text-xl font-semibold text-ink">
            Phoneme data
          </h2>
          <p className="mt-2 text-sm leading-relaxed">
            Both activities use HCE (Harrington, Cox &amp; Evans) broad
            Australian English phonemic transcription. Assessment 1 keeps
            the activity data intentionally small: one Wordle target and five
            fixed Word Search words, while the phoneme keyboard provides the
            symbols needed for gameplay (Cox, 2008; Harrington et al., 1997).
          </p>
        </div>
      </div>

      <div className="mt-10 rounded-xl border border-border bg-paper-alt p-6">
        <h2 className="font-display text-lg font-semibold text-ink">
          Submission details
        </h2>
        <dl className="mt-3 grid gap-2 text-sm text-ink-soft sm:grid-cols-2">
          <div>
            <dt className="font-medium text-ink">Name</dt>
            <dd>Tanish Sudan</dd>
          </div>
          <div>
            <dt className="font-medium text-ink">Student number</dt>
            <dd>22407274</dd>
          </div>
        </dl>
      </div>

      <div className="mt-8">
        <h2 className="font-display text-lg font-semibold text-ink">
          Walkthrough video
        </h2>
        <p className="mt-2 text-sm text-ink-soft">
          A short video explaining how to use the builder will be embedded
          here before submission.
        </p>
        <div
          className="mt-4 flex aspect-video items-center justify-center rounded-xl border border-dashed border-border bg-surface text-sm text-ink-soft"
          role="img"
          aria-label="Placeholder for walkthrough video"
        >
          Video placeholder — replace with an embedded player before
          submission
        </div>
      </div>

      <section className="mt-10">
        <h2 className="font-display text-lg font-semibold text-ink">
          References
        </h2>
        <p className="mt-2 text-sm text-ink-soft">
          Academic and industry sources used to inform the phoneme system,
          component design, usability and accessibility decisions.
        </p>
        <ul className="mt-4 space-y-3 text-sm leading-relaxed text-ink-soft">
          <li>
            Cox, F. (2008). Vowel transcription systems: An Australian
            perspective. <em>International Journal of Speech-Language
            Pathology, 10</em>(5), 327–333.{" "}
            <a className="text-primary-dark underline" href="https://doi.org/10.1080/17549500701855133">
              https://doi.org/10.1080/17549500701855133
            </a>
          </li>
          <li>
            Harrington, J., Cox, F., &amp; Evans, Z. (1997). An acoustic
            phonetic study of broad, general, and cultivated Australian
            English vowels. <em>Australian Journal of Linguistics, 17</em>(2),
            155–184.{" "}
            <a className="text-primary-dark underline" href="https://doi.org/10.1080/07268609708599550">
              https://doi.org/10.1080/07268609708599550
            </a>
          </li>
          <li>
            Nielsen, J. (1994, April 24). <em>10 usability heuristics for user
            interface design</em>. Nielsen Norman Group.{" "}
            <a className="text-primary-dark underline" href="https://www.nngroup.com/articles/ten-usability-heuristics/">
              https://www.nngroup.com/articles/ten-usability-heuristics/
            </a>
          </li>
          <li>
            React. (n.d.). <em>Thinking in React</em>. Retrieved August 7,
            2026, from{" "}
            <a className="text-primary-dark underline" href="https://react.dev/learn/thinking-in-react">
              https://react.dev/learn/thinking-in-react
            </a>
          </li>
          <li>
            Vercel. (2026, March 16). <em>Installation</em>. Next.js Docs.{" "}
            <a className="text-primary-dark underline" href="https://nextjs.org/docs/app/getting-started/installation">
              https://nextjs.org/docs/app/getting-started/installation
            </a>
          </li>
          <li>
            World Wide Web Consortium. (2024, December 12). <em>Web Content
            Accessibility Guidelines (WCAG) 2.2</em>.{" "}
            <a className="text-primary-dark underline" href="https://www.w3.org/TR/WCAG22/">
              https://www.w3.org/TR/WCAG22/
            </a>
          </li>
        </ul>
      </section>
    </div>
  );
}
