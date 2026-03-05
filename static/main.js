/**
 * Groven — Main UI Logic
 * Form toggle, form submission
 */

(function () {
    // ============================================================
    // Form Toggle: Seed vs Branch
    // ============================================================

    const form = document.getElementById('contribution-form');
    if (!form) return;

    const toggleRadios = form.querySelectorAll('input[name="contribution_type"]');
    const parentSelect = document.getElementById('parent-select');
    const parentIndicator = document.getElementById('parent-indicator');
    const parentIndicatorName = document.getElementById('parent-indicator-name');
    const clearParentBtn = document.getElementById('clear-parent');

    const titleGroup = document.getElementById('title-group');

    function updateFormMode() {
        const mode = form.querySelector('input[name="contribution_type"]:checked').value;
        const isBranch = mode === 'branch';

        // Show parent indicator only if in branch mode AND a parent is selected
        parentIndicator.style.display = (isBranch && parentSelect.value) ? 'flex' : 'none';

        // Hide title field for branches (LLM will suggest one)
        titleGroup.style.display = isBranch ? 'none' : '';

        if (!isBranch) {
            // Reset branch-specific fields
            parentSelect.value = '';
            parentIndicatorName.textContent = '';
        }
    }

    toggleRadios.forEach(radio => {
        radio.addEventListener('change', updateFormMode);
    });

    // Clear parent button
    if (clearParentBtn) {
        clearParentBtn.addEventListener('click', () => {
            parentSelect.value = '';
            parentIndicator.style.display = 'none';
            parentIndicatorName.textContent = '';
        });
    }

    // Initialize form to match default checked state
    updateFormMode();

    // ============================================================
    // Form Submission
    // ============================================================

    const submitBtn = document.getElementById('submit-btn');

    async function saveNode(payload) {
        try {
            const response = await fetch('/api/node', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (response.ok) {
                window.location.reload();
            } else {
                alert('Error: ' + (data.error || 'Unknown error'));
                submitBtn.disabled = false;
                submitBtn.textContent = 'Submit contribution';
            }
        } catch (err) {
            console.error('[Submit] Error:', err);
            alert('Network error. Please try again.');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit contribution';
        }
    }

    async function showReviewModal(payload) {
        try {
            const response = await fetch('/api/node/preview', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const err = await response.json();
                alert('Error: ' + (err.error || 'Unknown error'));
                return;
            }

            const modal = document.getElementById('review-modal');
            const titleInput = document.getElementById('review-title');
            const lineageInput = document.getElementById('review-lineage');
            const explanationEl = document.getElementById('review-explanation');
            const confidenceEl = document.getElementById('review-confidence');

            // Prepare modal with loading placeholders
            titleInput.value = '';
            titleInput.placeholder = 'Generating title...';
            titleInput.classList.add('field-loading');
            lineageInput.value = '';
            lineageInput.placeholder = 'Generating lineage...';
            lineageInput.classList.add('field-loading');
            explanationEl.textContent = '';
            confidenceEl.textContent = '';

            // Clear type selection and question flag
            modal.querySelectorAll('input[name="review_branch_type"]').forEach(r => { r.checked = false; });
            const questionCheckbox = document.getElementById('review-is-question');
            if (questionCheckbox) questionCheckbox.checked = false;

            // Preview object built progressively
            const preview = {};
            modal._payload = payload;
            modal._preview = preview;

            // Parse SSE stream
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            let modalOpened = false;

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });

                // Parse SSE events from buffer
                while (buffer.includes('\n\n')) {
                    const idx = buffer.indexOf('\n\n');
                    const block = buffer.slice(0, idx);
                    buffer = buffer.slice(idx + 2);

                    let eventType = 'message', data = '';
                    for (const line of block.split('\n')) {
                        if (line.startsWith('event: ')) eventType = line.slice(7);
                        if (line.startsWith('data: ')) data = line.slice(6);
                    }
                    if (!data) continue;

                    if (eventType === 'classification') {
                        const cls = JSON.parse(data);
                        preview.proposed_type = cls.proposed_type;
                        preview.is_question = cls.is_question;
                        preview.confidence = cls.confidence;
                        preview.explanation = cls.explanation;

                        // Populate classification fields
                        explanationEl.textContent =
                            cls.explanation || 'LLM unavailable \u2014 please classify manually.';
                        confidenceEl.textContent =
                            cls.confidence != null ? 'Confidence: ' + Math.round(cls.confidence * 100) + '%' : '';

                        const proposedType = cls.proposed_type || '';
                        modal.querySelectorAll('input[name="review_branch_type"]').forEach(r => {
                            r.checked = (r.value === proposedType);
                        });

                        if (questionCheckbox) questionCheckbox.checked = !!cls.is_question;

                        // Open modal immediately — title/lineage will fill in
                        if (!modalOpened) {
                            document.getElementById('analyzing-overlay').style.display = 'none';
                            modal.style.display = 'flex';
                            modalOpened = true;
                        }
                    } else if (eventType === 'title') {
                        const t = JSON.parse(data);
                        preview.suggested_title = t.suggested_title;
                        titleInput.value = t.suggested_title || '';
                        titleInput.placeholder = 'Title';
                        titleInput.classList.remove('field-loading');
                    } else if (eventType === 'lineage') {
                        const l = JSON.parse(data);
                        preview.lineage_desc = l.lineage_desc;
                        lineageInput.value = l.lineage_desc || '';
                        lineageInput.placeholder = 'Lineage description';
                        lineageInput.classList.remove('field-loading');
                    } else if (eventType === 'error') {
                        const err = JSON.parse(data);
                        alert(err.error || 'Analysis failed.');
                    }
                }
            }

            // Ensure modal is open even if classification arrived without event loop tick
            if (!modalOpened) {
                document.getElementById('analyzing-overlay').style.display = 'none';
                modal.style.display = 'flex';
            }

        } catch (err) {
            console.error('[Preview] Error:', err);
            alert('Network error during analysis. Please try again.');
        }
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const spaceId = form.dataset.spaceId;
        const mode = form.querySelector('input[name="contribution_type"]:checked').value;
        const author = document.getElementById('author-input').value.trim();
        const title = document.getElementById('title-input').value.trim();
        const body = document.getElementById('body-input').value.trim();

        if (!author || !body) {
            alert('Author and contribution are required fields.');
            return;
        }
        if (mode === 'seed' && !title) {
            alert('Seeds require a title.');
            return;
        }

        const payload = {
            space_id: spaceId,
            author: author,
            title: title,
            body: body
        };

        if (mode === 'branch') {
            const parentId = parentSelect.value;

            if (!parentId) {
                alert('Please click a node in the graph to select a parent.');
                return;
            }

            payload.parent_id = parentId;
        }

        submitBtn.disabled = true;

        if (mode === 'seed') {
            submitBtn.textContent = 'Saving...';
            await saveNode(payload);
        } else {
            submitBtn.textContent = 'Analyzing...';
            document.getElementById('analyzing-overlay').style.display = 'flex';
            await showReviewModal(payload);
            // Overlay is hidden by showReviewModal when classification arrives;
            // ensure it's hidden in case of early return / error too
            document.getElementById('analyzing-overlay').style.display = 'none';
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit contribution';
        }
    });

    // ============================================================
    // Review Modal Handlers
    // ============================================================

    const reviewModal = document.getElementById('review-modal');
    if (reviewModal) {
        function closeModal() {
            reviewModal.style.display = 'none';
        }

        document.getElementById('review-cancel').addEventListener('click', closeModal);
        document.getElementById('review-modal-close').addEventListener('click', closeModal);

        reviewModal.addEventListener('click', (e) => {
            if (e.target === reviewModal) closeModal();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && reviewModal.style.display !== 'none') {
                closeModal();
            }
        });

        // Reclassify when the user picks a different type
        let reclassifyController = null;
        const regenLink = document.getElementById('regen-title-lineage');

        reviewModal.querySelectorAll('input[name="review_branch_type"]').forEach(radio => {
            radio.addEventListener('change', async () => {
                const preview = reviewModal._preview;
                const payload = reviewModal._payload;
                if (!preview || !payload) return;

                // If user switched back to original type, hide regenerate link
                if (radio.value === preview.proposed_type) {
                    if (regenLink) regenLink.style.display = 'none';
                    return;
                }

                // Abort any in-flight reclassify request
                if (reclassifyController) reclassifyController.abort();
                reclassifyController = new AbortController();

                // Show loading state — only reasoning updates, title/lineage stay neutral
                const explanationEl = document.getElementById('review-explanation');
                const confidenceEl = document.getElementById('review-confidence');
                explanationEl.textContent = 'Rethinking...';
                confidenceEl.textContent = '';

                try {
                    const resp = await fetch('/api/node/reclassify', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            parent_id: payload.parent_id,
                            body: payload.body,
                            chosen_type: radio.value,
                            original_type: preview.proposed_type,
                            original_explanation: preview.explanation
                        }),
                        signal: reclassifyController.signal
                    });

                    const data = await resp.json();
                    if (data.explanation) explanationEl.textContent = data.explanation;

                    // Update question checkbox if reclassify returns is_question
                    if (data.is_question !== undefined) {
                        const qCb = document.getElementById('review-is-question');
                        if (qCb) qCb.checked = !!data.is_question;
                    }

                    // Show regenerate link — title/lineage were based on old type
                    if (regenLink) regenLink.style.display = '';
                } catch (err) {
                    if (err.name !== 'AbortError') {
                        console.error('[Reclassify] Error:', err);
                    }
                }
            });
        });

        // Regenerate title & lineage for the overridden type
        if (regenLink) {
            regenLink.addEventListener('click', async (e) => {
                e.preventDefault();
                const payload = reviewModal._payload;
                if (!payload) return;

                const selectedType = reviewModal.querySelector('input[name="review_branch_type"]:checked');
                if (!selectedType) return;

                const qCb = document.getElementById('review-is-question');
                const titleInput = document.getElementById('review-title');
                const lineageInput = document.getElementById('review-lineage');

                // Loading state
                regenLink.classList.add('loading');
                regenLink.textContent = 'Regenerating...';
                titleInput.classList.add('field-loading');
                lineageInput.classList.add('field-loading');

                try {
                    const resp = await fetch('/api/node/regenerate-text', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            parent_id: payload.parent_id,
                            body: payload.body,
                            branch_type: selectedType.value,
                            is_question: qCb ? qCb.checked : false
                        })
                    });

                    const data = await resp.json();
                    if (data.suggested_title) titleInput.value = data.suggested_title;
                    if (data.lineage_desc) lineageInput.value = data.lineage_desc;

                    regenLink.style.display = 'none';
                } catch (err) {
                    console.error('[Regenerate] Error:', err);
                } finally {
                    regenLink.classList.remove('loading');
                    regenLink.textContent = 'Regenerate ↻';
                    titleInput.classList.remove('field-loading');
                    lineageInput.classList.remove('field-loading');
                }
            });
        }

        document.getElementById('review-confirm').addEventListener('click', async () => {
            const payload = reviewModal._payload;
            const preview = reviewModal._preview;

            const selectedType = reviewModal.querySelector('input[name="review_branch_type"]:checked');
            if (!selectedType) {
                alert('Please select a branch type.');
                return;
            }

            payload.title = document.getElementById('review-title').value.trim();
            payload.branch_type = selectedType.value;
            payload.lineage_desc = document.getElementById('review-lineage').value.trim();
            payload.llm_proposed_type = preview.proposed_type;
            payload.llm_explanation = preview.explanation;

            const questionCheckbox = document.getElementById('review-is-question');
            payload.is_question = questionCheckbox ? questionCheckbox.checked : false;

            closeModal();
            submitBtn.disabled = true;
            submitBtn.textContent = 'Saving...';

            await saveNode(payload);
        });
    }

    // ============================================================
    // Allow clicking graph nodes to pre-fill parent selector
    // ============================================================

    window.selectParentNode = function (nodeId, authorName, titleOrBody) {
        // Switch to branch mode
        const branchRadio = form.querySelector('input[name="contribution_type"][value="branch"]');
        if (branchRadio) {
            branchRadio.checked = true;
        }
        // Set parent
        parentSelect.value = nodeId;

        // Show parent indicator
        if (authorName) {
            const label = titleOrBody
                ? `${authorName}: ${titleOrBody}`
                : authorName;
            parentIndicatorName.textContent = label;
        }
        // Update form mode (shows/hides indicator)
        updateFormMode();
    };

})();

