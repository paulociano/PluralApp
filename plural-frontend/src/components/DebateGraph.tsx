/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { ArgumentData, Node, DebateGraphProps, Link } from '@/types';

const colors = { rootArgument:'#173B44', replyArgumentPro:'#5E9893', replyArgumentContra:'#D16C4B', replyArgumentNeutro:'#A7AFB0', connector:'#C8C4BA' };

export default function DebateGraph({ argumentsTree, onNodeClick }: DebateGraphProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!argumentsTree?.length || !svgRef.current) { d3.select(svgRef.current).selectAll('*').remove(); return; }
    const nodes: Node[] = []; const links: Link[] = [];
    const flattenTree = (args: ArgumentData[]) => args?.forEach(arg => {
      nodes.push({ id: arg.id, data: arg });
      if (arg.parentArgumentId) links.push({ source: arg.parentArgumentId, target: arg.id });
      if (arg.replies?.length) flattenTree(arg.replies);
    });
    flattenTree(argumentsTree);

    const width=1100, height=700;
    const svg=d3.select(svgRef.current).attr('viewBox',[-width/2,-height/2,width,height]).attr('preserveAspectRatio','xMidYMid meet');
    svg.selectAll('*').remove();
    const root=svg.append('g');
    svg.call(d3.zoom<SVGSVGElement, unknown>().scaleExtent([0.55,2.5]).on('zoom', e => root.attr('transform', e.transform)));

    const simulation=d3.forceSimulation(nodes)
      .force('link',d3.forceLink(links).id((d:any)=>d.id).distance(82).strength(.55))
      .force('charge',d3.forceManyBody().strength(-150))
      .force('collision',d3.forceCollide().radius((d:any)=>Math.max(24,16+Math.min(Math.abs(d.data.votesCount||0),8)*2)+10))
      .force('center',d3.forceCenter());

    const link=root.append('g').attr('stroke',colors.connector).attr('stroke-width',1.3).attr('stroke-opacity',.75).selectAll('line').data(links).join('line');
    const node=root.append('g').selectAll('circle').data(nodes).join('circle')
      .attr('r',d=>Math.max(14,16+Math.min(Math.abs(d.data.votesCount||0),8)*2))
      .attr('fill',d=>!d.data.parentArgumentId?colors.rootArgument:d.data.type==='CONTRA'?colors.replyArgumentContra:d.data.type==='NEUTRO'?colors.replyArgumentNeutro:colors.replyArgumentPro)
      .attr('stroke','#fff').attr('stroke-width',3).style('cursor','pointer').style('filter','drop-shadow(0 4px 6px rgba(23,59,68,.18))')
      .on('mouseenter',function(){d3.select(this).transition().duration(120).attr('stroke-width',5)})
      .on('mouseleave',function(){d3.select(this).transition().duration(120).attr('stroke-width',3)})
      .on('click',(_,d)=>onNodeClick(d.data));
    node.append('title').text(d=>`${d.data.author?.name || 'Participante'}: ${d.data.content}`);

    simulation.on('tick',()=>{link.attr('x1',d=>d.source.x!).attr('y1',d=>d.source.y!).attr('x2',d=>d.target.x!).attr('y2',d=>d.target.y!);node.attr('cx',d=>d.x!).attr('cy',d=>d.y!)});
    return () => simulation.stop();
  },[argumentsTree,onNodeClick]);

  return <div className="relative h-full w-full"><div className="pointer-events-none absolute bottom-4 left-4 z-10 rounded-lg border border-[#DDD7CC] bg-white/90 px-3 py-2 text-[11px] text-[#788285] shadow-sm backdrop-blur">Arraste para mover · role para ampliar</div><svg ref={svgRef} className="h-full w-full" aria-label="Mapa visual dos argumentos do debate" /></div>;
}