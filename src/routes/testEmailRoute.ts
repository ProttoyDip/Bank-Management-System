import { Router } from "express";
import { sendVerificationEmail } from "../utils/emailService";

const router = Router();

router.get("/test-email", async (req, res) => {
  // প্রকৃত ইমেইল পাঠানো
  const result = await sendVerificationEmail("s2004kin@gmail.com", "123456", "Sakin");
  res.json({ success: result }); // true হলে ইমেইল গেছে
});

export default router;