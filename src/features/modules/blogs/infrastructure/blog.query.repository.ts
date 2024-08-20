import { Injectable } from '@nestjs/common';
import {
  BlogMapper,
  BlogOutputDto,
} from '../api/models/output/blog.output.model';
import {
  PagingResult,
  QueryOutputType,
} from '../../../../base/adapters/query/query.class';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Like, Repository } from 'typeorm';
import { Blog } from '../domain/blog.orm.entity';

@Injectable()
export class BlogQueryRepository {
  constructor(
    @InjectRepository(Blog)
    private readonly blogQueryRepository: Repository<Blog>,
  ) {}

  async getBlogById(blogId: string) {
    const blog = await this.blogQueryRepository.findOne({ where: { blogId } });
    if (!blog) {
      return null; // Если блог не найден, возвращаем null
    }
    // Преобразуем найденный блог в формат представления
    return BlogMapper.toView(blog);
  }

  async getBlogsWithPaging(
    query: QueryOutputType,
  ): Promise<PagingResult<BlogOutputDto>> {
    // Предварительные расчеты и настройки
    const searchNameTerm = query.searchNameTerm ?? '';
    const sortBy = query.sortBy;
    const sortDirection = query.sortDirection === 'asc' ? 'ASC' : 'DESC';
    const offset = (query.pageNumber - 1) * query.pageSize;
    const limit = query.pageSize;

    // Фильтрация по имени
    const where = searchNameTerm ? { name: ILike(`%${searchNameTerm}%`) } : {};
    // Подсчет общего количества записей
    const totalCount = await this.blogQueryRepository.count({ where });
    // Подсчет количества страниц
    const pagesCount = Math.ceil(totalCount / limit);

    const items = await this.blogQueryRepository.find({
      where,
      order: {
        [sortBy]: sortDirection,
      },
      skip: offset,
      take: limit,
    });
    // Формирование результата с использованием BlogMapper
    return {
      pagesCount,
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: totalCount,
      items: items.map(BlogMapper.toView),
    };
  }
}
