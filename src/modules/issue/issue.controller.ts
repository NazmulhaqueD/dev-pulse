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

const getAllIssues = async (req: Request, res: Response) => {
  try {
    const { sort = "newest", type, status } = req.query;

    const result = await issuesService.getAllIssuesFromDb(req.query);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Issues retrived successfully",
      data: result,
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

// ======get all users=======
const getSingleIssues = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const result = await issuesService.getSingleIssueFromDb(id);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Issue retrived successfully",
      data: result,
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

const updateIssue = async (req: Request, res: Response) => {
  try {
    const issueId = Number(req.params.id);
    const user = req.user;
    const result = await issuesService.updateIssueInDb(user, issueId, req.body);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Issue updated successfully",
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

// =======delete issue========
const deleteIssue = async (req: Request, res: Response) => {
  try {
    const issueId = Number(req.params.id);
    const user = req.user;
    const result = await issuesService.deleteIssueFromDb(user, issueId);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Issue deleted successfully",
    });
  } catch (error: any) {
    sendResponse(res, {
      statusCode: error.statusCode || 500,
      success: false,
      message: error.message || "Internal Server Error!!!",
      error: error,
    });
  }
};
export const issuesController = {
  createIssues,
  getAllIssues,
  getSingleIssues,
  updateIssue,
  deleteIssue,
};
