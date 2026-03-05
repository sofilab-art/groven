"""
Seed data for Groven prototype.
Pre-loaded discussion spaces for demonstration.
All content in English.
"""

import db

SPACES = [
    {
        "id": "corpus-ai-training",
        "title": "Should AI training licenses be time-limited?",
        "description": "Discussion about time-limiting licenses that allow training AI models on copyrighted works.",
        "status": "open"
    },
    {
        "id": "corpus-revenue-split",
        "title": "How should the royalty pool be split between creators?",
        "description": "Debate about the distribution model for AI training license revenue: equal shares, weighted shares, or hybrid models.",
        "status": "open"
    },
    {
        "id": "corpus-jury-composition",
        "title": "Who should sit on the governance jury?",
        "description": "Question of how to compose and select the governance jury that votes on platform decisions.",
        "status": "ready"
    },
    {
        "id": "ensemble-lachenmann",
        "title": "Should our ensemble perform Helmut Lachenmann?",
        "description": "Ten musicians debate whether to programme Lachenmann: rehearsal demands, audience readiness, programming strategy, and a two-season phased proposal.",
        "status": "open"
    }
]

# Node IDs — stable for cross-references
# Space 1: corpus-ai-training
S1_SEED    = "s1-seed-amara"
S1_B1      = "s1-branch1-jonas"
S1_B2      = "s1-branch2-yuki"
S1_B3      = "s1-branch3-fatima"
S1_B4      = "s1-branch4-amara"
S1_B5      = "s1-branch5-jonas"

# Space 2: corpus-revenue-split
S2_SEED    = "s2-seed-kwame"
S2_B1      = "s2-branch1-lena"
S2_B2      = "s2-branch2-kwame"
S2_B3      = "s2-branch3-priya"
S2_B4      = "s2-branch4-tomas"

# Space 3: corpus-jury-composition
S3_SEED    = "s3-seed-nadia"
S3_B1      = "s3-branch1-felix"
S3_B2      = "s3-branch2-amara"
S3_B3      = "s3-branch3-kwame"
S3_B4      = "s3-branch4-nadia"
S3_B5      = "s3-branch5-felix"

# Space 4: ensemble-lachenmann
S4_SEED    = "s4-seed-clara"
S4_B1      = "s4-branch1-marcus"
S4_B2      = "s4-branch2-reiko"
S4_B3      = "s4-branch3-tomas"
S4_B4      = "s4-branch4-yuna"
S4_B5      = "s4-branch5-dmitri"
S4_B6      = "s4-branch6-aisha"
S4_B7      = "s4-branch7-felix"
S4_B8      = "s4-branch8-priya"
S4_B9      = "s4-branch9-leo"
S4_B10     = "s4-branch10-sofia"
S4_SYNTH   = "s4-synthesis-groven"

