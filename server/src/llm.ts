import { Mistral } from '@mistralai/mistralai';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY || '' });

const FAST_MODEL = 'mistral-small-latest';
const REASONING_MODEL = 'mistral-large-latest';

const CLASSIFICATION_SYSTEM = `You are a semantic classification assistant for Groven, a structured deliberation platform.

Your task: classify the function of a new card in relation to its parent card, and suggest the most appropriate link relation.

The ten card types are:
- question: asks for information, clarification, or justification — requests something rather than providing it
- claim: an assertion, argument, interpretation, or position statement
- experience: a first-person account, testimony, or lived experience relevant to the topic
- evidence: data, research, documents, or external sources that support or challenge a claim
- proposal: a concrete recommendation or action item for the group to consider
- amendment: a specific modification to an existing proposal
- summary: a synthesis connecting multiple threads of discussion into a coherent position
- request: asks the group for something specific (action, resource, commitment)
- offer: volunteers something (time, skill, resource) toward the discussion goals

The ten link relations are:
- builds_on: extends or develops the parent's idea
- questions: asks for clarification or challenges assumptions
- contradicts: opposes or undermines the parent
- reframes: same observation from a fundamentally different angle
- supports: provides backing or agreement for the parent
- evidences: offers data or proof related to the parent
- amends: modifies a proposal in the parent
- answers: responds to a question in the parent
- spins_off: starts a new thread inspired by the parent
- implements: proposes concrete steps for the parent

Additionally, determine whether the card is asking a question rather than making a statement. A question requests information, clarification, or justification — it does not itself provide an answer. Set is_question to true if the card is primarily a question, regardless of its card type.

Respond ONLY with valid JSON. No preamble, no explanation outside the JSON.

{
  "proposed_type": "<one of the ten card types>",
  "proposed_relation": "<one of the ten link relations>",
  "is_question": <true|false>,
  "confidence": <0.0-1.0>,
  "explanation": "<exactly two sentences: first sentence states what the card does; second sentence states why that matches the proposed type>"
}`;

const LINEAGE_SYSTEM = `You are a lineage summariser for Groven, a structured deliberation platform.

Given a parent contribution and a new card, write a one-sentence lineage description.
The sentence should explain what the card builds on from the parent and where it takes the argument.

Respond ONLY with the single sentence, no quotes, no preamble.`;

const TITLE_SYSTEM = `You are a title generator for Groven, a structured deliberation platform.

Given a parent contribution and a new card, write a short descriptive title for the card.
The title should be concise (max 8 words) and capture the card's main point or stance.
People will read this title in a node diagram to understand where the discussion is going.

If the card is a question (is_question = true), the title MUST be phrased as a question
ending with a question mark. A question title directly sparks conversation — e.g.
"How long is each phase?" rather than "Clarify phased approach duration".

Respond ONLY with the title, no quotes, no preamble.`;

const PROPOSAL_SUMMARY_SYSTEM = `You summarise proposals for a deliberation platform.

Given a synthesis or proposal, write a single sentence (max 30 words) that captures the core
actionable recommendation. Start with a verb. Do not add quotes or preamble.`;

const RECLASSIFY_SYSTEM = `You are a semantic classification assistant for Groven, a structured deliberation platform.

The author of a card disagrees with the initial classification and has chosen a different type.
Your task: reconsider the classification from the author's perspective and explain why the author's
chosen type is a reasonable reading.

The ten card types are: question, claim, experience, evidence, proposal, amendment, summary, request, offer.

Respond ONLY with valid JSON:
{
  "explanation": "<exactly three sentences: first sentence briefly states the original classification and why it was proposed; second sentence states that the author chose a different type; third sentence explains why the author's reading is reasonable and how the contribution should be interpreted under that type>",
  "is_question": <true|false>
}`;

function parseJSON(text: string): any {
  // Strip markdown code fences if present
  let cleaned = text.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  }
  return JSON.parse(cleaned);
}

