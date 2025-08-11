/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ArgType } from '@prisma/client'; 

@Injectable()
export class AiService {
  private genAI: GoogleGenerativeAI;

  constructor(private prisma: PrismaService) {
    // Inicializa a IA com a chave do .env
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }

  async summarizeTopic(topicId: string): Promise<{ summary: string }> {
    // 1. Busca o tópico e todos os seus argumentos
    const topic = await this.prisma.topic.findUnique({
      where: { id: topicId },
      include: { arguments: { orderBy: { createdAt: 'asc' } } },
    });

    if (!topic || topic.arguments.length === 0) {
      throw new NotFoundException('Nenhum argumento encontrado para este tópico.');
    }

    // 2. Formata os argumentos em um texto legível para a IA
    let argumentsText = `Tópico: "${topic.title}"\n\n`;
    const proArgs = topic.arguments.filter(a => a.type === 'PRO').map(a => `- ${a.content}`).join('\n');
    const contraArgs = topic.arguments.filter(a => a.type === 'CONTRA').map(a => `- ${a.content}`).join('\n');

    argumentsText += `Argumentos a Favor:\n${proArgs || 'Nenhum'}\n\n`;
    argumentsText += `Argumentos Contra:\n${contraArgs || 'Nenhum'}\n\n`;

    // 3. Cria o prompt para a IA
    const prompt = `
      Você é um assistente analista de debates da plataforma "Plural". Sua tarefa é analisar a lista de argumentos de um debate e gerar um resumo claro e conciso para um novo usuário.
      O resumo deve ser em português do Brasil e ter EXATAMENTE DOIS PARÁGRAFOS:

      Parágrafo 1: "Principais Pontos Abordados": Resuma os temas centrais e as linhas de raciocínio já estabelecidas no debate.
      Parágrafo 2: "Foco da Discussão Atual": Com base nos argumentos mais recentes, descreva sobre o que os participantes estão comentando no momento.

      Aqui estão os argumentos:
      ${argumentsText}
    `;

    try {
      // 4. Envia o prompt para a API do Gemini
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const summary = response.text();

      return { summary };
    } catch (error) {
      console.error("Erro na API do Gemini:", error);
      throw new InternalServerErrorException('Não foi possível gerar o resumo com a IA.');
    }
  }
}