import { redirect } from "next/navigation";

export default function CampaignIndex({
  params,
}: {
  params: { campaign: string };
}) {
  redirect(`/dashboard/${params.campaign}/visao-geral`);
}
