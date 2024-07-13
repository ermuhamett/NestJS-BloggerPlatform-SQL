import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Session, SessionSchema } from '../domain/security.entity';
import { SecurityController } from './security.controller';
import { SecurityService } from '../application/security.service';
import { SecurityRepository } from '../infrastructure/security.repository';
import { SecurityQueryRepository } from '../infrastructure/security.query.repository';
import { SecurityGuard } from '../../../common/guards/security.guard';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Session.name, schema: SessionSchema }]),
  ],
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
