import type { Metadata } from "next";
import { GithubEditor } from "@/components/editors/github-editor";

export const metadata: Metadata = {
  title: "GitHub profile card",
  description: "Turn a GitHub profile into a share-ready card.",
};

export default function GithubPage() {
  return <GithubEditor />;
}