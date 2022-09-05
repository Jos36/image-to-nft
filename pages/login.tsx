import React from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import type {
  GetServerSideProps,
  InferGetServerSidePropsType,
  NextPage,
} from "next";
import { getToken } from "next-auth/jwt";
import { getSession } from "next-auth/react";

function Login() {
  return (
    <div>
      <ConnectButton />
    </div>
  );
}

export default Login;
