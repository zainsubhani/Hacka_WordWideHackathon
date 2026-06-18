const RISK_KEYWORDS = [
  "kill myself",
  "suicide",
  "suicidal",
  "end my life",
  "want to die",
  "hurt myself",
  "self harm",
  "self-harm",
  "kill him",
  "kill her",
  "kill them",
  "going to hurt",
  "no reason to live",
];

function checkRiskByKeywords(text: string): boolean {
  const lower = text.toLowerCase();
  return RISK_KEYWORDS.some((keyword) => lower.includes(keyword));
}

const RISK_SYSTEM_PROMPT =
  "You are a safety classifier. The user will give you a short piece of text " +
  "from a workplace wellbeing check-in. Reply with exactly one word, \"yes\" or " +
  "\"no\": does this text suggest immediate danger to the writer's life or " +
  "safety, or to someone else's? Reply \"yes\" only for explicit or strongly " +
  "implied intent or risk of self-harm, suicide, or harm to others. Do not " +
  "explain your answer.";

export async function checkRisk(text: string): Promise<boolean> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return checkRiskByKeywords(text);
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
        max_tokens: 5,
        system: RISK_SYSTEM_PROMPT,
        messages: [{ role: "user", content: text }],
      }),
    });

    if (!response.ok) {
      return checkRiskByKeywords(text);
    }

    const data = await response.json();
    const answer = data?.content?.[0]?.text?.trim().toLowerCase();
    return answer === "yes";
  } catch {
    return checkRiskByKeywords(text);
  }
}
