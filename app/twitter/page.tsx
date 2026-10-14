import type { Metadata } from "next";
import { TweetEditor } from "@/components/editors/tweet-editor";

export const metadata: Metadata = {
  title: "Twitter / X post card",
  description: "Turn a tweet into a share-ready image that looks like the real thing.",
};

export default function TwitterPage() {
  return <TweetEditor />;
}