export async function classifyCard(parentBody: string, cardBody: string): Promise<{
  proposed_type: string;
  proposed_relation: string;
  is_question: boolean;
  confidence: number;
  explanation: string;
} | null> {
  try {
    const response = await client.chat.complete({
      model: FAST_MODEL,
      messages: [
        { role: 'system', content: CLASSIFICATION_SYSTEM },
        { role: 'user', content: `PARENT CARD:\n${parentBody}\n\nNEW CARD:\n${cardBody}` },
      ],
      responseFormat: { type: 'json_object' },
      maxTokens: 500,
    });
    const content = response.choices?.[0]?.message?.content;
    if (!content) return null;
    const parsed = parseJSON(typeof content === 'string' ? content : '');
    return {
      proposed_type: parsed.proposed_type || 'claim',
      proposed_relation: parsed.proposed_relation || 'builds_on',
      is_question: !!parsed.is_question,
      confidence: parsed.confidence || 0.5,
      explanation: parsed.explanation || '',
    };
  } catch (err) {
    console.error('Classification error:', err);
    return null;
  }
}

export async function generateTitle(parentBody: string, cardBody: string, cardType: string, isQuestion: boolean): Promise<string> {
  try {
    const response = await client.chat.complete({
      model: FAST_MODEL,
      messages: [
        { role: 'system', content: TITLE_SYSTEM },
        { role: 'user', content: `PARENT:\n${parentBody}\n\nCARD (type: ${cardType}, is_question: ${isQuestion}):\n${cardBody}` },
      ],
      maxTokens: 50,
    });
    const content = response.choices?.[0]?.message?.content;
    return (typeof content === 'string' ? content : '').trim().replace(/^["']|["']$/g, '') || 'Untitled card';
  } catch (err) {
    console.error('Title generation error:', err);
    return 'Untitled card';
  }
}

export async function generateLineage(parentBody: string, cardBody: string, cardType: string): Promise<string> {
  try {
    const response = await client.chat.complete({
      model: FAST_MODEL,
      messages: [
        { role: 'system', content: LINEAGE_SYSTEM },
        { role: 'user', content: `PARENT:\n${parentBody}\n\nCARD (type: ${cardType}):\n${cardBody}` },
      ],
      maxTokens: 150,
    });
    const content = response.choices?.[0]?.message?.content;
    return (typeof content === 'string' ? content : '').trim() || 'Builds on the parent contribution.';
  } catch (err) {
    console.error('Lineage generation error:', err);
    return 'Builds on the parent contribution.';
  }
}

export async function generateProposalSummary(body: string): Promise<string> {
  try {
    const response = await client.chat.complete({
      model: FAST_MODEL,
      messages: [
        { role: 'system', content: PROPOSAL_SUMMARY_SYSTEM },
        { role: 'user', content: body },
      ],
      maxTokens: 100,
    });
    const content = response.choices?.[0]?.message?.content;
    return (typeof content === 'string' ? content : '').trim() || body.slice(0, 150) + '...';
  } catch (err) {
    console.error('Proposal summary error:', err);
    return body.slice(0, 150) + '...';
  }
}

export async function reclassify(
  parentBody: string, cardBody: string,
  originalType: string, originalExplanation: string, chosenType: string
): Promise<{ explanation: string; is_question: boolean } | null> {
  try {
    const response = await client.chat.complete({
      model: FAST_MODEL,
      messages: [
        { role: 'system', content: RECLASSIFY_SYSTEM },
        { role: 'user', content: `PARENT:\n${parentBody}\n\nCARD:\n${cardBody}\n\nOriginal type: ${originalType}\nOriginal explanation: ${originalExplanation}\nAuthor's chosen type: ${chosenType}` },
      ],
      responseFormat: { type: 'json_object' },
      maxTokens: 300,
    });
    const content = response.choices?.[0]?.message?.content;
    if (!content) return null;
    const parsed = parseJSON(typeof content === 'string' ? content : '');
    return {
      explanation: parsed.explanation || '',
      is_question: !!parsed.is_question,
    };
  } catch (err) {
    console.error('Reclassify error:', err);
    return null;
  }
}

const SYNTHESIS_SYSTEM = `You are a synthesis advisor for Groven, a structured deliberation platform.

Your task: analyse a complete discussion and suggest 1-3 opportunities where
a synthesis card could connect divergent or complementary threads.

A synthesis connects two or more existing lines of thought, reconciling or
integrating divergent positions into a coherent, actionable proposal.

Your response MUST have two parts, in this exact order:

PART 1 — Analysis (wrapped in <analysis> tags):
Think step by step. Map the discussion structure, identify which threads diverge or
complement each other. For each pair or cluster of threads, ask: can these be
reconciled into a single actionable proposal? Write 3-6 sentences of analysis.
This analysis will be shown to the user in real time.

PART 2 — JSON (after the closing </analysis> tag):
Output ONLY valid JSON with your suggestions. No markdown fences.

Each suggestion must:
1. Identify a primary parent card (the card it most directly responds to)
2. Identify 1-3 other referenced cards whose ideas it integrates
3. Propose a body text for the synthesis (2-4 sentences). IMPORTANT: the body must
   synthesise the referenced threads into a clear, actionable proposal — a concrete
   position or recommendation that participants can support or oppose.
4. Propose a short title (max 8 words)
5. Explain why this synthesis makes sense (1-2 sentences)

Only suggest syntheses where genuinely different perspectives can be connected.
Do NOT suggest syntheses between cards that already agree.
Do NOT suggest a synthesis if one already exists that covers the same connection.

Example response format:
<analysis>
The discussion splits into three threads...
</analysis>
{
  "suggestions": [
    {
      "parent_id": "<id of the primary parent card>",
      "referenced_ids": ["<id1>", "<id2>"],
      "title": "<max 8 words>",
      "body": "<2-4 sentences>",
      "reasoning": "<1-2 sentences>"
    }
  ]
}`;

export async function* suggestSynthesisStream(
  spaceTitle: string,
  cards: Array<{ id: string; card_type: string; title: string; body: string; author_name: string }>,
  links: Array<{ source_card_id: string; target_card_id: string; relation_type: string }>
): AsyncGenerator<{ type: string; data: any }> {
  try {
    // Build card descriptions
    const cardDescs = cards.map(c => {
      const truncBody = c.body.length > 300 ? c.body.slice(0, 300) + '...' : c.body;
      return `[${c.id}] (${c.card_type}) "${c.title || 'Untitled'}" by ${c.author_name}: ${truncBody}`;
    }).join('\n\n');

    const linkDescs = links.map(l => `${l.source_card_id} --${l.relation_type}--> ${l.target_card_id}`).join('\n');

    const existingSyntheses = cards.filter(c => c.card_type === 'summary');
    const synthDesc = existingSyntheses.length > 0
      ? `\n\nExisting synthesis cards (do not re-suggest these connections):\n${existingSyntheses.map(s => `- "${s.title}": ${s.body.slice(0, 150)}`).join('\n')}`
      : '';

    const validIds = new Set(cards.map(c => c.id));

    const userMessage = `Discussion: "${spaceTitle}"\n\nCards:\n${cardDescs}\n\nLinks:\n${linkDescs}${synthDesc}`;

    const stream = await client.chat.stream({
      model: REASONING_MODEL,
      messages: [
        { role: 'system', content: SYNTHESIS_SYSTEM },
        { role: 'user', content: userMessage },
      ],
      maxTokens: 4096,
    });

    let fullContent = '';
    let inAnalysis = false;
    let analysisBuffer = '';

    for await (const chunk of stream) {
      const delta = chunk.data?.choices?.[0]?.delta?.content;
      if (!delta) continue;
      fullContent += delta;

      // Stream analysis section
      if (!inAnalysis && fullContent.includes('<analysis>')) {
        inAnalysis = true;
        const afterTag = fullContent.split('<analysis>')[1] || '';
        analysisBuffer = afterTag.split('</analysis>')[0];
        if (analysisBuffer) yield { type: 'reasoning', data: analysisBuffer };
      } else if (inAnalysis && !fullContent.includes('</analysis>')) {
        const newText = delta;
        yield { type: 'reasoning', data: newText };
      } else if (inAnalysis && fullContent.includes('</analysis>')) {
        inAnalysis = false;
      }
    }

    // Parse JSON after </analysis>
    const afterAnalysis = fullContent.split('</analysis>')[1] || '';
    let cleaned = afterAnalysis.trim();
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }

    try {
      const parsed = JSON.parse(cleaned);
      const suggestions = (parsed.suggestions || []).filter((s: any) => {
        return validIds.has(s.parent_id) &&
          (s.referenced_ids || []).every((id: string) => validIds.has(id));
      });
      yield { type: 'done', data: suggestions };
    } catch (parseErr) {
      console.error('Synthesis parse error:', parseErr);
      yield { type: 'error', data: 'Failed to parse synthesis suggestions' };
    }
  } catch (err) {
    console.error('Synthesis stream error:', err);
    yield { type: 'error', data: 'Synthesis suggestion failed' };
  }
}
