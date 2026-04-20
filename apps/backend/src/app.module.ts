import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ProductController } from './presentation/controllers/product.controller';
import { CaisseController } from './presentation/controllers/caisse.controller';
import { TransactionController } from './presentation/controllers/transaction.controller';
import { QueueModule } from './infrastructure/services/queue.module';

@Module({
  imports: [
    PrismaModule,
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
    }),
    QueueModule,
  ],
  controllers: [AppController, ProductController, CaisseController, TransactionController],
  providers: [AppService],
})
export class AppModule {}
