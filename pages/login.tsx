import { getSession, signIn } from "next-auth/react";
import { useRouter } from "next/router";
import { GetServerSideProps } from "next/types";
import useAuth from "../hooks/useAuth";
import { authOptions } from "./api/auth/[...nextauth]";

export default function Login() {
  return (
    <>
      <button
        onClick={() =>
          signIn("credentials", {
            username: "lala",
            password: "password",
          })
        }
      >
        Sign in
      </button>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const defaultReturnObject = {
    redirect: {
      destination: "/",
      permanent: false,
    },
  };
  const session = await getSession(ctx);
  if (session) {
    return defaultReturnObject;
  }
  return { props: {} };
};
