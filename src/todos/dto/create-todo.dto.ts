import {
  IsBoolean,
  IsOptional,
  IsString,
  IsNotEmpty,
  MinLength,
  IsDate,
} from 'class-validator';

export class CreateTodoDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  title: string;

  @IsBoolean()
  @IsOptional()
  completed: boolean;

  @IsOptional()
  @IsBoolean()
  deleted?: boolean;

  @IsOptional()
  @IsDate()
  completedAt?: Date | null;
}
