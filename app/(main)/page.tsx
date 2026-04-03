import '../globals.css'
import SignIn from "../(auth)/sign-in/page";
import { UserProvider } from '@/context/UserContext';


export default function Home() {

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
