import { applyDecorators } from '@nestjs/common';
import {IsEmail, IsNotEmpty, IsOptional, IsString, Length} from 'class-validator';
import { Trim } from '../transform/trim';

// Объединение декораторов
// https://docs.nestjs.com/custom-decorators#decorator-composition
export const IsOptionalEmail = () => {
    return applyDecorators(Trim(), IsString(), IsNotEmpty(), IsEmail());
}

export const IsOptionalString=()=>{
    return applyDecorators(Trim(), IsString(), IsNotEmpty())
}

export const IsStringLength=(min:number, max:number)=>{
    return applyDecorators(Trim(), IsString(), IsNotEmpty(), Length(min, max))
}