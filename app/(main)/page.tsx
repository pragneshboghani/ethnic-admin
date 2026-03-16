import '../globals.css'
import Header from "@/components/Header";
import SignIn from "../(auth)/sign-in/page";
import { UserProvider } from '@/context/UserContext';


export default function Home() {

  return (
    <div className="App">
      <Header />
      <main className="pt-[105px]">
        <UserProvider>
          <SignIn />
        </UserProvider>
      </main>
    </div>
  );
}