NODES = [
    # =========================================================================
    # SPACE 1: corpus-ai-training
    # =========================================================================
    {
        "id": S1_SEED,
        "space_id": "corpus-ai-training",
        "parent_id": None,
        "node_type": "seed",
        "branch_type": None,
        "author": "Amara",
        "title": "Time-limiting AI training licenses",
        "body": "A license that permits training an AI model should automatically expire after 2 years. Models already trained under it continue to exist — but new training runs require a new license. This creates a recurring market and prevents one-time licenses from establishing perpetual rights. Creators retain the ability to adjust their terms to changing market conditions, rather than agreeing once in a blanket deal.",
        "lineage_desc": None,
        "llm_proposed_type": None,
        "llm_explanation": None,
        "contested": 0
    },
    {
        "id": S1_B1,
        "space_id": "corpus-ai-training",
        "parent_id": S1_SEED,
        "node_type": "branch",
        "branch_type": "extension",
        "author": "Jonas",
        "title": "Model generation as license trigger",
        "body": "The principle could be extended to model versions: every new major release of a model (GPT-5, Gemini 3, etc.) would require a new licensing round — even if the training data is identical. This makes each model generation a license trigger. It prevents a single data deal from covering all future iterations of a system, and gives creators renewed bargaining power at every technological leap.",
        "lineage_desc": "Builds on Amara's time-limit idea and extends it from time-based to version-based expiration. Goal: even tighter coupling to technological progress.",
        "llm_proposed_type": "extension",
        "llm_explanation": "This branch carries the time-based licensing idea into version-based territory that the parent did not anticipate. This matches the extension type because it adds a new dimension (model versioning) to the original concept.",
        "contested": 0
    },
    {
        "id": S1_B2,
        "space_id": "corpus-ai-training",
        "parent_id": S1_SEED,
        "node_type": "branch",
        "branch_type": "clarification",
        "author": "Yuki",
        "title": "Defining 'new training run'",
        "body": "What remains unclear: what counts as a 'new training run'? Fine-tuning on an existing base model? Continual learning on live data? Distillation into a smaller model? The term must be technically defined, otherwise the clause is unenforceable. Without clear technical boundaries, grey areas emerge that large companies can systematically exploit.",
        "lineage_desc": "Sharpens the central term from Amara's seed. Without this clarification, the entire time-limit idea is legally vulnerable.",
        "llm_proposed_type": "extension",
        "llm_explanation": "This branch raises new technical questions about the definition of 'training run' not addressed in the parent. This extends the original idea into implementation territory.",
        "contested": 1
    },
    {
        "id": S1_B3,
        "space_id": "corpus-ai-training",
        "parent_id": S1_SEED,
        "node_type": "branch",
        "branch_type": "contradiction",
        "author": "Fatima",
        "title": "Time limits only shift the problem",
        "body": "Time-limiting licenses doesn't solve the problem — it shifts it. Publishers and platforms will issue blanket 2-year licenses covering all future models to avoid administrative overhead. The result: perpetual rights through indefinite framework agreements. Market power still lies with the platforms that can dictate such framework agreements, not with individual creators.",
        "lineage_desc": "Contradicts Amara's core assumption that time limits correct the power imbalance. Argues that the structure of the licensing market undermines time-limiting.",
        "llm_proposed_type": "contradiction",
        "llm_explanation": "This branch directly challenges the effectiveness of the parent's time-based licensing proposal. It identifies a fundamental conflict with the parent's assumption that time limits create ongoing negotiation power.",
        "contested": 0
    },
    {
        "id": S1_B4,
        "space_id": "corpus-ai-training",
        "parent_id": S1_B3,
        "node_type": "branch",
        "branch_type": "reframing",
        "author": "Amara",
        "title": "The problem isn't time limits — it's blanket licenses",
        "body": "Fatima's objection is valid — but it's not an argument against time limits, it's an argument against blanket licenses. The real safeguard would be: licenses must be model-specific and must not contain blanket clauses for future systems. The problem isn't the time axis, it's the scope. A license for GPT-5 must not automatically cover GPT-6 — regardless of whether it's time-limited or not.",
        "lineage_desc": "Takes Fatima's contradiction seriously but reinterprets it: it's not the time limit that's wrong, but the scope of licenses that needs to be constrained.",
        "llm_proposed_type": "contradiction",
        "llm_explanation": "This branch opposes the parent's conclusion by arguing the problem is scope, not time limits. It proposes a divergent direction from the parent's criticism.",
        "contested": 1
    },
    {
        "id": S1_B5,
        "space_id": "corpus-ai-training",
        "parent_id": S1_B1,
        "node_type": "branch",
        "branch_type": "synthesis",
        "author": "Jonas",
        "title": "Consistent principle: model-bound, non-transferable licenses",
        "body": "If we combine Branch 1 (model generation as trigger) and Branch 4 (no blanket future clauses), a consistent principle emerges: licenses are bound to specific model versions, expire with the model generation, and cannot be granted in advance for unknown future systems. This principle is technically verifiable, legally formulable, and gives creators renewed bargaining power at every version leap.",
        "lineage_desc": "Connects the model-version idea (Branch 1) with the anti-blanket clause (Branch 4) into a unified licensing principle.",
        "llm_proposed_type": "synthesis",
        "llm_explanation": "This branch explicitly connects two earlier lines of argument into a unified licensing principle. This matches the synthesis type as it reconciles the version-trigger and anti-blanket-clause ideas.",
        "contested": 0
    },

    # =========================================================================
    # SPACE 2: corpus-revenue-split
    # =========================================================================
    {
        "id": S2_SEED,
        "space_id": "corpus-revenue-split",
        "parent_id": None,
        "node_type": "seed",
        "branch_type": None,
        "author": "Kwame",
        "title": "Equal shares per creator",
        "body": "The simplest fair approach: equal shares per creator who has opted in. No weighting system, no complexity, no way for major players to dominate the distribution. Equality as a principle prevents the reproduction of existing power structures in the distribution model. What can be criticized as 'unfairly simple' is in truth the only approach that introduces no hidden evaluation hierarchies.",
        "lineage_desc": None,
        "llm_proposed_type": None,
        "llm_explanation": None,
        "contested": 0
    },
    {
        "id": S2_B1,
        "space_id": "corpus-revenue-split",
        "parent_id": S2_SEED,
        "node_type": "branch",
        "branch_type": "contradiction",
        "author": "Lena",
        "title": "Equal shares reward quantity, not relevance",
        "body": "Equal shares reward quantity, not relevance. Someone who uploads 10,000 generic loop samples receives the same as someone who contributes 50 carefully curated, style-defining recordings. This perverts the purpose of the pool. A distribution model must at least partially reflect the qualitative dimension of contributions — otherwise it incentivizes mass production over quality work.",
        "lineage_desc": "Directly contradicts Kwame's equality approach: equality per creator ignores qualitative differences between contributions and creates the wrong incentives.",
        "llm_proposed_type": "contradiction",
        "llm_explanation": "This branch directly opposes the parent's equal-share model by identifying a fundamental flaw in its incentive structure. It proposes that quality must factor into distribution, contradicting the parent's simplicity principle.",
        "contested": 0
    },
    {
        "id": S2_B2,
        "space_id": "corpus-revenue-split",
        "parent_id": S2_B1,
        "node_type": "branch",
        "branch_type": "extension",
        "author": "Kwame",
        "title": "Equality per work with a cap per creator",
        "body": "Lena's objection is valid. A possible answer: not equality per creator, but equality per work — with a cap per creator (e.g., max 200 works count toward the calculation). This prevents spam while recognizing depth. This model preserves the simplicity of the original proposal but addresses the spam problem through a natural cap that doesn't excessively privilege large catalogs.",
        "lineage_desc": "Takes Lena's criticism on board and extends the equality approach: instead of per-creator, distribute per-work, with a cap against spam.",
        "llm_proposed_type": "reframing",
        "llm_explanation": "This branch presents the same equality concern from a different angle — per-work instead of per-creator. It reinterprets the distribution unit rather than extending into new territory.",
        "contested": 1
    },
    {
        "id": S2_B3,
        "space_id": "corpus-revenue-split",
        "parent_id": S2_SEED,
        "node_type": "branch",
        "branch_type": "reframing",
        "author": "Priya",
        "title": "Equality as the most honest option when relevance is unmeasurable",
        "body": "The question 'equal vs. weighted' assumes we can measure relevance. If we can't do so reliably, equality isn't the weakest compromise — it's the only honest option. Every weighting implies an evaluating authority, and every evaluating authority reproduces power structures. As long as no transparent, community-validated relevance metric exists, rejecting weighting isn't naivety — it's epistemic humility.",
        "lineage_desc": "Takes Kwame's position and reinterprets it: not as 'the simplest solution', but as an epistemologically necessary consequence of the immeasurability of relevance.",
        "llm_proposed_type": "extension",
        "llm_explanation": "This branch adds a philosophical justification for equal shares that goes beyond the parent's practical argument. It extends the reasoning into epistemological territory.",
        "contested": 1
    },
    {
        "id": S2_B4,
        "space_id": "corpus-revenue-split",
        "parent_id": S2_B1,
        "node_type": "branch",
        "branch_type": "clarification",
        "author": "Tomás",
        "title": "Three different relevance metrics, three distributions",
        "body": "Branch 1 speaks of 'relevance' — but relevance for whom? For AI training (how often was the sample actually used in training)? For the market (how well-known is the creator, how high are the streaming numbers)? For the community (peer-rated quality by other contributors)? Three different metrics, three different distributions. Before we discuss weighting, we need to clarify what kind of relevance we mean.",
        "lineage_desc": "Clarifies the vague concept of relevance in Lena's contradiction. Without this distinction, the demand for 'relevance-based distribution' is not operationalizable.",
        "llm_proposed_type": "clarification",
        "llm_explanation": "This branch sharpens the meaning of 'relevance' used in the parent by distinguishing three concrete metrics. It makes precise what the parent left ambiguous without adding new argumentation.",
        "contested": 0
    },

    # =========================================================================
    # SPACE 3: corpus-jury-composition (CORPUS context)
    # =========================================================================
    {
        "id": S3_SEED,
        "space_id": "corpus-jury-composition",
        "parent_id": None,
        "node_type": "seed",
        "branch_type": None,
        "author": "Nadia",
        "title": "Sortition instead of elections for the governance jury",
        "body": "The jury should be drawn from the contributor pool by sortition — random selection with stratification. No elections, no self-nomination, no accumulation of decision-making power through repeated participation. Democratic legitimacy here comes not from voting but from representativeness. This model is proven in citizens' assemblies worldwide and avoids the professionalization of governance roles.",
        "lineage_desc": None,
        "llm_proposed_type": None,
        "llm_explanation": None,
        "contested": 0
    },
    {
        "id": S3_B1,
        "space_id": "corpus-jury-composition",
        "parent_id": S3_SEED,
        "node_type": "branch",
        "branch_type": "extension",
        "author": "Felix",
        "title": "Three stratification dimensions for sortition",
        "body": "Stratification should follow at least three axes: region of origin (Global North / Global South / other), genre affiliation (electronic / acoustic / folk tradition / other), and career stage (emerging / established). Without these three dimensions, even sortition reproduces structural imbalances. The specific weighting within each dimension must be proportional to the contributor base, not equal — otherwise small groups become overrepresented.",
        "lineage_desc": "Extends Nadia's sortition proposal with concrete stratification dimensions. Without this specification, sortition remains an abstract principle.",
        "llm_proposed_type": "extension",
        "llm_explanation": "This branch specifies the concrete stratification dimensions for the parent's sortition proposal. It carries the abstract idea into implementable territory the parent did not address.",
        "contested": 0
    },
    {
        "id": S3_B2,
        "space_id": "corpus-jury-composition",
        "parent_id": S3_SEED,
        "node_type": "branch",
        "branch_type": "clarification",
        "author": "Amara",
        "title": "Open questions: duration and re-selection",
        "body": "How long does a jury term last? And can the same person be drawn again in the next round? This affects whether expertise accumulates or whether continuity is structurally prevented. Too short a term (e.g., 3 months) prevents onboarding; too long (e.g., 2 years) contradicts the rotation principle. Re-selection eligibility is the most critical parameter: if allowed, a de facto informal elite emerges.",
        "lineage_desc": "Identifies two central parameters left unspecified in Nadia's proposal: jury term length and re-selection eligibility. Without clarification, the model remains incomplete.",
        "llm_proposed_type": "extension",
        "llm_explanation": "This branch raises new operational questions about jury duration and re-selection that go beyond the parent's proposal. It extends the discussion into implementation details.",
        "contested": 1
    },
    {
        "id": S3_B3,
        "space_id": "corpus-jury-composition",
        "parent_id": S3_SEED,
        "node_type": "branch",
        "branch_type": "contradiction",
        "author": "Kwame",
        "title": "Sortition doesn't work with small pools",
        "body": "Sortition works with large pools. At CORPUS launch with fewer than 50 contributors, the pool is too small for meaningful random selection. In small communities, sortition leads to unrepresentative random samples — classical urn logic only holds from about 150-200 participants. Below that, variance is so high that individual draws can produce extreme compositions. Trust in the body's legitimacy would erode immediately after the first 'unlucky' draws.",
        "lineage_desc": "Contradicts Nadia's sortition proposal with a statistical argument: at CORPUS's expected initial size, random selection doesn't work reliably.",
        "llm_proposed_type": "reframing",
        "llm_explanation": "This branch recontextualizes the sortition proposal by shifting the frame from democratic principle to statistical feasibility. It offers a fundamentally different lens on the same mechanism.",
        "contested": 1
    },
    {
        "id": S3_B4,
        "space_id": "corpus-jury-composition",
        "parent_id": S3_B3,
        "node_type": "branch",
        "branch_type": "reframing",
        "author": "Nadia",
        "title": "Not against sortition — for a transitional arrangement",
        "body": "Kwame's objection is statistically correct. But the argument against sortition in small pools is not an argument for elections — it's an argument for a transitional arrangement. In Phase 1 (under 100 contributors): everyone participates, no selection. From 100 onward: sortition takes effect. This avoids the statistical weakness of small samples without abandoning the more democratic model long-term. The switch from Phase 1 to Phase 2 should be triggered automatically, not by vote.",
        "lineage_desc": "Takes Kwame's statistical argument seriously but reinterprets it: instead of rejecting sortition outright, proposes a phased model.",
        "llm_proposed_type": "reframing",
        "llm_explanation": "This branch takes the parent's statistical objection and reinterprets it as a timing issue rather than a fundamental flaw. It offers a different interpretive angle on the same observation.",
        "contested": 0
    },
    {
        "id": S3_B5,
        "space_id": "corpus-jury-composition",
        "parent_id": S3_B1,
        "node_type": "branch",
        "branch_type": "synthesis",
        "author": "Felix",
        "title": "Summary: phased model with stratification",
        "body": "Summary of the current state: sortition with stratification (Branch 1) applies from 100 contributors onward (Branch 4). Stratification dimensions: region, genre, career stage. Before that: full participation by all contributors. Branch 2 remains open: jury term length and re-selection eligibility must be determined by the jury in its first session — this is not a bug but a feature: the first jury defines its own succession logic. This principle of constitutional self-determination is central to the body's legitimacy.",
        "lineage_desc": "Connects the stratification dimensions (Branch 1), the phased model (Branch 4), and the open question of jury duration (Branch 2) into a coherent summary.",
        "llm_proposed_type": "extension",
        "llm_explanation": "This branch adds the novel idea that the first jury should define its own succession rules. It extends beyond mere synthesis into new governance territory.",
        "contested": 1
    },

    # =========================================================================
    # SPACE 4: ensemble-lachenmann
    # =========================================================================
    {
        "id": S4_SEED,
        "space_id": "ensemble-lachenmann",
        "parent_id": None,
        "node_type": "seed",
        "branch_type": None,
        "author": "Clara",
        "title": "Proposing Lachenmann for next season",
        "body": "I believe our ensemble should programme a Lachenmann piece for the upcoming season. His music demands extreme extended techniques and a rethinking of what sound means in a concert setting. It would challenge us technically, attract contemporary music audiences, and position us as a forward-looking group. The rehearsal investment is significant but the artistic payoff could define our identity for years.",
        "lineage_desc": None,
        "llm_proposed_type": None,
        "llm_explanation": None,
        "contested": 0
    },
    {
        "id": S4_B1,
        "space_id": "ensemble-lachenmann",
        "parent_id": S4_SEED,
        "node_type": "branch",
        "branch_type": "extension",
        "author": "Marcus",
        "title": "Program Lachenmann with Sciarrino for contrast",
        "body": "If we commit to Lachenmann, we should pair it with Salvatore Sciarrino on the same programme. Both composers explore the threshold of audibility, but Sciarrino approaches it from an Italian bel canto tradition while Lachenmann comes from the German materialist school. The contrast would make each piece illuminate the other and give the audience two entry points into radical sound-worlds rather than one.",
        "lineage_desc": "Building on the recommendation to program Lachenmann, this extension proposes pairing his work with Salvatore Sciarrino so the contrast between Lachenmann\u2019s German materialist approach and Sciarrino\u2019s Italian bel canto\u2013inflected threshold-of-audibility will illuminate both pieces and give audiences two complementary entry points into radical sound-worlds.",
        "llm_proposed_type": "extension",
        "llm_explanation": "The Branch proposes pairing Lachenmann with Sciarrino to complement and expand the proposed programme, arguing that the contrast between their approaches will illuminate each piece and broaden audience entry points. This is an extension because it builds on and supports the parent\u2019s proposal by carrying the programming idea into new territory without objecting to or reframing the original suggestion.",
        "contested": 0
    },
    {
        "id": S4_B2,
        "space_id": "ensemble-lachenmann",
        "parent_id": S4_SEED,
        "node_type": "branch",
        "branch_type": "contradiction",
        "author": "Reiko",
        "title": "Lachenmann requires prohibitive rehearsal time",
        "body": "The rehearsal time required for Lachenmann is prohibitive. His notation demands individual coaching for nearly every player \u2014 extended techniques that most of us have never encountered. With our current schedule of 4 rehearsals per programme, we would need to cut one other work entirely or add extra sessions that the budget does not cover. The artistic ambition is admirable but the practical reality makes it irresponsible.",
        "lineage_desc": "Builds on the parent\u2019s claim that Lachenmann requires heavy rehearsal investment but flips it into a practical objection, arguing that the extreme individual coaching, limited rehearsal slots, and budget constraints make programming him impractical and irresponsible.",
        "llm_proposed_type": "contradiction",
        "llm_explanation": "This Branch objects to the parent\u2019s proposal, arguing that rehearsal time, individual coaching needs, and budget constraints make programming Lachenmann impractical and irresponsible. It directly challenges and undermines the parent\u2019s recommendation by raising practical problems and objections, fitting the \u2018contradiction\u2019 category.",
        "contested": 0
    },
    {
        "id": S4_B3,
        "space_id": "ensemble-lachenmann",
        "parent_id": S4_SEED,
        "node_type": "branch",
        "branch_type": "reframing",
        "author": "Tom\u00e1s",
        "title": "Prioritize audience development before programming Lachenmann",
        "body": "The question is not whether Lachenmann is artistically worthwhile \u2014 it is whether our audience is ready. Programming Lachenmann is not a musical decision; it is an audience development decision. If we do not invest equally in pre-concert talks, programme notes, and perhaps a workshop where the audience can try the techniques themselves, we risk an empty hall and a board that never approves contemporary music again.",
        "lineage_desc": "Building on the parent\u2019s case for programming Lachenmann as an identity-defining artistic investment, this reframes the decision as primarily an audience-development problem, arguing that without substantial outreach (pre-concert talks, programme notes, workshops) the piece could fail to draw listeners and provoke board resistance.",
        "llm_proposed_type": "reframing",
        "llm_explanation": "The Branch shifts the issue from being primarily a musical/technical choice to being an audience-development decision, insisting success depends on outreach like talks, notes, and workshops. This matches reframing because it offers a fundamentally different interpretive angle on the parent\u2019s proposal without directly opposing the idea of programming Lachenmann.",
        "contested": 0
    },
    {
        "id": S4_B4,
        "space_id": "ensemble-lachenmann",
        "parent_id": S4_B2,
        "node_type": "branch",
        "branch_type": "extension",
        "author": "Yuna",
        "title": "Introduce Lachenmann via a chamber piece",
        "body": "Rather than a full orchestral Lachenmann work, we could start with a chamber piece \u2014 perhaps Air or Pression. These require only 1\u20133 players and can be rehearsed independently from the main programme. The audience gets exposed to Lachenmann aesthetics without the full ensemble bearing the rehearsal burden. It is a stepping stone, not a retreat.",
        "lineage_desc": "Accepting that a full orchestral Lachenmann is impractical because of intensive rehearsal and budget limits, this extension proposes programming a short chamber work (e.g., Air or Pression) for 1\u20133 players so the orchestra can introduce his aesthetics with minimal rehearsal burden as a stepping-stone.",
        "llm_proposed_type": "extension",
        "llm_explanation": "The Branch proposes a practical compromise\u2014program a Lachenmann chamber piece with 1\u20133 players to expose audiences while reducing rehearsal burden. This builds on and supports the parent\u2019s concern about rehearsal limits by offering a new constructive option the parent did not anticipate, which fits the definition of an extension.",
        "contested": 0
    },
    {
        "id": S4_B5,
        "space_id": "ensemble-lachenmann",
        "parent_id": S4_B3,
        "node_type": "branch",
        "branch_type": "extension",
        "author": "Dmitri",
        "title": "Co-produce lecture-recital series with university",
        "body": "The education angle is exactly right. Our local university has a musicology department that has been looking for partnership opportunities. We could co-produce a lecture-recital series where Lachenmann works are demonstrated, explained, and discussed before the main concert. The university covers the cost of the lectures; we provide the venue and the performers. This turns the audience development problem into a solved one.",
        "lineage_desc": "Extending the parent\u2019s point that programming Lachenmann demands audience-development measures, this branch proposes a concrete solution\u2014a co-produced lecture-recital series with the university funding the lectures while we supply venue and performers\u2014to operationalize the talks/workshops and effectively solve the audience development problem.",
        "llm_proposed_type": "extension",
        "llm_explanation": "The Branch endorses the parent\u2019s audience-development argument and proposes a concrete partnership with the local university to co-produce lecture-recitals, sharing costs and responsibilities to deliver the educational programming. This takes the parent\u2019s recommendation further by adding new, supportive implementation details rather than contradicting or reframing it, so it is an extension.",
        "contested": 0
    },
    {
        "id": S4_B6,
        "space_id": "ensemble-lachenmann",
        "parent_id": S4_SEED,
        "node_type": "branch",
        "branch_type": "contradiction",
        "author": "Aisha",
        "title": "Prefer accessible contemporary composers over Lachenmann",
        "body": "I love contemporary music, but Lachenmann is too niche even for new music audiences. His aesthetic is deliberately abrasive \u2014 that is the point. Most concert-goers, even adventurous ones, find sustained periods of bowing on the bridge or playing inside the piano genuinely unpleasant. We should programme living composers who push boundaries without alienating every listener in the room. Think Unsuk Chin or Georg Friedrich Haas \u2014 challenging but not hostile.",
        "lineage_desc": "Acknowledging the parent\u2019s aim to program challenging contemporary work and build a forward-looking identity, this branch contradicts the specific choice of Lachenmann as too niche and abrasive for many listeners and steers the proposal toward living composers like Unsuk Chin or Georg Friedrich Haas who push boundaries without alienating the audience.",
        "llm_proposed_type": "contradiction",
        "llm_explanation": "The Branch objects to programming Lachenmann, arguing his music is overly niche and alienating and proposing alternative composers instead. This raises concerns that undermine the parent\u2019s proposal about audience appeal and feasibility, which matches the \u2018contradiction\u2019 type.",
        "contested": 0
    },
    {
        "id": S4_B7,
        "space_id": "ensemble-lachenmann",
        "parent_id": S4_B2,
        "node_type": "branch",
        "branch_type": "contradiction",
        "author": "Felix",
        "title": "Not prohibitive: learnable in 2\u20133 sessions",
        "body": "Reiko overstates the difficulty. I have performed Gran Torso and several of the string quartets. The extended techniques are demanding but learnable in 2\u20133 focused sessions per player. The real challenge is not technical \u2014 it is psychological. Players need to accept that their instrument will sound wrong by classical standards. Once that barrier falls, the notation is precise and logical. We can do this.",
        "lineage_desc": "The branch takes up the parent\u2019s concern about Lachenmann\u2019s demanding techniques but contradicts the claim that they make the piece impractical, arguing from experience that the techniques are learnable in 2\u20133 focused sessions and reframing the main obstacle as players\u2019 psychological acceptance rather than an insurmountable rehearsal-time or budget problem, thus concluding the work is feasible.",
        "llm_proposed_type": "contradiction",
        "llm_explanation": "The Branch disputes the parent\u2019s claim that Lachenmann is prohibitively demanding, arguing the techniques are learnable in a few focused sessions and the true barrier is psychological rather than rehearsal time. This directly challenges and undermines the parent\u2019s conclusion that programming the work would be impractical or irresponsible, matching the \u2018contradiction\u2019 type.",
        "contested": 0
    },
    {
        "id": S4_B8,
        "space_id": "ensemble-lachenmann",
        "parent_id": S4_B1,
        "node_type": "branch",
        "branch_type": "extension",
        "author": "Priya",
        "title": "Programme as sound-of-listening arc",
        "body": "The Sciarrino pairing is inspired. I would go further: frame the entire programme as the sound of listening \u2014 open with a short Feldman piece, then Sciarrino, then Lachenmann. Each composer asks the audience to listen differently. The arc from gentle to radical gives people time to adjust. We could even commission programme notes that guide the listener through each shift in listening mode.",
        "lineage_desc": "Building on the Sciarrino\u2013Lachenmann pairing, this branch expands the idea into a full programme framed as the sound of listening by sequencing a gentle Feldman into Sciarrino then Lachenmann to ease audiences into progressively radical listening modes and proposing guided programme notes to help listeners through each shift.",
        "llm_proposed_type": "extension",
        "llm_explanation": "The Branch accepts the Sciarrino\u2013Lachenmann pairing and expands it into a full programme concept (adding a Feldman opener, sequencing pieces to create a listening arc, and commissioning guiding programme notes). Because it builds on and supports the parent\u2019s suggestion by carrying the idea into new territory without challenging or reframing it, it matches the \u2018extension\u2019 type.",
        "contested": 0
    },
    {
        "id": S4_B9,
        "space_id": "ensemble-lachenmann",
        "parent_id": S4_B5,
        "node_type": "branch",
        "branch_type": "contradiction",
        "author": "Leo",
        "title": "No university dependence \u2014 develop in-house capacity",
        "body": "The university partnership sounds promising but introduces a dependency we cannot control. What if the musicology department changes priorities? What if the lecture series gets poor attendance and the university pulls out? Our programming decisions should not depend on external institutions. If audience preparation is essential \u2014 and I agree it is \u2014 we should build that capacity in-house, even if it costs more initially.",
        "lineage_desc": "This branch acknowledges the university lecture-recital proposal as a means of audience preparation but contradicts it by warning that outsourcing creates uncontrollable dependency and therefore argues for building in-house audience-preparation capacity, even at higher initial cost.",
        "llm_proposed_type": "contradiction",
        "llm_explanation": "This Branch objects to the proposed university partnership and argues for building audience-preparation capacity in-house, citing risks of dependency and potential withdrawal. It challenges the parent\u2019s proposal by raising concerns that undermine its viability and recommends an alternative approach, which fits the \u2018contradiction\u2019 category.",
        "contested": 0
    },
    {
        "id": S4_B10,
        "space_id": "ensemble-lachenmann",
        "parent_id": S4_B4,
        "node_type": "branch",
        "branch_type": "extension",
        "author": "Sofia",
        "title": "Two-season plan: chamber then full ensemble",
        "body": "Starting with a chamber piece is a smart compromise but it should be framed as Phase 1 of a two-season plan. Season one: chamber Lachenmann plus the education programme. Season two, if the reception is positive: a full ensemble work. This gives us data \u2014 ticket sales, audience feedback, player readiness \u2014 before committing to the bigger investment. It also gives the board a clear decision point rather than an open-ended experiment.",
        "lineage_desc": "Building on the chamber-piece-as-stepping-stone idea, it reframes that start as Phase 1 of a two-season plan\u2014pairing a chamber Lachenmann and education programme in season one to gather ticket, feedback, and player-readiness data and provide the board a clear decision point for a full ensemble work in season two.",
        "llm_proposed_type": "extension",
        "llm_explanation": "The Branch takes the parent\u2019s idea of starting with a chamber Lachenmann piece and formalizes it into a two-season plan with Phase 1 being the chamber work plus education and Phase 2 contingent on positive reception. That builds on and supports the parent\u2019s proposal without contradicting it, adding a forward plan and decision point, so it is an extension.",
        "contested": 0
    },
    {
        "id": S4_SYNTH,
        "space_id": "ensemble-lachenmann",
        "parent_id": S4_SEED,
        "node_type": "branch",
        "branch_type": "synthesis",
        "author": "Groven AI",
        "title": "Phase-in Lachenmann via chamber pilot",
        "body": "Adopt a two-season rollout: program a short chamber Lachenmann work (1\u20133 players) next season as a pilot, with rehearsal happening independently from the main program, and commit to a full-ensemble Lachenmann work only if player readiness and audience response meet agreed thresholds. Define those thresholds in advance (e.g., minimum extra rehearsal hours required, player survey results, and post-concert audience feedback). This keeps the artistic commitment while preventing rehearsal overload risk.",
        "lineage_desc": "Connects the chamber-piece stepping stone (Yuna), the two-season plan with data-driven decision point (Sofia), the audience development framing (Tom\u00e1s), and the rehearsal concern (Reiko) into a single phased rollout with predefined success thresholds.",
        "llm_proposed_type": "synthesis",
        "llm_explanation": "This branch integrates multiple earlier threads \u2014 the chamber piece as stepping stone, the two-season plan, audience development, and rehearsal constraints \u2014 into a unified proposal with clear decision criteria. It reconciles the tension between artistic ambition and practical feasibility.",
        "contested": 0
    },
]