// ============================================================
// New Space Modal (index page)
// ============================================================

(function () {
    const newSpaceBtn = document.getElementById('new-space-btn');
    if (!newSpaceBtn) return;

    const modal = document.getElementById('new-space-modal');
    const titleInput = document.getElementById('new-space-title');
    const authorInput = document.getElementById('new-space-author');
    const seedTitleInput = document.getElementById('new-space-seed-title');
    const seedBodyInput = document.getElementById('new-space-seed-body');
    const createBtn = document.getElementById('new-space-create');

    function openModal() {
        titleInput.value = '';
        authorInput.value = '';
        seedTitleInput.value = '';
        seedBodyInput.value = '';
        modal.style.display = 'flex';
        titleInput.focus();
    }

    function closeModal() {
        modal.style.display = 'none';
    }

    newSpaceBtn.addEventListener('click', openModal);
    document.getElementById('new-space-cancel').addEventListener('click', closeModal);
    document.getElementById('new-space-modal-close').addEventListener('click', closeModal);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display !== 'none') {
            closeModal();
        }
    });

    createBtn.addEventListener('click', async () => {
        const title = titleInput.value.trim();
        const author = authorInput.value.trim();
        const seedTitle = seedTitleInput.value.trim();
        const seedBody = seedBodyInput.value.trim();

        if (!title || !author || !seedTitle || !seedBody) {
            alert('All fields are required.');
            return;
        }

        createBtn.disabled = true;
        createBtn.textContent = 'Creating...';

        try {
            const response = await fetch('/api/space', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: title,
                    author: author,
                    seed_title: seedTitle,
                    seed_body: seedBody
                })
            });

            const data = await response.json();

            if (response.ok) {
                window.location.href = '/space/' + data.id;
            } else {
                alert('Error: ' + (data.error || 'Unknown error'));
                createBtn.disabled = false;
                createBtn.textContent = 'Create & Plant Seed';
            }
        } catch (err) {
            console.error('[NewSpace] Error:', err);
            alert('Network error. Please try again.');
            createBtn.disabled = false;
            createBtn.textContent = 'Create & Plant Seed';
        }
    });
})();

