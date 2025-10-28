import { IsString, IsEmail, IsOptional, MinLength, IsIn } from 'class-validator'

export class CreateUsuarioDto {
  @IsString()
  @MinLength(3)
  username: string

  @IsString()
  @MinLength(2)
  nombre: string

  @IsEmail()
  @IsOptional()
  email?: string

  @IsString()
  @MinLength(6)
  password: string
}

export class UpdateUsuarioDto {
  @IsString()
  @IsOptional()
  @MinLength(3)
  username?: string

  @IsString()
  @IsOptional()
  @MinLength(2)
  nombre?: string

  @IsEmail()
  @IsOptional()
  email?: string

  @IsString()
  @IsOptional()
  @MinLength(6)
  password?: string
}

export class UpdateEstadoUsuarioDto {
  @IsString()
  @IsIn(['ACTIVO', 'INACTIVO'])
  estado: 'ACTIVO' | 'INACTIVO'
}