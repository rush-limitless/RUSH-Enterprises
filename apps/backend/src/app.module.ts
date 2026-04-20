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

function getRedisConfig() {
  if (process.env.REDIS_URL) {
    const url = new URL(process.env.REDIS_URL);
    return { host: url.hostname, port: parseInt(url.port || '6379'), password: url.password || undefined };
  }
  if (process.env.REDIS_HOST?.includes('.')) {
    return { host: process.env.REDIS_HOST, port: parseInt(process.env.REDIS_PORT || '6379') };
  }
  return null;
}

const redisConfig = getRedisConfig();
if (redisConfig) {
  const { BullModule } = require('@nestjs/bullmq');
  const { QueueModule } = require('./infrastructure/services/queue.module');
  imports.push(
    BullModule.forRoot({ connection: redisConfig }),
    QueueModule,
  );
}

@Module({
  imports,
  controllers: [AppController, ProductController, CaisseController, TransactionController, TaskController, UserController],
  providers: [AppService],
})
export class AppModule {}
