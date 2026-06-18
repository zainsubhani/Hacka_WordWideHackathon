const SUGGESTION_SYSTEM_PROMPT =
  "You are a brief, warm, non-clinical reflection tool. Given someone's " +
  "wellbeing sliders and one thing they said they're carrying, respond in " +
  "2-4 sentences. Reflect back what you're hearing, normalize it briefly, " +
  "and offer one small, concrete reframe or next step. Do not diagnose, " +
  "do not use therapy jargon, do not be falsely cheerful.";

const SLIDER_LABELS: Record<string, string> = {
  autonomy: "Autonomy",
  financialPressure: "Financial pressure",
  energy: "Energy",
  connection: "Connection",
};

function formatSliders(sliderValues: Record<string, number>): string {
  return Object.entries(sliderValues)
    .map(([key, value]) => `${SLIDER_LABELS[key] ?? key}: ${value}/10`)
    .join(", ");
}

function fallbackSuggestion(): string {
  return (
    "It sounds like this week has had some real weight to it, and that's " +
    "worth taking seriously. A lot of people carry financial or work " +
    "pressure quietly — you're not alone in that. One small step: pick one " +
    "specific worry from today and write down the next concrete action for " +
    "it, even a tiny one."
  );
}

export async function getSuggestion(
  sliderValues: Record<string, number>,
  carryingText: string
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return fallbackSuggestion();
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 200,
        system: SUGGESTION_SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: `${formatSliders(sliderValues)}\n\nWhat they're carrying: ${carryingText}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      return fallbackSuggestion();
    }

    const data = await response.json();
    const text = data?.content?.[0]?.text?.trim();
    return text || fallbackSuggestion();
  } catch {
    return fallbackSuggestion();
  }
}
