import type { Metadata } from "next";
import { RepoEditor } from "@/components/editors/repo-editor";

export const metadata: Metadata = {
  title: "GitHub repo card",
  description: "Turn a GitHub repository into a share-ready card.",
};

export default function RepoPage() {
  return <RepoEditor />;
}