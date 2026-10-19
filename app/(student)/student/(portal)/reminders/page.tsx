import { redirect } from "next/navigation";

// Email settings now live in the settings dialog. Email links still point here.
export default function StudentRemindersPage() {
  redirect("/student?settings=email");
}
