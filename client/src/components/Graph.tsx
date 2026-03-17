import { useRef, useEffect, useCallback } from 'react';
import * as d3 from 'd3';

const TYPE_COLORS: Record<string, string> = {
  question: '#e8a838',
  claim: '#5b8bd4',
  experience: '#9b6bb5',
  evidence: '#4aa87a',
  proposal: '#d45b5b',
  amendment: '#d4855b',
  summary: '#5ba8a8',
  request: '#8b7355',
  offer: '#6bb55b',
};

const RELATION_COLORS: Record<string, string> = {
  builds_on: '#7bc4a5',
  questions: '#e8a838',
  contradicts: '#d45b5b',
  reframes: '#9b6bb5',
  supports: '#4aa87a',
  evidences: '#5b8bd4',
  amends: '#d4855b',
  answers: '#5ba8a8',
  spins_off: '#8b7355',
  implements: '#6bb55b',
};

const DASH_PATTERNS: Record<string, string> = {
  contradicts: '6,3',
  reframes: '4,4',
  questions: '2,4',
};

interface GraphProps {
  cards: any[];
  links: any[];
  onSelectCard: (card: any) => void;
  selectedCardId?: string | null;
}

export default function Graph({ cards, links, onSelectCard, selectedCardId }: GraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const simRef = useRef<d3.Simulation<any, any> | null>(null);

  const render = useCallback(() => {
    if (!svgRef.current || cards.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = svgRef.current.clientWidth || 800;
    const height = svgRef.current.clientHeight || 600;

    // Zoom container
    const g = svg.append('g');
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 4])
      .on('zoom', (event) => g.attr('transform', event.transform));
    svg.call(zoom);

    // Build node/link data
    const nodes = cards.map(c => ({ ...c }));
    const nodeMap = new Map(nodes.map(n => [n.id, n]));

    // Group links between same pair to offset them
    const linkGroups = new Map<string, any[]>();
    const edgeData = links.filter(l => nodeMap.has(l.source_card_id) && nodeMap.has(l.target_card_id)).map(l => {
      const key = [l.source_card_id, l.target_card_id].sort().join('-');
      if (!linkGroups.has(key)) linkGroups.set(key, []);
      const group = linkGroups.get(key)!;
      const edge = {
        source: l.source_card_id,
        target: l.target_card_id,
        relation_type: l.relation_type,
        groupIndex: group.length,
        groupSize: 0,
      };
      group.push(edge);
      return edge;
    });
    // Set group sizes
    for (const group of linkGroups.values()) {
      for (const e of group) e.groupSize = group.length;
    }

    // Arrow markers
    const defs = svg.append('defs');
    Object.entries(RELATION_COLORS).forEach(([rel, color]) => {
      defs.append('marker')
        .attr('id', `arrow-${rel}`)
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 26)
        .attr('refY', 0)
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M0,-5L10,0L0,5')
        .attr('fill', color);
    });

    // Simulation
    const sim = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(edgeData).id((d: any) => d.id).distance(120))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide(35));
    simRef.current = sim;

    // Links
    const link = g.append('g')
      .selectAll('path')
      .data(edgeData)
      .join('path')
      .attr('fill', 'none')
      .attr('stroke', (d: any) => RELATION_COLORS[d.relation_type] || '#ccc')
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', (d: any) => DASH_PATTERNS[d.relation_type] || 'none')
      .attr('marker-end', (d: any) => `url(#arrow-${d.relation_type})`)
      .attr('opacity', 0.6);

    // Link labels
    const linkLabel = g.append('g')
      .selectAll('text')
      .data(edgeData)
      .join('text')
      .attr('font-size', 9)
      .attr('fill', '#999')
      .attr('text-anchor', 'middle')
      .text((d: any) => d.relation_type.replace('_', ' '));

    // Node groups
    const node = g.append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .attr('cursor', 'pointer')
      .on('click', (_event: any, d: any) => onSelectCard(d))
      .call(d3.drag<any, any>()
        .on('start', (event, d) => {
          if (!event.active) sim.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event, d) => {
          if (!event.active) sim.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        })
      );

    // Node circle
    node.append('circle')
      .attr('r', (d: any) => d.card_type === 'proposal' || d.card_type === 'summary' ? 22 : 18)
      .attr('fill', (d: any) => TYPE_COLORS[d.card_type] || '#999')
      .attr('stroke', (d: any) => d.id === selectedCardId ? '#2a2520' : 'white')
      .attr('stroke-width', (d: any) => d.id === selectedCardId ? 3 : 2)
      .attr('opacity', 0.9);

    // Question marker
    node.filter((d: any) => d.is_question)
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', 1)
      .attr('font-size', 16)
      .attr('font-weight', 'bold')
      .attr('fill', 'white')
      .attr('pointer-events', 'none')
      .text('?');

    // Contested marker
    node.filter((d: any) => {
      if (!d.readings || d.readings.length < 2) return false;
      const author = d.readings.find((r: any) => r.reader_type === 'author');
      const ai = d.readings.find((r: any) => r.reader_type === 'ai');
      return author && ai && author.proposed_type !== ai.proposed_type;
    })
      .append('circle')
      .attr('cx', 14)
      .attr('cy', -14)
      .attr('r', 5)
      .attr('fill', '#e8a838')
      .attr('stroke', 'white')
      .attr('stroke-width', 1.5);

    // Vote arc gauge for proposals
    node.filter((d: any) => (d.card_type === 'proposal' || d.card_type === 'summary') && (parseInt(d.vote_support) > 0 || parseInt(d.vote_oppose) > 0))
      .each(function(d: any) {
        const el = d3.select(this);
        const total = parseInt(d.vote_support || 0) + parseInt(d.vote_oppose || 0);
        if (total === 0) return;
        const supportPct = parseInt(d.vote_support || 0) / total;
        const r = 25;
        const arc = d3.arc<any>().innerRadius(r - 2).outerRadius(r + 2);

        // Support arc
        el.append('path')
          .attr('d', arc({ startAngle: -Math.PI / 2, endAngle: -Math.PI / 2 + Math.PI * supportPct }))
          .attr('fill', 'var(--color-support)')
          .attr('opacity', 0.8);

        // Oppose arc
        el.append('path')
          .attr('d', arc({ startAngle: -Math.PI / 2 + Math.PI * supportPct, endAngle: Math.PI / 2 }))
          .attr('fill', 'var(--color-oppose)')
          .attr('opacity', 0.8);
      });

    // Title label
    node.append('text')
      .attr('dy', (d: any) => (d.card_type === 'proposal' || d.card_type === 'summary' ? 38 : 32))
      .attr('text-anchor', 'middle')
      .attr('font-size', 10)
      .attr('font-weight', 500)
      .attr('fill', 'var(--color-text)')
      .attr('pointer-events', 'none')
      .text((d: any) => {
        const t = d.title || '';
        return t.length > 30 ? t.substring(0, 28) + '…' : t;
      });

    // Tooltip on hover
    node.append('title')
      .text((d: any) => `${d.card_type}${d.is_question ? ' (?)' : ''}: ${d.title}\nby ${d.author_name}`);

    // Tick
    sim.on('tick', () => {
      link.attr('d', (d: any) => {
        const dx = d.target.x - d.source.x;
        const dy = d.target.y - d.source.y;
        if (d.groupSize <= 1) {
          return `M${d.source.x},${d.source.y}L${d.target.x},${d.target.y}`;
        }
        // Curve for multi-links
        const offset = (d.groupIndex - (d.groupSize - 1) / 2) * 25;
        const mx = (d.source.x + d.target.x) / 2 - dy * offset / Math.sqrt(dx * dx + dy * dy + 1);
        const my = (d.source.y + d.target.y) / 2 + dx * offset / Math.sqrt(dx * dx + dy * dy + 1);
        return `M${d.source.x},${d.source.y}Q${mx},${my},${d.target.x},${d.target.y}`;
      });

      linkLabel
        .attr('x', (d: any) => (d.source.x + d.target.x) / 2)
        .attr('y', (d: any) => (d.source.y + d.target.y) / 2 - 6);

      node.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });

    // Center the view after layout settles
    sim.on('end', () => {
      const bounds = g.node()?.getBBox();
      if (bounds) {
        const scale = Math.min(
          width / (bounds.width + 100),
          height / (bounds.height + 100),
          1.5
        );
        const tx = width / 2 - (bounds.x + bounds.width / 2) * scale;
        const ty = height / 2 - (bounds.y + bounds.height / 2) * scale;
        svg.transition().duration(500).call(
          zoom.transform,
          d3.zoomIdentity.translate(tx, ty).scale(scale)
        );
      }
    });

  }, [cards, links, onSelectCard, selectedCardId]);

  useEffect(() => {
    render();
    return () => {
      simRef.current?.stop();
    };
  }, [render]);

  return (
    <svg ref={svgRef} className="graph-svg" />
  );
}
