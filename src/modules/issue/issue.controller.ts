import type { Request, Response } from "express";
import sendResponse from "../../utility/sendResponse";
import { issuesService } from "./issue.service";

const createIssues = async (req: Request, res: Response) => {
  try {
    const result = await issuesService.createIssuesIntoDb(req.body);

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Issue created successfully",
    });
  } catch (error: any) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: error.message || "Internal Server Error!!!",
      error: error,
    });
  }
};

export const issuesController = {
  createIssues,
};
