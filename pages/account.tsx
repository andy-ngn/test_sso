import { Button, Container } from "@mui/material";
import { useSession, signIn } from "next-auth/react";
import React from "react";

const Page = () => {
  const { data: session, status } = useSession();
  //   const linkWithGithub = async () => {
  //     try {
  //       const res1 = await fetch("/api/auth/csrf");
  //       const data1 = (await res1.json()) as { csrfToken: string };
  //       const { csrfToken } = data1;
  //       const res = await fetch("/api/auth/signin/github", {
  //         method: "POST",
  //         body: JSON.stringify({ csrfToken }),
  //       });
  //       console.log(res);
  //       const data = await res.json();
  //       console.log(data);
  //       return true;
  //     } catch (error: any) {
  //       console.log(error.message);
  //     }
  //   };
  if (!session?.user) {
    if (status === "loading") return <div>Loading...</div>;
    return null;
  }
  return (
    <Container>
      <Button
        onClick={() => {
          signIn("github", {
            redirect: false,
            callbackUrl: "http://localhost:3000/account",
          });
        }}
      >
        Link Github
      </Button>
    </Container>
  );
};

export default Page;