// ============================================================
// Synthesis Suggestions (space page)
// ============================================================

(function () {
    const btn = document.getElementById('suggest-synthesis-btn');
    if (!btn) return;

    const modal = document.getElementById('synthesis-modal');
    const modalBody = document.getElementById('synthesis-modal-body');
    const overlay = document.getElementById('analyzing-overlay');
    const overlayText = document.getElementById('analyzing-text');
    const reasoningEl = document.getElementById('reasoning-stream');
    const reasoningContent = document.getElementById('reasoning-stream-content');
    const form = document.getElementById('contribution-form');
    const spaceId = form ? form.dataset.spaceId : null;

    if (!modal || !spaceId) return;

    function closeModal() {
        modal.style.display = 'none';
    }

    document.getElementById('synthesis-modal-close').addEventListener('click', closeModal);
    document.getElementById('synthesis-modal-cancel').addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display !== 'none') closeModal();
    });

    function renderSuggestions(suggestions) {
        modalBody.innerHTML = '';
        suggestions.forEach((s, i) => {
            const card = document.createElement('div');
            card.className = 'synthesis-card';

            // Refs pills
            const refNodes = (s.referenced_nodes || []).map(
                r => `<span class="synthesis-ref-node">${r.author}: ${r.title}</span>`
            ).join('');

            const parentPill = `<span class="synthesis-ref-node">${s.parent_author}: ${s.parent_title}</span>`;

            card.innerHTML = `
                <div class="synthesis-card-header">
                    <span class="synthesis-card-number">${i + 1}</span>
                    <span class="synthesis-card-title">${s.title}</span>
                </div>
                <div class="synthesis-card-refs">
                    <span class="synthesis-card-refs-label">Connects</span>
                    ${parentPill}${refNodes}
                </div>
                <div class="synthesis-card-body">${s.body}</div>
                <div class="synthesis-card-reasoning">${s.reasoning}</div>
                <button class="btn btn-synthesis" data-index="${i}">Use this suggestion</button>
            `;

            const useBtn = card.querySelector('button');
            useBtn.addEventListener('click', () => {
                applySuggestion(s, useBtn);
            });

            modalBody.appendChild(card);
        });
    }

    async function applySuggestion(s, clickedBtn) {
        // Disable button while saving
        clickedBtn.disabled = true;
        clickedBtn.textContent = 'Saving...';

        try {
            const resp = await fetch('/api/node', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    space_id: spaceId,
                    author: 'Groven AI',
                    title: s.title,
                    body: s.body,
                    parent_id: s.parent_id,
                    branch_type: 'synthesis',
                    llm_proposed_type: 'synthesis',
                    llm_explanation: s.reasoning,
                    lineage_desc: s.reasoning,
                    proposal_summary: s.proposal_summary
                })
            });

            if (resp.ok) {
                closeModal();
                window.location.reload();
            } else {
                const err = await resp.json();
                alert(err.error || 'Failed to create synthesis node.');
                clickedBtn.disabled = false;
                clickedBtn.textContent = 'Use this suggestion';
            }
        } catch (err) {
            console.error('[Synthesis] Save error:', err);
            alert('Network error. Please try again.');
            clickedBtn.disabled = false;
            clickedBtn.textContent = 'Use this suggestion';
        }
    }

    btn.addEventListener('click', async () => {
        btn.disabled = true;
        btn.textContent = 'Thinking...';

        // Show analyzing overlay with reasoning stream
        const origText = overlayText ? overlayText.textContent : '';
        if (overlayText) overlayText.textContent = 'Looking for synthesis opportunities...';
        if (overlay) overlay.style.display = 'flex';
        if (reasoningEl) { reasoningEl.style.display = 'block'; reasoningContent.textContent = ''; }

        try {
            const resp = await fetch(`/api/space/${spaceId}/suggest-synthesis`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!resp.ok) {
                const err = await resp.json();
                alert(err.error || 'Could not generate suggestions.');
                return;
            }

            const reader = resp.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            let suggestions = null;
            let hadError = false;

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });

                // Parse SSE events from buffer
                while (buffer.includes('\n\n')) {
                    const idx = buffer.indexOf('\n\n');
                    const block = buffer.slice(0, idx);
                    buffer = buffer.slice(idx + 2);

                    let eventType = 'message', data = '';
                    for (const line of block.split('\n')) {
                        if (line.startsWith('event: ')) eventType = line.slice(7);
                        if (line.startsWith('data: ')) data = line.slice(6);
                    }
                    if (!data) continue;

                    if (eventType === 'reasoning') {
                        const text = JSON.parse(data);
                        if (reasoningContent) {
                            reasoningContent.textContent += text;
                            reasoningContent.scrollTop = reasoningContent.scrollHeight;
                        }
                    } else if (eventType === 'status') {
                        if (overlayText) overlayText.textContent = JSON.parse(data);
                    } else if (eventType === 'suggestions') {
                        suggestions = JSON.parse(data);
                    } else if (eventType === 'error') {
                        const err = JSON.parse(data);
                        alert(err.error || 'Could not generate suggestions.');
                        hadError = true;
                    }
                }
            }

            if (!hadError && suggestions && suggestions.suggestions && suggestions.suggestions.length > 0) {
                renderSuggestions(suggestions.suggestions);
                modal.style.display = 'flex';
            } else if (!hadError) {
                alert('No synthesis opportunities found at this time.');
            }

        } catch (err) {
            console.error('[Synthesis] Error:', err);
            alert('Network error. Please try again.');
        } finally {
            btn.disabled = false;
            btn.textContent = 'Suggest synthesis';
            if (overlay) overlay.style.display = 'none';
            if (overlayText) overlayText.textContent = origText;
            if (reasoningEl) reasoningEl.style.display = 'none';
        }
    });
})();

