export type IssuesPayload = {
  title: string;
  description: string;
  type: "feature_request" | "bug ";
};

export interface GetIssuesQuery {
  sort?: "newest" | "oldest";
  type?: "bug" | "feature_request";
  status?: "open" | "in_progress" | "resolved";
}
