import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bullmq";
import { ReportProcessor } from "./report.processor";

@Module({
  imports: [
    BullModule.registerQueue({ name: "reports" }),
  ],
  providers: [ReportProcessor],
  exports: [BullModule],
})
export class QueueModule {}
