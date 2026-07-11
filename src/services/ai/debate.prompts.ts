export const buildRound1Prompt = (
  question: string,
  provider: string,
  mode: string,
  totalParticipants: number
): string => `
You are ${provider} participating in a 
structured multi-AI expert debate with 
${totalParticipants} AI models total.

THIS IS ROUND 1 — Your Initial Position.

Your job: Give your absolute BEST answer.
Other AI models will read and critique it next.
Make your reasoning transparent and clear.
Be specific, not generic.

QUESTION / TASK:
"${question}"

INSTRUCTIONS:
- Give your most accurate, complete answer
- Show your reasoning step by step
- Include code examples if relevant to the topic
- State any important assumptions you make
- End with: "CONFIDENCE: [High/Medium/Low] because..."
- Do NOT be vague — commit to your position
- Length: As thorough as the question requires

Your response will be evaluated by other AIs 
and a final synthesizer. Make it count.`;

export const buildRound2Prompt = (
  question: string,
  myProvider: string,
  myRound1Answer: string,
  othersAnswers: Array<{
    provider: string;
    content: string;
  }>
): string => `
You are ${myProvider} in Round 2 of a 
structured AI debate.

ORIGINAL QUESTION:
"${question}"

YOUR ROUND 1 ANSWER:
${myRound1Answer}

OTHER AI MODELS' ANSWERS:
${othersAnswers.map(o => `
━━━ ${o.provider} said: ━━━
${o.content}
`).join('\n')}

YOUR ROUND 2 TASK — Respond in this EXACT format:

## ✅ Points I Agree With
List specific points from other models that 
are correct. Quote them briefly.
Explain WHY you agree with evidence.

## ❌ Points I Challenge  
List specific points from other models that
are wrong, incomplete, or misleading.
Give your reasoning and evidence for WHY.
Be direct and specific — not vague criticism.

## 💡 Critical Points Everyone Missed
What important aspect did NO model cover yet?
This is your chance to add unique value.

## 🔄 My Revised & Stronger Answer
Rewrite your answer incorporating:
- Valid points you learned from others
- Corrections to errors in your Round 1 answer
- Defense of your correct original positions
- New insights from the cross-examination

This revised answer should be NOTICEABLY 
BETTER than your Round 1 answer.
If you had nothing to revise, your Round 1 
was already perfect — say so and explain why.

End with: "REVISED CONFIDENCE: [High/Medium/Low]"`;

export const buildRound3Prompt = (
  question: string,
  myProvider: string,
  myRound1: string,
  myRound2: string,
  othersRound2: Array<{
    provider: string;
    content: string;
  }>
): string => `
You are ${myProvider} in Round 3 — 
your FINAL position in the AI debate.

QUESTION: "${question}"

YOUR JOURNEY:
Round 1 (your initial): ${
  myRound1.slice(0, 300)
}...

Round 2 (after seeing others): ${
  myRound2.slice(0, 300)
}...

OTHERS' ROUND 2 RESPONSES:
${othersRound2.map(o => `
${o.provider}: ${o.content.slice(0, 400)}...
`).join('\n')}

FINAL ROUND TASK:
This is your last statement before synthesis.

Give your DEFINITIVE FINAL ANSWER:
1. Start with "## FINAL POSITION:"
2. Give your complete best answer
   (clean, no debate format — just the answer)
3. Then "## What Changed From Round 1:"
   (briefly what you updated and why)
4. Then "## What I Stand By:"
   (what you defended successfully)
5. Final confidence: 0-100

Make this your masterpiece answer.
The synthesizer will use this as primary input.`;

export const buildSynthesisPrompt = (
  question: string,
  allRounds: Array<{
    round: number;
    provider: string;
    content: string;
    role: string;
  }>,
  providers: string[]
): string => `
You are the MASTER SYNTHESIZER in a 
multi-AI debate. Your job is to read all 
debate rounds and produce ONE definitive, 
superior answer.

DEBATE QUESTION:
"${question}"

PARTICIPANTS: ${providers.join(', ')}

ALL DEBATE ROUNDS:
${allRounds.map(r => `
╔══ Round ${r.round} | ${r.provider} 
  (${r.role}) ══╗
${r.content}
╚══════════════════════════════╝
`).join('\n')}

YOUR SYNTHESIS TASK:
Produce the SINGLE BEST answer by combining 
the strongest elements from all rounds.

Return ONLY this exact JSON structure:

{
  "consensus": "FULL MARKDOWN ANSWER HERE.\nThis must be the definitive best answer to the question. It should be better than any single model's answer because it combines the best insights from all.\nInclude: clear explanation, examples, code if relevant, edge cases, practical guidance.\nFormat properly with markdown headers, bullet points, code blocks etc.\nMinimum 200 words for complex topics.",
  "executiveSummary": "2-3 sentence TL;DR of the consensus answer for users who want the quick version.",
  "contributions": {
    "PROVIDER_NAME": "The unique, specific insight this model contributed that made it into the final answer",
    "PROVIDER_NAME_2": "Their contribution"
  },
  "agreements": [
    "Point all models agreed on",
    "Another agreement point"
  ],
  "debates": [
    {
      "topic": "What was debated",
      "positions": {
        "PROVIDER_A": "Their position",
        "PROVIDER_B": "Their position"
      },
      "resolution": "How it was resolved in the final answer"
    }
  ],
  "keyInsights": [
    "Most important insight from the debate",
    "Second key insight",
    "Third key insight"
  ],
  "whatWasImproved": "What changed between Round 1 and final positions — what did the debate process actually improve?",
  "confidenceScore": 85,
  "winner": "PROVIDER_NAME if one model was clearly most accurate, or null if it was a collaborative result",
  "winnerReason": "Why this provider won, or why no single winner if null",
  "warningFlags": [
    "Any important caveats about the answer",
    "Edge cases where answer may not apply"
  ]
}

SYNTHESIS RULES:
- The consensus must be BETTER than any single model's answer
- If all models agreed → summarize clearly
- If models disagreed → take the more logically sound position and explain why
- Include concrete examples from the debate
- Do not pick a winner just to pick one
- Be intellectually honest about uncertainty
- Ensure the returned text is VALID, PARSABLE JSON only, with no other text, markdown wrapper, or trailing blocks outside the JSON object.`;