VOTES = [
    # Votes on S1_B5 — "Consistent principle: model-bound, non-transferable licenses"
    {
        "node_id": S1_B5,
        "author": "Amara",
        "position": "support",
        "justification": "This captures the intent of my original time-limit proposal better than I could."
    },
    {
        "node_id": S1_B5,
        "author": "Yuki",
        "position": "support",
        "justification": "Model-bound licensing makes the 'training run' definition enforceable."
    },
    {
        "node_id": S1_B5,
        "author": "Fatima",
        "position": "oppose",
        "justification": "Framework agreements will still circumvent per-model licensing in practice."
    },

    # Votes on S3_B5 — "Summary: phased model with stratification"
    {
        "node_id": S3_B5,
        "author": "Nadia",
        "position": "support",
        "justification": "The phased approach resolves Kwame's statistical objection while preserving sortition."
    },
    {
        "node_id": S3_B5,
        "author": "Kwame",
        "position": "support",
        "justification": "My concerns about small pools are addressed by the participation threshold."
    },
    {
        "node_id": S3_B5,
        "author": "Amara",
        "position": "oppose",
        "justification": "Letting the first jury define succession rules concentrates too much power in an initial random draw."
    },

    # Votes on S4_SYNTH — "Phase-in Lachenmann via chamber pilot"
    {
        "node_id": S4_SYNTH,
        "author": "Clara",
        "position": "support",
        "justification": "A phased approach is the responsible way to realize the artistic vision without risking our season."
    },
    {
        "node_id": S4_SYNTH,
        "author": "Sofia",
        "position": "support",
        "justification": "Predefined thresholds give the board a clear decision framework — exactly what they need."
    },
    {
        "node_id": S4_SYNTH,
        "author": "Felix",
        "position": "support",
        "justification": "Starting with chamber works is the ideal way to build confidence across the ensemble."
    },
    {
        "node_id": S4_SYNTH,
        "author": "Yuna",
        "position": "support",
        "justification": "This is precisely the stepping-stone approach I proposed — glad to see it formalized."
    },
    {
        "node_id": S4_SYNTH,
        "author": "Reiko",
        "position": "oppose",
        "justification": "Even a chamber pilot diverts rehearsal time from our core repertoire obligations."
    },
    {
        "node_id": S4_SYNTH,
        "author": "Aisha",
        "position": "oppose",
        "justification": "Why Lachenmann at all? The pilot normalizes a composer choice that should be questioned first."
    },
    {
        "node_id": S4_SYNTH,
        "author": "Tomás",
        "position": "support",
        "justification": "The audience development dimension is built into the thresholds — this takes my concern seriously."
    },
]


def load():
    """Load all seed data into the database."""
    for space in SPACES:
        db.create_space(**space)

    for node in NODES:
        db.create_node(**node)

    for vote in VOTES:
        db.create_vote(**vote)
