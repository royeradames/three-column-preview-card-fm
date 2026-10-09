# 3-column preview card

An implementation of the [Frontend Mentor 3-column preview card challenge](https://www.frontendmentor.io/challenges/3column-preview-card-component-pH92eAR2-), using its supplied icons, copy and design references.

## Development

Node 22.13 or later. Use `npm ci`, `npm run dev`, `npm run lint`, `npm run typecheck`, `npm run build`, and `npm test`. Browser tests use installed Chrome and own port 4538.

Next 16.3.6, React 19.2.8, TypeScript 5.9.3 and Tailwind 4.2.1 are pinned to the family baseline. The page is a server component with no client JavaScript of its own.

## Sources

Original challenge files are preserved under `reference/`; supplied images moved byte-for-byte to `public/images/`. Geometry and colors follow the decoded Figma frames (Mobile 375, Tablet 768, Desktop and Desktop - Active 1440). Big Shoulders 700 (optical size 72, the Display cut) and Lexend Deca 400 load through `next/font`.

## Implementation choices

- "Learn More" has no destination in the challenge. Rather than a dead link, each one is a native disclosure styled as the Figma pill. It opens a visible "Demo only" note, works by keyboard and without JavaScript, and shows the Desktop - Active outline state on hover, focus and while open.
- Body copy and button labels rise from the design's 15px to the family 16px floor, so desktop columns can grow slightly past 500px.
- The page has a visually hidden `h1` ("Car rental categories") so each column can be a labelled `h2` region.

- The orange token is a darker shade of the supplied orange, and translucent copy uses 90% white. Large headings meet 3:1; copy, button labels, active disclosure notes and footer hover meet 4.5:1 against their rendered surfaces. The contrast regression composites translucent copy against its actual column.
- Disclosure text and background change together without color interpolation, so the label remains readable throughout hover and focus changes. An animation-frame regression measures the actual rendered hover transition.
