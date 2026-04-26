import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { UploadForm } from "@/components/upload-form";
import { authOptions } from "@/lib/auth";

export default async function UploadPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/signin");
  }

  return <UploadForm />;
}
