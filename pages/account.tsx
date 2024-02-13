import {
  Alert,
  Box,
  Button,
  Container,
  Snackbar,
  TextField,
} from "@mui/material";
import { useSession, signIn } from "next-auth/react";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { LoadingButton } from "@mui/lab";
const Page = () => {
  const { data: session, status } = useSession({ required: true });
  const [open, setOpen] = React.useState(false);
  const [serverMessage, setServerMessage] = useState<{
    content: string;
    ok: boolean;
  }>({ content: "", ok: false });

  const handleClose = (
    event: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
  };
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const handleSubmit = () => {
    setError("");
    setOpen(false);
    if (!session?.user?.userId) {
      setError("Unauthorized");
      return;
    }
    if (!password || !confirmPassword) {
      setError("Please fill in both fields");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
    if (!passwordRegex.test(password)) {
      setError("Letters and numbers");
      return;
    }
    setLoading(true);
    axios
      .post("/api/auth/setPassword", {
        password,
        userId: session.user.userId,
      })
      .then((res) => {
        setServerMessage({ content: "Password updated", ok: true });
      })
      .catch((error: any) => {
        setServerMessage({ content: error.message, ok: false });
      })
      .finally(() => {
        setLoading(false);
        setOpen(true);
      });
  };

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
    <Container sx={{ height: "80vh" }}>
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
      <Box width='100%'>
        <Box
          component='form'
          sx={{
            "& .MuiTextField-root": { m: 1, width: "25ch" },
          }}
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          noValidate
          autoComplete='off'
        >
          <TextField
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={!!error.length}
            id='outlined-error'
            label='Password'
            helperText={error ?? " "}
          />
          <TextField
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={!!error.length}
            id='outlined-error-helper-text'
            label='Confirm Password'
            helperText={error || " "}
          />
          <Box mt={2}>
            <LoadingButton loading={loading} variant='contained' type='submit'>
              Submit
            </LoadingButton>
          </Box>
        </Box>
      </Box>
      <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
        <Alert
          onClose={handleClose}
          severity={serverMessage.ok ? "success" : "error"}
          variant='filled'
          sx={{ width: "100%" }}
        >
          {serverMessage.content}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Page;
