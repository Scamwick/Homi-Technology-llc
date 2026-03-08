type AnthropicArgs = {
  system: string
  user: string
  maxTokens?: number
  temperature?: number
}

type AnthropicResponse = {
  content?: Array<{ text?: string }>
}

export async function callAnthropic(args: AnthropicArgs): Promise<{ text: string }> {
  const key = process.env.ANTHROPIC_API_KEY
  const model = process.env.ANTHROPIC_MODEL ?? "claude-3-5-sonnet-20241022"

  if (!key) {
    return {
      text: "I can see the shape of this decision more clearly now. Keep choosing clarity over pressure, and let your readiness lead your timeline."
    }
  }

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model,
      system: args.system,
      messages: [{ role: "user", content: args.user }],
      max_tokens: args.maxTokens ?? 350,
      temperature: args.temperature ?? 0.6
    })
  })

  if (!res.ok) {
    const txt = await res.text()
    throw new Error(`Anthropic error: ${txt}`)
  }

  const json = (await res.json()) as AnthropicResponse
  const text = Array.isArray(json.content)
    ? json.content.map((c) => c?.text ?? "").join("\n").trim()
    : ""

  return { text }
}
