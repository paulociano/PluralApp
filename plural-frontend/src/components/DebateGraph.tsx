'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import ArgumentModal from './ArgumentModal';

// Tipos
type ArgumentData = { id: string; content: string; author: { id: string; name: string; }; votesCount: number; replyCount: number; parentArgumentId: string | null; topicId: string; type: 'PRO' | 'CONTRA' | 'NEUTRO'; replies?: ArgumentData[] };
type Node = d3.SimulationNodeDatum & { id: string; data: ArgumentData };
type Link = { source: Node; target: Node };
type DebateGraphProps = { argumentsTree: ArgumentData[]; onReplySuccess: () => void };

const colors = {
  rootArgument: '#2D4F5A',
  replyArgumentPro: '#63A6A0',
  replyArgumentContra: '#E57373',
  replyArgumentNeutro: '#A0AEC0',
  connector: '#B0B0B0',
};

export default function DebateGraph({ argumentsTree, onReplySuccess }: DebateGraphProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [selectedArgument, setSelectedArgument] = useState<ArgumentData | null>(null);

  const handleNodeClick = (argumentData: ArgumentData) => { setSelectedArgument(argumentData); };
  const closeModal = () => { setSelectedArgument(null); };

  useEffect(() => {
    if (!argumentsTree || argumentsTree.length === 0 || !svgRef.current) {
      d3.select(svgRef.current).selectAll('*').remove();
      return;
    }

    // A lógica de preparação dos dados (flattenTree) continua a mesma
    const nodes: Node[] = [];
    const links: Link[] = [];
    const flattenTree = (args: ArgumentData[]) => {
      if (!Array.isArray(args)) return;
      args.forEach((arg) => {
        nodes.push({ id: arg.id, data: arg });
        if (arg.parentArgumentId) {
          links.push({ source: arg.parentArgumentId as any, target: arg.id as any });
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

    // Adicionamos filtros de cor para o SVG
    const defs = svg.append('defs');
    Object.entries(colors).forEach(([key, color]) => {
      if (key !== 'connector') {
        defs.append('filter')
          .attr('id', `color-${key}`)
          .append('feColorMatrix')
          .attr('type', 'matrix')
          .attr('values', `0 0 0 0 ${parseInt(color.substring(1, 3), 16) / 255} 0 0 0 0 ${parseInt(color.substring(3, 5), 16) / 255} 0 0 0 0 ${parseInt(color.substring(5, 7), 16) / 255} 0 0 0 1 0`);
      }
    });

    const simulation = d3
      .forceSimulation(nodes)
      .force('link', d3.forceLink(links).id((d: any) => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-350))
      .force('center', d3.forceCenter());

    const link = svg.append('g').attr('stroke', colors.connector).attr('stroke-opacity', 0.6)
      .selectAll('line').data(links).join('line');

    // --- MUDANÇA PRINCIPAL AQUI ---
    // Em vez de 'circle', usamos a tag SVG 'image'
    const node = svg.append('g')
      .selectAll('image')
      .data(nodes)
      .join('image')
      .attr('xlink:href', '/ArgumentIcon.svg') // <-- Use o nome do seu arquivo SVG aqui
      .attr('width', d => Math.max(30, 30 + d.data.votesCount * 5))
      .attr('height', d => Math.max(30, 30 + d.data.votesCount * 5))
      .style('cursor', 'pointer')
      .attr('filter', (d) => { // Aplicamos o filtro de cor
        if (!d.data.parentArgumentId) return `url(#color-rootArgument)`;
        if (d.data.type === 'CONTRA') return `url(#color-replyArgumentContra)`;
        if (d.data.type === 'NEUTRO') return `url(#color-replyArgumentNeutro)`;
        return `url(#color-replyArgumentPro)`;
      })
      .on('click', (event, d) => handleNodeClick(d.data));
      
    node.append('title').text(d => d.data.content);

    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x!)
        .attr('y1', d => d.source.y!)
        .attr('x2', d => d.target.x!)
        .attr('y2', d => d.target.y!);

      // Ajustamos o 'x' e 'y' para centralizar a imagem
      node
        .attr('x', d => d.x! - (Math.max(30, 30 + d.data.votesCount * 5) / 2))
        .attr('y', d => d.y! - (Math.max(30, 30 + d.data.votesCount * 5) / 2));
    });

  }, [argumentsTree]);

  return (
    <div className="flex justify-center items-center w-full">
      <svg ref={svgRef}></svg>
      <ArgumentModal isOpen={!!selectedArgument} onClose={closeModal} argument={selectedArgument} onReplySuccess={onReplySuccess} />
    </div>
  );
}