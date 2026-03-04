"""
Seed data for Groven prototype.
Three pre-loaded discussion spaces in the CORPUS context.
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
    # SPACE 3: corpus-jury-composition
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
]


def load():
    """Load all seed data into the database."""
    for space in SPACES:
        db.create_space(**space)

    for node in NODES:
        db.create_node(**node)
