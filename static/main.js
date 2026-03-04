/**
 * Groven — Main UI Logic
 * Form toggle, LLM proposal, form submission
 */

(function () {
    // ============================================================
    // Form Toggle: Seed vs Branch
    // ============================================================

    const form = document.getElementById('contribution-form');
    if (!form) return;

    const toggleRadios = form.querySelectorAll('input[name="contribution_type"]');
    const branchFields = document.getElementById('branch-fields');
    const lineageField = document.getElementById('lineage-field');
    const llmSection = document.getElementById('llm-section');
    const parentSelect = document.getElementById('parent-select');
    const lineageInput = document.getElementById('lineage-input');

    function updateFormMode() {
        const mode = form.querySelector('input[name="contribution_type"]:checked').value;
        const isBranch = mode === 'branch';

        branchFields.style.display = isBranch ? 'block' : 'none';
        lineageField.style.display = isBranch ? 'block' : 'none';
        llmSection.style.display = isBranch ? 'block' : 'none';

        if (!isBranch) {
            // Reset branch-specific fields
            parentSelect.value = '';
            lineageInput.value = '';
            document.getElementById('llm-result').style.display = 'none';
            document.getElementById('llm-proposed-type-hidden').value = '';
            document.getElementById('llm-explanation-hidden').value = '';
            // Uncheck all type radios
            form.querySelectorAll('input[name="branch_type"]').forEach(r => r.checked = false);
        }
    }

    toggleRadios.forEach(radio => {
        radio.addEventListener('change', updateFormMode);
    });

    // ============================================================
    // LLM Propose Button
    // ============================================================

    const llmBtn = document.getElementById('llm-propose-btn');
    const llmSpinner = document.getElementById('llm-spinner');
    const llmResult = document.getElementById('llm-result');

    if (llmBtn) {
        llmBtn.addEventListener('click', async () => {
            const parentId = parentSelect.value;
            const body = document.getElementById('body-input').value.trim();
            const lineageDesc = lineageInput.value.trim();

            if (!parentId) {
                alert('Please select a parent node.');
                return;
            }
            if (!body) {
                alert('Please write a contribution.');
                return;
            }

            // Show spinner
            llmBtn.style.display = 'none';
            llmSpinner.style.display = 'flex';
            llmResult.style.display = 'none';

            try {
                const params = new URLSearchParams({
                    parent_id: parentId,
                    body: body,
                    lineage_desc: lineageDesc
                });

                const response = await fetch(`/api/llm-propose?${params}`);
                const data = await response.json();

                llmSpinner.style.display = 'none';

                if (data.proposed_type) {
                    // Show result
                    document.getElementById('llm-proposed-type').textContent = data.proposed_type;
                    document.getElementById('llm-proposed-type').className = `type-badge type-${data.proposed_type}`;
                    document.getElementById('llm-explanation').textContent = data.explanation || '';
                    document.getElementById('llm-confidence').textContent =
                        data.confidence ? `Confidence: ${(data.confidence * 100).toFixed(0)}%` : '';

                    // Store in hidden fields
                    document.getElementById('llm-proposed-type-hidden').value = data.proposed_type;
                    document.getElementById('llm-explanation-hidden').value = data.explanation || '';

                    // Pre-select the proposed type
                    const radio = form.querySelector(`input[name="branch_type"][value="${data.proposed_type}"]`);
                    if (radio) radio.checked = true;

                    llmResult.style.display = 'block';
                } else {
                    // LLM unavailable — show manual selection
                    llmResult.style.display = 'block';
                    document.querySelector('.llm-proposal-card').innerHTML =
                        '<p style="color:#999;font-size:0.85rem;">LLM suggestion unavailable. Please select a type manually.</p>';
                }

                llmBtn.style.display = 'block';
                llmBtn.textContent = 'Suggest again';

            } catch (err) {
                console.error('[LLM] Error:', err);
                llmSpinner.style.display = 'none';
                llmBtn.style.display = 'block';
                llmResult.style.display = 'block';
                document.querySelector('.llm-proposal-card').innerHTML =
                    '<p style="color:#EF4444;font-size:0.85rem;">LLM request failed. Please select a type manually.</p>';
            }
        });
    }

    // ============================================================
    // Form Submission
    // ============================================================

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

        const payload = {
            space_id: spaceId,
            author: author,
            title: title || null,
            body: body
        };

        if (mode === 'branch') {
            const parentId = parentSelect.value;
            const lineageDesc = lineageInput.value.trim();
            const branchType = form.querySelector('input[name="branch_type"]:checked');

            if (!parentId) {
                alert('Please select a parent node.');
                return;
            }
            if (!lineageDesc) {
                alert('Lineage description is required for branches.');
                return;
            }
            if (!branchType) {
                alert('Please select a branch type (or request an LLM suggestion first).');
                return;
            }

            payload.parent_id = parentId;
            payload.lineage_desc = lineageDesc;
            payload.branch_type = branchType.value;
            payload.llm_proposed_type = document.getElementById('llm-proposed-type-hidden').value || null;
            payload.llm_explanation = document.getElementById('llm-explanation-hidden').value || null;
        }

        const submitBtn = document.getElementById('submit-btn');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Saving...';

        try {
            const response = await fetch('/api/node', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (response.ok) {
                // Success — reload to see updated graph and node list
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
    });

    // ============================================================
    // Allow clicking graph nodes to pre-fill parent selector
    // ============================================================

    window.selectParentNode = function (nodeId) {
        // Switch to branch mode
        const branchRadio = form.querySelector('input[name="contribution_type"][value="branch"]');
        if (branchRadio) {
            branchRadio.checked = true;
            updateFormMode();
        }
        // Set parent
        parentSelect.value = nodeId;
    };

})();
