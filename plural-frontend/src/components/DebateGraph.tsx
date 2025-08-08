/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import ArgumentModal from './ArgumentModal';
import ArgumentIcon from '@/components/icons/ArgumentIcon.svg'; // Garanta que este caminho está correto

// Tipos
type ArgumentData = { id: string; content: string; author: { id: string; name: string; }; votesCount: number; replyCount: number; parentArgumentId: string | null; topicId: string; type: 'PRO' | 'CONTRA' | 'NEUTRO'; replies?: ArgumentData[] };
type Node = d3.SimulationNodeDatum & { id: string; data: ArgumentData }; // Usamos o tipo do D3
type Link = { source: string | Node; target: string | Node };
type DebateGraphProps = { argumentsTree: ArgumentData[]; onReplySuccess: () => void };

const colors = {
  rootArgument: 'text-[#2D4F5A]',
  replyArgumentPro: 'text-[#63A6A0]',
  replyArgumentContra: 'text-[#E57373]',
  replyArgumentNeutro: 'text-[#A0AEC0]',
  connector: '#B0B0B0',
};

export default function DebateGraph({ argumentsTree, onReplySuccess }: DebateGraphProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [selectedArgument, setSelectedArgument] = useState<ArgumentData | null>(null);
  
  const [renderedNodes, setRenderedNodes] = useState<Node[]>([]);
  const [renderedLinks, setRenderedLinks] = useState<Link[]>([]);

  const handleNodeClick = (argumentData: ArgumentData) => { setSelectedArgument(argumentData); };
  const closeModal = () => { setSelectedArgument(null); };

  useEffect(() => {
    if (!argumentsTree || argumentsTree.length === 0) {
      setRenderedNodes([]);
      setRenderedLinks([]);
      return;
    };

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

    const simulation = d3
      .forceSimulation(nodes)
      .force('link', d3.forceLink(links).id((d: any) => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-350))
      .force('center', d3.forceCenter());

    simulation.on('tick', () => {
      // Criamos cópias dos arrays para o React detectar a mudança
      setRenderedNodes([...nodes]);
      setRenderedLinks([...links]);
    });

    // Para a simulação parar quando encontrar um equilíbrio
    simulation.on('end', () => {
      console.log('Simulação estabilizada');
    });

  }, [argumentsTree]);

  return (
    <div className="relative flex justify-center items-center w-full h-[700px]">
      <svg ref={svgRef} viewBox="-450 -350 900 700">
        <g className="links">
          {renderedLinks.map((link, i) => {
            const sourceNode = link.source as d3.SimulationNodeDatum;
            const targetNode = link.target as d3.SimulationNodeDatum;
            // SÓ RENDERIZA A LINHA SE AS POSIÇÕES EXISTIREM
            if (sourceNode.x === undefined || targetNode.x === undefined) return null;
            return (
              <line
                key={i}
                x1={sourceNode.x} y1={sourceNode.y}
                x2={targetNode.x} y2={targetNode.y}
                stroke={colors.connector}
                strokeWidth={1.5}
              />
            );
          })}
        </g>
        <g className="nodes">
          {renderedNodes.map((node) => {
            // SÓ RENDERIZA O NÓ SE A POSIÇÃO EXISTIR
            if (node.x === undefined) return null;

            const size = Math.max(30, 30 + node.data.votesCount * 5);
            let colorClass = '';
            if (!node.data.parentArgumentId) colorClass = colors.rootArgument;
            else if (node.data.type === 'CONTRA') colorClass = colors.replyArgumentContra;
            else if (node.data.type === 'NEUTRO') colorClass = colors.replyArgumentNeutro;
            else colorClass = colors.replyArgumentPro;
            
            return (
              // Usamos um <foreignObject> para renderizar componentes React dentro do SVG,
              // o que nos dá mais controle e evita problemas de posicionamento.
              <foreignObject
                key={node.id}
                x={node.x - size / 2}
                y={(node.y ?? 0) - size / 2}
                width={size}
                height={size}
              >
                <div
                  className="w-full h-full cursor-pointer"
                  onClick={() => handleNodeClick(node.data)}
                >
                  <ArgumentIcon
                    width="100%"
                    height="100%"
                    className={`${colorClass} transition-transform hover:scale-110`}
                  />
                  <title>{node.data.content}</title>
                </div>
              </foreignObject>
            );
          })}
        </g>
      </svg>
      <ArgumentModal isOpen={!!selectedArgument} onClose={closeModal} argument={selectedArgument} onReplySuccess={onReplySuccess} />
    </div>
  );
}