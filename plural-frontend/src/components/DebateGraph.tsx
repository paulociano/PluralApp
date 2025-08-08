/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import ArgumentModal from './ArgumentModal';

// Tipos
type ArgumentData = {
  id: string;
  content: string;
  author: { id: string; name: string }; // <-- CORREÇÃO APLICADA AQUI
  votesCount: number;
  replyCount: number;
  parentArgumentId: string | null;
  topicId: string;
  type: 'PRO' | 'CONTRA';
  replies?: ArgumentData[];
};
type Node = { id: string; content: string; votesCount: number; data: ArgumentData };
type Link = { source: string; target: string };
type DebateGraphProps = { argumentsTree: ArgumentData[]; onReplySuccess: () => void };

const colors = {
  rootArgument: '#2D4F5A',
  replyArgument: '#63A6A0',
  replyArgumentContra: '#E57373',
  connector: '#B0B0B0',
};

export default function DebateGraph({ argumentsTree, onReplySuccess }: DebateGraphProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [selectedArgument, setSelectedArgument] = useState<ArgumentData | null>(null);

  const handleNodeClick = (argumentData: ArgumentData) => {
    setSelectedArgument(argumentData);
  };

  const closeModal = () => {
    setSelectedArgument(null);
  };

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
        nodes.push({ id: arg.id, content: arg.content, votesCount: arg.votesCount, data: arg });
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
      .forceSimulation(nodes as any)
      .force('link', d3.forceLink(links).id((d: any) => d.id).distance(80))
      .force('charge', d3.forceManyBody().strength(-250))
      .force('center', d3.forceCenter());

    const link = svg.append('g').attr('stroke', colors.connector).attr('stroke-opacity', 0.6).selectAll('line').data(links).join('line');

    const node = svg
      .append('g')
      .selectAll('circle')
      .data(nodes)
      .join('circle')
      .attr('r', (d) => Math.max(10, 10 + d.votesCount * 3))
      .attr('fill', (d) => {
        if (!d.data.parentArgumentId) {
          return colors.rootArgument;
        }
        return d.data.type === 'CONTRA' ? colors.replyArgumentContra : colors.replyArgument;
      })
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        handleNodeClick(d.data);
      });

    node.append('title').text((d) => d.content);

    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);
      node.attr('cx', (d: any) => d.x).attr('cy', (d: any) => d.y);
    });
  }, [argumentsTree]);

  return (
    <div className="flex justify-center items-center w-full">
      <svg ref={svgRef}></svg>
      <ArgumentModal isOpen={!!selectedArgument} onClose={closeModal} argument={selectedArgument} onReplySuccess={onReplySuccess} />
    </div>
  );
}