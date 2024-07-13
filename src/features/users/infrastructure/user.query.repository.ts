import { Injectable, NotFoundException } from '@nestjs/common';
import { User, UserDocument } from '../domain/user.entity';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import {
  UserMapper,
  UserOutputDto,
} from '../api/models/output/user.output.model';
import { QueryOutputType } from '../../../base/adapters/query/query.class';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class UserQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async getUserById(userId: string): Promise<UserOutputDto> {
    const result = await this.dataSource.query(
      `
      SELECT u.*, e.*
      FROM "Users" u
      LEFT JOIN "EmailConfirmations" e ON u.email_confirmation_id = e.id
      WHERE u.id = $1
    `,
      [userId],
    );
    if (result.length === 0) {
      return null; // Возвращаем null, если пользователь не найден
    }
    const user = UserMapper.toDomain(result[0]);
    return UserMapper.toView(user);
  }
  async getUsersWithPaging(query: QueryOutputType) {
    const searchLoginTerm = query.searchLoginTerm ?? '';
    const searchEmailTerm = query.searchEmailTerm ?? '';
  }
  /*constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async getUserById(userId: string): Promise<UserOutputDto> {
    const user = await this.userModel.findById(userId, { __v: false });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return UserMapper.toView(user);
  }

  async getUsersWithPaging(query: QueryOutputType) {
    const searchByLogin = {
      login: { $regex: query.searchLoginTerm ?? '', $options: 'i' },
    };
    const searchByEmail = {
      email: { $regex: query.searchEmailTerm ?? '', $options: 'i' },
    };
    const filter = { $or: [searchByLogin, searchByEmail] };
    const totalCount = await this.userModel.countDocuments(filter);
    const pageCount = Math.ceil(totalCount / query.pageSize);
    try {
      const users: UserDocument[] = await this.userModel
        .find(filter)
        .sort({ [query.sortBy]: query.sortDirection })
        .skip((query.pageNumber - 1) * query.pageSize)
        .limit(query.pageSize);
      return {
        pagesCount: pageCount,
        page: query.pageNumber,
        pageSize: query.pageSize,
        totalCount: totalCount,
        items: users.map(UserMapper.toView),
      };
    } catch (e) {
      //Фича можно отловить ошибку то есть где именно падает и тд
      console.log({ get_users_repo: e });
      return false;
    }
  }*/
}
