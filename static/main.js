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

    function updateFormMode() {
        const mode = form.querySelector('input[name="contribution_type"]:checked').value;
        const isBranch = mode === 'branch';

        // Show parent indicator only if in branch mode AND a parent is selected
        parentIndicator.style.display = (isBranch && parentSelect.value) ? 'flex' : 'none';

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

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const spaceId = form.dataset.spaceId;
        const mode = form.querySelector('input[name="contribution_type"]:checked').value;
        const author = document.getElementById('author-input').value.trim();
        const title = document.getElementById('title-input').value.trim();
        const body = document.getElementById('body-input').value.trim();

        if (!author || !title || !body) {
            alert('Author, title, and contribution are required fields.');
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
