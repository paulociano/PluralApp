'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import ArgumentModal from './ArgumentModal';

// Tipos de dados
type ArgumentData = { id: string; content: string; author: { id: string; name: string; }; votesCount: number; replyCount: number; parentArgumentId: string | null; topicId: string; type: 'PRO' | 'CONTRA' | 'NEUTRO'; replies?: ArgumentData[] };
type Node = d3.SimulationNodeDatum & { id: string; data: ArgumentData };
type Link = { source: any; target: any };

type DebateGraphProps = {
  argumentsTree: ArgumentData[];
  onNodeClick: (argument: ArgumentData) => void;
};

const colors = {
  rootArgument: '#2D4F5A',
  replyArgumentPro: '#63A6A0',
  replyArgumentContra: '#E57373',
  replyArgumentNeutro: '#A0AEC0',
  connector: '#B0B0B0',
};

export default function DebateGraph({ argumentsTree, onNodeClick }: DebateGraphProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!argumentsTree || argumentsTree.length === 0 || !svgRef.current) {
      d3.select(svgRef.current).selectAll('*').remove();
      return;
    }

    const nodes: Node[] = [];
    const links: Link[] = [];
    const flattenTree = (args: ArgumentData[]) => {
      if (!Array.isArray(args)) return;
      args.forEach((arg) => {
        nodes.push({ id: arg.id, data: arg });
        if (arg.parentArgumentId) {
          links.push({ source: arg.parentArgumentId, target: arg.id });
        }
        if (arg.replies && arg.replies.length > 0) {
          flattenTree(arg.replies);
        }
      });
    };
    flattenTree(argumentsTree);

    const width = 900;
    const height = 700;
    const svg = d3.select(svgRef.current).attr('width', width).attr('height', height).attr('viewBox', [-width / 2, -height / 2, width, height]);
    svg.selectAll('*').remove();

    const simulation = d3
      .forceSimulation(nodes)
      .force('link', d3.forceLink(links).id((d: any) => d.id).distance(80))
      .force('charge', d3.forceManyBody().strength(-250))
      .force('center', d3.forceCenter());

    const link = svg.append('g').attr('stroke', colors.connector).attr('stroke-opacity', 0.6).selectAll('line').data(links).join('line');

    const node = svg
      .append('g')
      .selectAll('circle')
      .data(nodes)
      .join('circle')
      .attr('r', (d) => Math.max(10, 10 + d.data.votesCount * 3))
      .attr('fill', (d) => {
        if (!d.data.parentArgumentId) return colors.rootArgument;
        if (d.data.type === 'CONTRA') return colors.replyArgumentContra;
        if (d.data.type === 'NEUTRO') return colors.replyArgumentNeutro;
        return colors.replyArgumentPro;
      })
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        onNodeClick(d.data);
      });

    node.append('title').text((d) => d.data.content);

    simulation.on('tick', () => {
      link
        .attr('x1', (d) => d.source.x!)
        .attr('y1', (d) => d.source.y!)
        .attr('x2', (d) => d.target.x!)
        .attr('y2', (d) => d.target.y!);
      node.attr('cx', (d) => d.x!).attr('cy', (d) => d.y!);
    });
  }, [argumentsTree, onNodeClick]);

  return (
    <div className="flex justify-center items-center w-full h-full">
      <svg ref={svgRef}></svg>
    </div>
  );
}