import { PLATFORM_LABELS } from "@/lib/labels";
import type { Pillar, PlanInput, Slot } from "@/lib/validation";

interface Patterns {
  topics: readonly string[];
  videoIdeas: readonly string[];
}

/** Placeholders: {brand}, {niche}, {audience}, {platform}. */
export const PATTERNS: Record<Pillar, Patterns> = {
  educational: {
    topics: [
      "3 {niche} mistakes most people make (and how to fix them)",
      "The beginner's guide to {niche}, in under a minute",
      "{niche} myths {brand} hears every week, busted",
      "One {niche} habit that changes everything",
      "What nobody tells you before you start with {niche}",
      "{niche} explained like you're five",
      "The {niche} checklist we wish we'd had on day one",
    ],
    videoIdeas: [
      "Open on the most common mistake in action, then cut to the right way side by side with on-screen labels.",
      "Hook with a bold claim in the first second, then walk through three quick steps with text overlays.",
      "Start with a myth on screen, stamp it 'false', then show the real answer with a simple demo.",
      "Face-to-camera tip from the {brand} team, followed by a close-up showing the habit in practice.",
      "Split screen of 'what you expect' vs 'what actually happens', narrated with a practical takeaway.",
      "Use a whiteboard or props to explain one core {niche} idea in plain words for {platform}.",
      "Screen-record or film a checklist being ticked off, one item per beat of the music.",
    ],
  },
  behind_the_scenes: {
    topics: [
      "A day in the life at {brand}",
      "How we actually make it: the {brand} process",
      "Meet the people behind {brand}",
      "What our workspace looks like at 7 a.m.",
      "The tools {brand} can't live without",
      "Why we do it the slow way at {brand}",
    ],
    videoIdeas: [
      "Time-lapse from opening up to closing time, ending on the team waving goodbye.",
      "Follow one product or service from start to finish with quick cuts and natural sound.",
      "Quick-fire intros: each team member says their name, role and favourite part of the job.",
      "Early-morning POV walk-through of the space as it comes to life, no voiceover, just ambient sound.",
      "Hands-only shots of the everyday tools, each labelled with why it matters.",
      "Founder talks to camera about one deliberate choice while B-roll shows the work behind it.",
    ],
  },
  social_proof: {
    topics: [
      "What our customers say about {brand}",
      "Before and after: a real {niche} result",
      "Why {audience} keep coming back to {brand}",
      "Customer spotlight: one story, start to finish",
      "The review that made our whole team smile",
      "Numbers don't lie: our month in {niche}",
    ],
    videoIdeas: [
      "Montage of short customer clips or quotes on screen, ending with the {brand} logo.",
      "Show the 'before' for three seconds, a quick transition, then the 'after' with the key result in text.",
      "Interview a regular customer on why they chose {brand}, cut to the moments they mention.",
      "Tell one customer's journey in three scenes: the problem, the switch to {brand}, the outcome.",
      "Read a favourite review aloud while the team reacts, then thank the customer on screen.",
      "Animate the month's best stats one by one over upbeat footage of the work.",
    ],
  },
  promotional: {
    topics: [
      "Introducing our latest from {brand}",
      "Limited-time offer for {audience}",
      "Why now is the best time to try {brand}",
      "The {brand} bundle built for {niche} fans",
      "Everything you get when you choose {brand}",
      "Last chance: this week only at {brand}",
    ],
    videoIdeas: [
      "Unboxing-style reveal of the offer, ending with a clear call to action and the link location for {platform}.",
      "Open with the audience's pain point, then show how the offer solves it in three quick shots.",
      "Countdown-style video of reasons to act now, finishing on the offer details.",
      "Fast flat-lay showing each item in the bundle with the price on screen at the end.",
      "Walk-through of what the customer gets, step by step, with a closing call to action.",
      "Urgency hook ('ends Sunday'), quick product shots, then a direct ask to tap the link.",
    ],
  },
  entertaining: {
    topics: [
      "POV: you just discovered {niche}",
      "Things only {niche} people will understand",
      "Rating popular {niche} trends, honestly",
      "{brand} team tries the latest trend",
      "Expectation vs reality in {niche}",
      "If {niche} were a person…",
      "Guess the answer: a {niche} quiz",
    ],
    videoIdeas: [
      "POV-style skit with on-screen text, using a trending sound that fits {platform}.",
      "Relatable list format: quick cuts of situations every {niche} fan knows, with captions.",
      "Team member holds up scorecards while rating trends, keeping each segment under three seconds.",
      "The team attempts a trend, keep the bloopers in and end with the best take.",
      "Split-screen expectation vs reality, played for laughs with a punchline at the end.",
      "Personify {niche} in a short character skit, with a costume change for each personality trait.",
      "Ask a quiz question on screen, pause for a beat, then reveal the answer with a fun fact.",
    ],
  },
};

function fill(pattern: string, input: PlanInput, slot: Slot): string {
  return pattern
    .replaceAll("{brand}", input.brand)
    .replaceAll("{niche}", input.niche)
    .replaceAll("{audience}", input.audience)
    .replaceAll("{platform}", PLATFORM_LABELS[slot.platform]);
}

function clip(text: string, max: number): string {
  return text.length <= max ? text : `${text.slice(0, max - 1).trimEnd()}…`;
}

/**
 * Deterministic template text for one slot. Pattern index is
 * (position + platformIndex) % length; `bump` shifts it when the result would
 * repeat the previous post (happens when platforms alternate).
 */
export function templateFor(slot: Slot, input: PlanInput, bump = 0): Pick<Slot, "topic" | "videoIdea"> {
  const patterns = PATTERNS[slot.pillar];
  const platformIndex = Math.max(0, input.platforms.indexOf(slot.platform));
  const index = slot.position + platformIndex + bump;
  const topic = patterns.topics[index % patterns.topics.length];
  const idea = patterns.videoIdeas[index % patterns.videoIdeas.length];
  return {
    topic: clip(fill(topic, input, slot), 200),
    videoIdea: clip(fill(idea, input, slot), 600),
  };
}

export function fillWithTemplates(slots: Slot[], input: PlanInput): Slot[] {
  let previous = "";
  return slots.map((slot) => {
    let text = templateFor(slot, input);
    if (text.topic === previous) text = templateFor(slot, input, 1);
    previous = text.topic;
    return { ...slot, ...text, source: "template" };
  });
}
