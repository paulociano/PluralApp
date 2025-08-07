// Arquivo: src/components/DebateGraph.tsx
'use client';

import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

// Tipos para os dados que o D3 vai usar
type Node = { id: string; content: string; votesCount: number; data: any };
type Link = { source: string; target: string };
type GraphData = { nodes: Node[]; links: Link[] };

type DebateGraphProps = {
  argumentsTree: any[]; // Os dados que vêm da nossa API
};

export default function DebateGraph({ argumentsTree }: DebateGraphProps) {
  // useRef nos dá uma referência a um elemento do DOM (nosso SVG)
  const svgRef = useRef<SVGSVGElement | null>(null);

  // useEffect é onde a mágica do D3 acontece, depois que o componente é montado
  useEffect(() => {
    if (!argumentsTree || argumentsTree.length === 0 || !svgRef.current) return;

    // 1. PREPARAÇÃO DOS DADOS: Transformamos nossa árvore de argumentos
    // no formato que o D3 entende (nodes e links).
    const nodes: Node[] = [];
    const links: Link[] = [];
    function flattenTree(args: any[]) {
      args.forEach(arg => {
        nodes.push({ id: arg.id, content: arg.content, votesCount: arg.votesCount, data: arg });
        if (arg.parentArgumentId) {
          links.push({ source: arg.parentArgumentId, target: arg.id });
        }
        if (arg.replies && arg.replies.length > 0) {
          flattenTree(arg.replies);
        }
      });
    }
    flattenTree(argumentsTree);
    const graphData: GraphData = { nodes, links };

    // 2. SETUP DO SVG E DA SIMULAÇÃO
    const width = 800;
    const height = 600;
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [-width / 2, -height / 2, width, height]);

    // Limpa o SVG anterior para evitar duplicação
    svg.selectAll('*').remove();

    const simulation = d3.forceSimulation(graphData.nodes as any)
      .force('link', d3.forceLink(graphData.links).id((d: any) => d.id).distance(50))
      .force('charge', d3.forceManyBody().strength(-200)) // Força de repulsão
      .force('center', d3.forceCenter(0, 0));

    // 3. RENDERIZAÇÃO DOS ELEMENTOS
    const link = svg.append('g')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .selectAll('line')
      .data(graphData.links)
      .join('line')
      .attr('stroke-width', 1.5);

    const node = svg.append('g')
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5)
      .selectAll('circle')
      .data(graphData.nodes)
      .join('circle')
      .attr('r', d => Math.max(5, 5 + d.votesCount * 2)) // Raio baseado nos votos
      .attr('fill', '#007bff')
      .on('click', (event, d) => {
        // Lógica de clique: por enquanto, apenas mostra no console
        console.log('Argumento Clicado:', d.data);
        alert(`Argumento: ${d.content}`);
      });

    // 4. A FUNÇÃO "TICKED"
    // Esta função é chamada a cada "passo" da simulação física
    // e atualiza a posição de cada círculo e linha na tela.
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node
        .attr('cx', (d: any) => d.x)
        .attr('cy', (d: any) => d.y);
    });

  }, [argumentsTree]); // Roda o efeito sempre que os dados mudarem

  return (
    <div className="flex justify-center">
      <svg ref={svgRef}></svg>
    </div>
  );
}