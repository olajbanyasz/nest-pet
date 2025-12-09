import { IsBoolean, IsOptional, IsString, IsNotEmpty } from 'class-validator';

export class CreateTodoDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsBoolean()
  @IsOptional()
  completed: boolean;

  @IsOptional()
  @IsBoolean()
  deleted?: boolean;
}