// ============================================================
// Declare Ready Modal (space page — open status)
// ============================================================

(function () {
    const btn = document.getElementById('declare-ready-btn');
    if (!btn) return;

    const modal = document.getElementById('ready-modal');
    const overlay = document.getElementById('analyzing-overlay');
    const overlayText = document.getElementById('analyzing-text');
    const summaryStream = document.getElementById('summary-stream');
    const summaryContent = document.getElementById('summary-stream-content');
    const graphContainer = document.getElementById('forest-graph');
    const spaceId = graphContainer ? graphContainer.dataset.spaceId : null;

    if (!modal || !spaceId) return;

    function openModal() {
        document.getElementById('ready-author').value = '';
        modal.style.display = 'flex';
        document.getElementById('ready-author').focus();
    }

    function closeModal() {
        modal.style.display = 'none';
    }

    btn.addEventListener('click', openModal);
    document.getElementById('ready-cancel').addEventListener('click', closeModal);
    document.getElementById('ready-modal-close').addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

    document.getElementById('ready-confirm').addEventListener('click', async () => {
        const author = document.getElementById('ready-author').value.trim();
        if (!author) {
            alert('Please enter your name.');
            return;
        }

        closeModal();

        // Show overlay with summary stream
        if (overlayText) overlayText.textContent = 'Generating discussion summary...';
        if (overlay) overlay.style.display = 'flex';
        if (summaryStream) { summaryStream.style.display = 'block'; summaryContent.textContent = ''; }

        try {
            const resp = await fetch(`/api/space/${spaceId}/transition`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ target_status: 'ready', author: author })
            });

            if (!resp.ok) {
                const err = await resp.json();
                alert(err.error || 'Failed to transition space.');
                if (overlay) overlay.style.display = 'none';
                return;
            }

            const reader = resp.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });

                while (buffer.includes('\n\n')) {
                    const idx = buffer.indexOf('\n\n');
                    const block = buffer.slice(0, idx);
                    buffer = buffer.slice(idx + 2);

                    let data = '';
                    for (const line of block.split('\n')) {
                        if (line.startsWith('data: ')) data = line.slice(6);
                    }
                    if (!data) continue;

                    const parsed = JSON.parse(data);
                    if (parsed.event === 'chunk') {
                        if (summaryContent) {
                            summaryContent.textContent += parsed.text;
                            summaryContent.scrollTop = summaryContent.scrollHeight;
                        }
                    } else if (parsed.event === 'done') {
                        // Summary complete — reload to show Ready state
                        window.location.reload();
                        return;
                    } else if (parsed.event === 'error') {
                        alert(parsed.message || 'Error generating summary.');
                    }
                }
            }

            // Fallback reload
            window.location.reload();
        } catch (err) {
            console.error('[Ready] Error:', err);
            alert('Network error. Please try again.');
            if (overlay) overlay.style.display = 'none';
        }
    });
})();

