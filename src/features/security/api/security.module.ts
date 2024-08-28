import { Module } from '@nestjs/common';
import { SecurityController } from './security.controller';
import { SecurityService } from '../application/security.service';
import { SecurityRepository } from '../infrastructure/security.repository';
import { SecurityQueryRepository } from '../infrastructure/security.query.repository';
import { SecurityGuard } from '../../../common/guards/security.guard';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Session } from '../domain/security.orm.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Session])],
  controllers: [SecurityController],
  providers: [
    JwtService,
    SecurityService,
    SecurityRepository,
    SecurityQueryRepository,
    SecurityGuard,
  ],
  exports: [SecurityService, SecurityRepository],
})
export class SecurityModule {}
