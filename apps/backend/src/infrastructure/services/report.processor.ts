import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";

@Processor("reports")
export class ReportProcessor extends WorkerHost {
  async process(job: Job) {
    switch (job.name) {
      case "daily-report":
        // TODO: Generate PDF report
        console.log(`Generating daily report for manager: ${job.data.managerId}`);
        break;
      case "reminder":
        // TODO: Send email reminder
        console.log(`Sending reminder: ${job.data.taskId}`);
        break;
    }
  }
}