// ============================================================
// Record Decision Modal (space page — ready status)
// ============================================================

(function () {
    const btn = document.getElementById('record-decision-btn');
    if (!btn) return;

    const modal = document.getElementById('decision-modal');
    const graphContainer = document.getElementById('forest-graph');
    const spaceId = graphContainer ? graphContainer.dataset.spaceId : null;

    if (!modal || !spaceId) return;

    const minorityWarning = document.getElementById('minority-warning');
    const justificationHint = document.getElementById('decision-justification-hint');

    function updateMinorityWarning() {
        const selected = modal.querySelector('input[name="selected_proposal"]:checked');
        if (!selected) {
            if (minorityWarning) minorityWarning.style.display = 'none';
            return;
        }
        const isLeader = selected.dataset.isLeader === 'true';
        if (minorityWarning) {
            minorityWarning.style.display = isLeader ? 'none' : 'block';
        }
        if (justificationHint) {
            justificationHint.textContent = isLeader
                ? 'Why was this proposal chosen? Note any key factors.'
                : 'This is not the leading proposal — explain why it should be chosen over the majority preference.';
        }
    }

    // Listen for proposal selection changes
    modal.querySelectorAll('input[name="selected_proposal"]').forEach(r => {
        r.addEventListener('change', updateMinorityWarning);
    });

    function openModal() {
        document.getElementById('decision-author').value = '';
        document.getElementById('decision-justification').value = '';
        // Re-select leader (first radio, which is pre-checked in template)
        const radios = modal.querySelectorAll('input[name="selected_proposal"]');
        radios.forEach((r, i) => { r.checked = (i === 0); });
        updateMinorityWarning();
        modal.style.display = 'flex';
    }

    function closeModal() {
        modal.style.display = 'none';
    }

    btn.addEventListener('click', openModal);
    document.getElementById('decision-cancel').addEventListener('click', closeModal);
    document.getElementById('decision-modal-close').addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

    document.getElementById('decision-confirm').addEventListener('click', async () => {
        const selected = modal.querySelector('input[name="selected_proposal"]:checked');
        const author = document.getElementById('decision-author').value.trim();
        const justification = document.getElementById('decision-justification').value.trim();

        if (!selected) {
            alert('Please select a synthesis proposal.');
            return;
        }
        if (!author) {
            alert('Please enter your name.');
            return;
        }
        if (!justification) {
            alert('Please provide a justification for this decision.');
            return;
        }

        const confirmBtn = document.getElementById('decision-confirm');
        confirmBtn.disabled = true;
        confirmBtn.textContent = 'Recording...';

        try {
            const resp = await fetch(`/api/space/${spaceId}/decide`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    selected_node_id: selected.value,
                    author: author,
                    justification: justification
                })
            });

            if (resp.ok) {
                window.location.reload();
            } else {
                const err = await resp.json();
                alert(err.error || 'Failed to record decision.');
                confirmBtn.disabled = false;
                confirmBtn.textContent = 'Record Decision';
            }
        } catch (err) {
            console.error('[Decision] Error:', err);
            alert('Network error. Please try again.');
            confirmBtn.disabled = false;
            confirmBtn.textContent = 'Record Decision';
        }
    });
})();

