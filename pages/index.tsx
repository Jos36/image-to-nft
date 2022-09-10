import { ConnectButton } from "@rainbow-me/rainbowkit";
import type {
  GetServerSideProps,
  InferGetServerSidePropsType,
  NextPage,
} from "next";
import { getToken } from "next-auth/jwt";
import { getSession } from "next-auth/react";
import { useContext, useEffect } from "react";
import { useRouter } from "next/router";
import HomeComponent from "../components/Home";
import Navbar from "../components/Navbar";
import { Context } from "../context/context";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);
  const token = await getToken({ req: context.req });

  const address = token?.sub ?? null;
  // If you have a value for "address" here, your
  // server knows the user is authenticated.

  // You can then pass any data you want
  // to the page component here.

  if (!address) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  if (session?.user.role === "ADMIN") {
    return {
      redirect: {
        destination: "/admin",
        permanent: false,
      },
    };
  }

  return {
    props: {
      address,
      session,
    },
  };
};

type AuthenticatedPageProps = InferGetServerSidePropsType<
  typeof getServerSideProps
>;

const Home: NextPage = ({ address, session }: AuthenticatedPageProps) => {
  const store = useContext(Context);
  const router = useRouter();

  useEffect(() => {
    if (!address) {
      router.push("/login");
    }

    store.setUser(session);
  }, []);

  console.log(address);
  return (
    <div className="h-fit pb-16 bg-white">
      <Navbar />
      {address ? <HomeComponent /> : <h1>Unauthenticated</h1>}
    </div>
  );
};
export default Home;
