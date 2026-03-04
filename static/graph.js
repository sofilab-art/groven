/**
 * Groven — Forest Graph Visualization
 * D3.js v7 force-directed graph
 */

(function () {
    const container = document.getElementById('forest-graph');
    if (!container) return;

    const spaceId = container.dataset.spaceId;
    if (!spaceId) return;

    // Color map for branch types
    const typeColors = {
        seed: '#1B4332',
        clarification: '#3B82F6',
        extension: '#40916C',
        reframing: '#D4A373',
        contradiction: '#EF4444',
        synthesis: '#8B5CF6'
    };

    const width = container.clientWidth || 800;
    // Fixed simulation height — keeps nodes stable in the upper part of the panel
    const height = 600;

    // Create SVG — anchored to top via preserveAspectRatio
    const svg = d3.select(container)
        .append('svg')
        .attr('viewBox', [0, 0, width, height])
        .attr('preserveAspectRatio', 'xMidYMin meet');

    // Arrow marker
    svg.append('defs').append('marker')
        .attr('id', 'arrowhead')
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 20)
        .attr('refY', 0)
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M0,-5L10,0L0,5')
        .attr('fill', '#2D6A4F')
        .attr('opacity', 0.5);

    // Tooltip — appended to body so it's never clipped by overflow:hidden
    const tooltip = d3.select('body')
        .append('div')
        .attr('class', 'graph-tooltip')
        .style('display', 'none');

    // Container group for zoom
    const g = svg.append('g');

    // Zoom behavior
    const zoom = d3.zoom()
        .scaleExtent([0.3, 3])
        .on('zoom', (event) => {
            g.attr('transform', event.transform);
        });
    svg.call(zoom);

    // Fetch and render
    fetch(`/api/tree/${spaceId}`)
        .then(r => r.json())
        .then(nodes => {
            if (!nodes || nodes.length === 0) return;

            // Build links from parent_id
            const links = nodes
                .filter(n => n.parent_id)
                .map(n => ({
                    source: n.parent_id,
                    target: n.id
                }));

            // Create simulation
            const simulation = d3.forceSimulation(nodes)
                .force('link', d3.forceLink(links)
                    .id(d => d.id)
                    .distance(120))
                .force('charge', d3.forceManyBody().strength(-300))
                .force('center', d3.forceCenter(width / 2, height / 2))
                .force('collision', d3.forceCollide().radius(d =>
                    d.node_type === 'seed' ? 28 : 22));

            // Draw links
            const link = g.append('g')
                .selectAll('line')
                .data(links)
                .join('line')
                .attr('stroke', '#2D6A4F')
                .attr('stroke-opacity', 0.4)
                .attr('stroke-width', 1.5)
                .attr('marker-end', 'url(#arrowhead)');

            // Draw node groups
            const nodeGroup = g.append('g')
                .selectAll('g')
                .data(nodes)
                .join('g')
                .style('cursor', 'pointer')
                .call(d3.drag()
                    .on('start', dragstarted)
                    .on('drag', dragged)
                    .on('end', dragended));

            // Node circles
            nodeGroup.append('circle')
                .attr('r', d => d.node_type === 'seed' ? 18 : 12)
                .attr('fill', d => {
                    if (d.node_type === 'seed') return typeColors.seed;
                    return typeColors[d.branch_type] || '#999';
                })
                .attr('stroke', d => d.contested ? '#D4A373' : 'rgba(0,0,0,0.1)')
                .attr('stroke-width', d => d.contested ? 2.5 : 1)
                .attr('stroke-dasharray', d => d.contested ? '4,3' : 'none');

            // Title labels (wrap to 2 lines)
            nodeGroup.each(function (d) {
                const label = d.title || d.author;
                const maxChars = 22;
                const textEl = d3.select(this).append('text')
                    .attr('text-anchor', 'middle')
                    .attr('font-size', '10px')
                    .attr('font-family', 'Outfit, sans-serif')
                    .attr('fill', '#374151')
                    .attr('font-weight', d.title ? '500' : '400');

                const baseY = d.node_type === 'seed' ? 30 : 24;

                if (label.length <= maxChars) {
                    textEl.append('tspan')
                        .attr('x', 0).attr('dy', baseY)
                        .text(label);
                } else {
                    // Split at last space within maxChars
                    let split = label.lastIndexOf(' ', maxChars);
                    if (split <= 0) split = maxChars;
                    const line1 = label.substring(0, split);
                    let line2 = label.substring(split).trimStart();
                    if (line2.length > maxChars) line2 = line2.substring(0, maxChars - 1) + '\u2026';

                    textEl.append('tspan')
                        .attr('x', 0).attr('dy', baseY)
                        .text(line1);
                    textEl.append('tspan')
                        .attr('x', 0).attr('dy', '1.2em')
                        .text(line2);
                }
            });

            // Hover events
            nodeGroup
                .on('mouseenter', (event, d) => {
                    const typeLabel = d.branch_type || 'seed';
                    const titleHtml = d.title
                        ? `<div class="tt-title">${d.title}</div>`
                        : '';

                    tooltip
                        .style('display', 'block')
                        .html(`
                            <span class="tt-author">${d.author}</span>
                            <span class="tt-type type-badge type-${typeLabel}">${typeLabel}</span>
                            ${titleHtml}
                            <div class="tt-body">${d.body}</div>
                        `);
                })
                .on('mousemove', (event) => {
                    tooltip
                        .style('left', (event.pageX + 12) + 'px')
                        .style('top', (event.pageY - 10) + 'px');
                })
                .on('mouseleave', () => {
                    tooltip.style('display', 'none');
                });

            // Click: show detail + set as parent
            nodeGroup.on('click', (event, d) => {
                event.stopPropagation();
                showNodeDetail(d);
                // Automatically set clicked node as the parent for branching
                if (window.selectParentNode) {
                    window.selectParentNode(d.id, d.author, d.title || d.body.substring(0, 50));
                }
            });

            // Simulation tick — clamp nodes inside the visible area
            const pad = 30;
            simulation.on('tick', () => {
                nodes.forEach(d => {
                    d.x = Math.max(pad, Math.min(width - pad, d.x));
                    d.y = Math.max(pad, Math.min(height - pad, d.y));
                });

                link
                    .attr('x1', d => d.source.x)
                    .attr('y1', d => d.source.y)
                    .attr('x2', d => d.target.x)
                    .attr('y2', d => d.target.y);

                nodeGroup.attr('transform', d => `translate(${d.x},${d.y})`);
            });

            // Drag functions
            function dragstarted(event, d) {
                if (!event.active) simulation.alphaTarget(0.3).restart();
                d.fx = d.x;
                d.fy = d.y;
            }

            function dragged(event, d) {
                d.fx = event.x;
                d.fy = event.y;
            }

            function dragended(event, d) {
                if (!event.active) simulation.alphaTarget(0);
                d.fx = null;
                d.fy = null;
            }

            // Store simulation globally for updates
            window._groven_simulation = simulation;
            window._groven_nodes = nodes;
            window._groven_links = links;
        })
        .catch(err => {
            console.error('[Graph] Failed to load tree:', err);
            container.innerHTML = '<p style="padding:2rem;color:#999;">Failed to load graph.</p>';
        });

    // Show node detail in the right panel
    function showNodeDetail(node) {
        const panel = document.getElementById('node-detail');
        const content = document.getElementById('node-detail-content');
        if (!panel || !content) return;

        const typeLabel = node.branch_type || 'seed';
        const contested = node.contested
            ? '<span class="contested-badge">Contested</span>'
            : '';

        let llmHtml = '';
        if (node.llm_proposed_type) {
            if (node.contested) {
                llmHtml = `
                    <details class="llm-info-box llm-info-contested">
                        <summary class="llm-label">LLM Analysis</summary>
                        <p class="contested-info">
                            LLM proposed <span class="type-badge type-${node.llm_proposed_type}">${node.llm_proposed_type}</span>
                            — author chose <span class="type-badge type-${node.branch_type}">${node.branch_type}</span>
                        </p>
                        ${node.llm_explanation ? `<p class="llm-explanation">${node.llm_explanation}</p>` : ''}
                    </details>`;
            } else {
                llmHtml = `
                    <details class="llm-info-box">
                        <summary class="llm-label">LLM Analysis</summary>
                        <p>Type: <span class="type-badge type-${node.llm_proposed_type}">${node.llm_proposed_type}</span> (confirmed)</p>
                        ${node.llm_explanation ? `<p class="llm-explanation">${node.llm_explanation}</p>` : ''}
                    </details>`;
            }
        }

        content.innerHTML = `
            <div class="node-header-badges">
                <span class="type-badge type-${typeLabel}">${typeLabel}</span>
                ${contested}
            </div>
            <h3 style="margin:0.5rem 0;color:#1B4332;">${node.title || 'Contribution by ' + node.author}</h3>
            <div class="node-meta" style="margin-bottom:0.75rem;">
                <span>by <strong>${node.author}</strong></span>
            </div>
            <div class="node-body" style="font-size:0.95rem;line-height:1.65;">${node.body}</div>
            ${node.lineage_desc ? `
                <details class="lineage-box" style="margin-top:0.75rem;">
                    <summary class="lineage-label">Lineage</summary>
                    <em>${node.lineage_desc}</em>
                </details>` : ''}
            ${llmHtml}
            <div style="margin-top:0.75rem;">
                <a href="/node/${node.id}" class="btn btn-secondary" style="text-align:center;display:block;">
                    View details &rarr;
                </a>
            </div>
        `;

        panel.style.display = 'block';
    }

    // Close detail
    const closeBtn = document.getElementById('close-detail');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            document.getElementById('node-detail').style.display = 'none';
        });
    }

    // Make reload function available
    window.reloadGraph = function () {
        // Simple: reload the page. Better: refetch and update D3.
        location.reload();
    };
})();
