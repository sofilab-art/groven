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

            const preview = await response.json();

            if (!response.ok) {
                alert('Error: ' + (preview.error || 'Unknown error'));
                return;
            }

            const modal = document.getElementById('review-modal');

            // Populate modal fields
            document.getElementById('review-title').value = preview.suggested_title || '';
            document.getElementById('review-lineage').value = preview.lineage_desc || '';
            document.getElementById('review-explanation').textContent =
                preview.explanation || 'LLM unavailable \u2014 please classify manually.';
            document.getElementById('review-confidence').textContent =
                preview.confidence != null ? 'Confidence: ' + Math.round(preview.confidence * 100) + '%' : '';

            // Pre-select proposed type
            const proposedType = preview.proposed_type || '';
            const radios = modal.querySelectorAll('input[name="review_branch_type"]');
            radios.forEach(r => { r.checked = (r.value === proposedType); });

            // Store data for confirm handler
            modal._payload = payload;
            modal._preview = preview;

            modal.style.display = 'flex';

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
        reviewModal.querySelectorAll('input[name="review_branch_type"]').forEach(radio => {
            radio.addEventListener('change', async () => {
                const preview = reviewModal._preview;
                const payload = reviewModal._payload;
                if (!preview || !payload) return;

                // Skip if user picked the same type as LLM proposed
                if (radio.value === preview.proposed_type) return;

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
                } catch (err) {
                    if (err.name !== 'AbortError') {
                        console.error('[Reclassify] Error:', err);
                    }
                }
            });
        });

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
