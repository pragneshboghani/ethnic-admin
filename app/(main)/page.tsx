import SignIn from "../(auth)/sign-in/page";
import { UserProvider } from "@/context/UserContext";

export default async function Home() {
  return (
    <main>
      <UserProvider>
        <SignIn />
      </UserProvider>
    </main>
  );
}
