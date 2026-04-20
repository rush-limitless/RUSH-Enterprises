import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ProductController } from './presentation/controllers/product.controller';
import { CaisseController } from './presentation/controllers/caisse.controller';
import { TransactionController } from './presentation/controllers/transaction.controller';
import { TaskController } from './presentation/controllers/task.controller';
import { UserController } from './presentation/controllers/user.controller';

const imports: any[] = [PrismaModule];

if (process.env.REDIS_HOST) {
  const { BullModule } = require('@nestjs/bullmq');
  const { QueueModule } = require('./infrastructure/services/queue.module');
  imports.push(
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
    }),
    QueueModule,
  );
}

@Module({
  imports,
  controllers: [AppController, ProductController, CaisseController, TransactionController, TaskController, UserController],
  providers: [AppService],
})
export class AppModule {}
