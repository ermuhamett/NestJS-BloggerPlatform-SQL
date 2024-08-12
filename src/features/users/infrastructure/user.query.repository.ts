import { Injectable } from '@nestjs/common';
import {
  UserMapper,
  UserOutputDto,
} from '../api/models/output/user.output.model';
import { QueryOutputType } from '../../../base/adapters/query/query.class';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { User } from '../domain/user.orm.entity';
import { EmailConfirmation } from '../domain/email-confirmation.orm.entity';

@Injectable()
export class UserQueryRepositorySql {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(EmailConfirmation)
    private readonly emailConfirmationRepo: Repository<EmailConfirmation>,
  ) {}
  async getUserById(userId: string): Promise<UserOutputDto | null> {
    const user = await this.userRepo.findOne({
      where: { userId },
      relations: ['emailConfirmation'], // Имя свойства, представляющего отношение
    });
    if (!user) {
      return null;
    }
    return UserMapper.toView(user);
  }
  async getUsersWithPaging(query: QueryOutputType) {
    const searchLoginTerm = query.searchLoginTerm ?? '';
    const searchEmailTerm = query.searchEmailTerm ?? '';
    const sortBy = query.sortBy;
    const sortDirection = query.sortDirection === 'asc' ? 'ASC' : 'DESC';
    const offset = (query.pageNumber - 1) * query.pageSize;
    const limit = query.pageSize;
    const [users, totalCount] = await this.userRepo
      .createQueryBuilder('u')
      .leftJoinAndSelect('u.emailConfirmation', 'e') //Подключение связанной сущности EmailConfirmation с использованием алиаса 'e'.
      .where(
        '(u.login ILIKE :searchLoginTerm OR u.email ILIKE :searchEmailTerm)',
        {
          searchLoginTerm: `%${searchLoginTerm}%`,
          searchEmailTerm: `%${searchEmailTerm}%`,
        },
      )
      .orderBy(`u.${sortBy}`, sortDirection)
      .skip(offset) //Пропуск страниц
      .take(limit)
      .getManyAndCount();

    const pageCount = Math.ceil(totalCount / query.pageSize);
    const userViews = users.map(UserMapper.toView);

    return {
      pagesCount: pageCount,
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: totalCount,
      items: userViews,
    };
  }
}
