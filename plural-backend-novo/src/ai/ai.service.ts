/* eslint-disable @typescript-eslint/await-thenable */
/* eslint-disable prettier/prettier */
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { AnalyzeArgumentDto } from './dto/analyze-argument.dto';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DebateService } from '@/debate/debate.service';

export type ArgumentAnalysis = {
  clarity: { score: number; feedback: string };
  bias: { score: number; feedback: string };
  consistency: { score: number; feedback: string };
};

@Injectable()
export class AiService {
  private genAI: GoogleGenerativeAI;

  constructor(
    private prisma: PrismaService,
    private debateService: DebateService,
  ) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY não está definida no arquivo .env');
    }
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }

  async summarizeTopic(topicId: string): Promise<{ summary: string }> {
    const topic = await this.prisma.topic.findUnique({
      where: { id: topicId },
      include: { arguments: { orderBy: { createdAt: 'asc' } } },
    });

    if (!topic || topic.arguments.length === 0) {
      throw new NotFoundException(
        'Nenhum argumento encontrado para este tópico.',
      );
    }

    let argumentsText = `Tópico: "${topic.title}"\n\n`;
    const proArgs = topic.arguments
      .filter((a) => a.type === 'PRO')
      .map((a) => `- ${a.content}`)
      .join('\n');
    const contraArgs = topic.arguments
      .filter((a) => a.type === 'CONTRA')
      .map((a) => `- ${a.content}`)
      .join('\n');

    argumentsText += `Argumentos a Favor:\n${proArgs || 'Nenhum'}\n\n`;
    argumentsText += `Argumentos Contra:\n${contraArgs || 'Nenhum'}\n\n`;

    const prompt = `
      Você é um assistente analista de debates da plataforma "Plural". Sua tarefa é analisar a lista de argumentos de um debate e gerar um resumo claro e conciso para um novo usuário.
      O resumo deve ser em português do Brasil e ter EXATAMENTE DOIS PARÁGRAFOS:

      Parágrafo 1: "Principais Pontos Abordados": Resuma os temas centrais e as linhas de raciocínio já estabelecidas no debate.
      Parágrafo 2: "Foco da Discussão Atual": Com base nos argumentos mais recentes, descreva sobre o que os participantes estão comentando no momento.

      Aqui estão os argumentos:
      ${argumentsText}
    `;

    try {
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
      });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const summary = response.text();

      return { summary };
    } catch (error) {
      console.error('Erro na API do Gemini:', error);
      throw new InternalServerErrorException(
        'Não foi possível gerar o resumo com a IA.',
      );
    }
  }

  async analyzeArgumentQuality(
    dto: AnalyzeArgumentDto,
  ): Promise<ArgumentAnalysis> {
    const { content } = dto;

    const model = this.genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: { responseMimeType: 'application/json' },
    });

    const prompt = `
      Você é um assistente especialista em lógica e debates, agindo como um "coach de argumentos".
      Analise o argumento a seguir e retorne um objeto JSON com a seguinte estrutura: {"clarity": {"score": number, "feedback": string}, "bias": {"score": number, "feedback": string}, "consistency": {"score": number, "feedback": string}}.
      
      - O "score" deve ser um número inteiro de 1 (muito fraco) a 10 (excelente).
      - O "feedback" deve ser uma frase curta, construtiva e em português do Brasil, explicando a pontuação.
      - Clareza (clarity): Avalie se o argumento é fácil de entender, direto e bem articulado.
      - Viés (bias): Avalie se o argumento usa linguagem neutra ou se apela para emoções, generalizações ou ataques pessoais.
      - Consistência (consistency): Avalie se o argumento é logicamente consistente e não se contradiz.

      Argumento para analisar: "${content}"
    `;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const jsonText = response.text();

      const analysis: ArgumentAnalysis = JSON.parse(jsonText);
      return analysis;
    } catch (error) {
      console.error('Erro na API do Gemini ao analisar argumento:', error);
      throw new InternalServerErrorException(
        'Não foi possível analisar o argumento com a IA.',
      );
    }
  };
}
