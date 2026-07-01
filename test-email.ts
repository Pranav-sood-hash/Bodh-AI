import "dotenv/config";
import { sendEmailVerification } from "./src/services/email.service";

async function run() {
  console.log("Sending email...");
  await sendEmailVerification("soodpranav235@gmail.com", "123456", "Pranav");
  console.log("Done.");
}

run();
