import { callApi } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";

export default async function CallApi({
  searchParams,
}: {
  searchParams: Message;
}) {
  return (
    <form
      className="flex flex-col w-full max-w-md p-4 gap-4 [&>input]:mb-4"
      action={callApi}
    >
      <SubmitButton>Make API call</SubmitButton>
      <FormMessage message={searchParams} />
    </form>
  );
}
