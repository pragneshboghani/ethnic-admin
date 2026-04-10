import "../globals.css";
import SignIn from "../(auth)/sign-in/page";
import { UserProvider } from "@/context/UserContext";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Home() {
  const token = (await cookies()).get("token")?.value;

  if (token) {
    redirect("/account/dashboard");
  }

  return (
    <div className="App">
      <main>
        <UserProvider>
          <SignIn />
        </UserProvider>
      </main>
    </div>
  );
}
