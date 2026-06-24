import type { Request, Response } from "express";
import sendResponse from "../../utility/sendResponse";
import { issuesService } from "./issue.service";

const createIssues = async (req: Request, res: Response) => {
  try {
    const reporter_id = req.user.id;

    const result = await issuesService.createIssuesIntoDb(
      req.body,
      reporter_id,
    );

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Issue created successfully",
      data: result.rows[0],
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
