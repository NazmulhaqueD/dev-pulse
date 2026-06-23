import { Router } from "express";
import auth from "../../middleware/auth";
import { issuesController } from "./issue.controller";

const router = Router();

router.post("/", auth(), issuesController.createIssues);

export const issueRoute = router;
