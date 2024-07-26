import { ApiTags } from '@nestjs/swagger';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserQueryRepositorySql } from '../infrastructure/user.query.repository';
import { UsersService } from '../application/users.service';
import { UserCreateDto } from './models/input/create-user.input.model';
import { UserOutputDto } from './models/output/user.output.model';
import {
  QueryInputType,
  QueryParams,
} from '../../../base/adapters/query/query.class';
import { UserRepositorySql } from '../infrastructure/user.repository';
import { AuthGuard } from '@nestjs/passport';

// Tag для swagger
@ApiTags('Users')
@Controller('sa/users')
// Установка guard на весь контроллер
//@UseGuards(AuthGuard)
export class UserController {
  constructor(
    private readonly usersService: UsersService,
    private readonly userRepository: UserRepositorySql,
    private readonly usersQueryRepository: UserQueryRepositorySql,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getUsersWithPaging(@Query() query: QueryInputType) {
    const sanitizedQuery = new QueryParams(query).sanitize();
    return await this.usersQueryRepository.getUsersWithPaging(sanitizedQuery);
  }

  @UseGuards(AuthGuard('basic'))
  @Post()
  // Для переопределения default статус кода https://docs.nestjs.com/controllers#status-code
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createModel: UserCreateDto): Promise<UserOutputDto> {
    const userId = await this.usersService.create(createModel);
    if (!userId) {
      throw new HttpException(
        'Some error when created user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return await this.usersQueryRepository.getUserById(userId.toString());
  }

  @UseGuards(AuthGuard('basic'))
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUserById(@Param('id') id: string) {
    const user = await this.userRepository.find(id);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    await this.usersService.deleteUserById(id);
  }
}
