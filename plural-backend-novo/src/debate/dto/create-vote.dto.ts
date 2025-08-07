import { VoteType } from '@prisma/client';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class CreateVoteDto {
  @IsEnum(VoteType)
  @IsNotEmpty()
  type: VoteType;
}