// ============================================================
// Decision Banner — render vote breakdown from decision_meta
// ============================================================

(function () {
    const el = document.getElementById('decision-banner-votes');
    if (!el) return;

    try {
        const meta = JSON.parse(el.dataset.meta);
        const s = meta.vote_breakdown.support || 0;
        const o = meta.vote_breakdown.oppose || 0;

        let html = `<div class="decision-vote-tally">${s} Support &middot; ${o} Oppose</div>`;

        if (meta.minority_positions && meta.minority_positions.length > 0) {
            html += '<div class="decision-minority"><span class="decision-minority-label">Minority positions:</span>';
            meta.minority_positions.forEach(m => {
                html += `<div class="decision-minority-item"><strong>${m.author}</strong>: ${m.justification}</div>`;
            });
            html += '</div>';
        }

        el.innerHTML = html;
    } catch (e) {
        // decision_meta not parseable — skip
    }
})();

// ============================================================
// Discussion summary — render markdown-like content
// ============================================================

(function () {
    const el = document.getElementById('discussion-summary-content');
    if (!el) return;

    // Simple markdown: ## headers, **bold**, bullet lists
    let text = el.textContent;
    text = text.replace(/^## (.+)$/gm, '<h4>$1</h4>');
    text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/^- (.+)$/gm, '<li>$1</li>');
    text = text.replace(/(<li>.*<\/li>\n?)+/gs, '<ul>$&</ul>');
    text = text.replace(/\n\n/g, '<br><br>');
    el.innerHTML = text;
})();

// ============================================================
// Help Modal
// ============================================================

(function () {
    const btn = document.getElementById('help-btn');
    const modal = document.getElementById('help-modal');
    if (!btn || !modal) return;

    function openHelp() { modal.style.display = 'flex'; }
    function closeHelp() { modal.style.display = 'none'; }

    btn.addEventListener('click', openHelp);
    document.getElementById('help-modal-close').addEventListener('click', closeHelp);
    document.getElementById('help-modal-ok').addEventListener('click', closeHelp);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeHelp(); });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display !== 'none') closeHelp();
    });
})();
