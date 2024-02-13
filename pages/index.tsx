import { Button, Container } from "@mui/material";
import { Session } from "next-auth";
import { signIn, signOut, useSession } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();
  return (
    <main>
      <Container>
        <Header session={session} />
      </Container>
    </main>
  );
}

const Header: React.FC<{ session: Session | null }> = ({ session }) => {
  if (session?.user) {
    return (
      <div>
        Signed in as {session.user.email} <br />
        <Button onClick={() => signOut()}>Sign out</Button>
      </div>
    );
  }
  return (
    <div>
      Not signed in <br />
      <Button onClick={() => signIn()}>Sign in</Button>
    </div>
  );
};
