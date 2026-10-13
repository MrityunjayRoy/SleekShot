import type { Metadata } from "next";
import { YoutubeEditor } from "@/components/editors/youtube-editor";

export const metadata: Metadata = {
  title: "YouTube card",
  description: "Turn a YouTube video into a share-ready card.",
};

export default function YoutubePage() {
  return <YoutubeEditor />;
}