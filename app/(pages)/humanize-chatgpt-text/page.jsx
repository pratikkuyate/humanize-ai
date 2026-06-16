import ModelPageTemplate from "@/components/ModelPageTemplate";
import { aiModels } from "@/lib/aiModels";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://simplyhumanize.com";
const model = aiModels.find((m) => m.slug === "chatgpt");

export const metadata = {
  title: model.metaTitle,
  description: model.metaDescription,
  alternates: { canonical: `${siteUrl}${model.urlPath}` },
  openGraph: {
    title: model.metaTitle,
    description: model.metaDescription,
    url: `${siteUrl}${model.urlPath}`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: model.metaTitle,
    description: model.metaDescription,
  },
};

export default function Page() {
  return <ModelPageTemplate model={model} />;
}
