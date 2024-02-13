import React from "react";
import type {
  GetServerSideProps,
  InferGetServerSidePropsType,
  NextPage,
} from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import type { SSRConfig } from "next-i18next";
// import { useTranslation } from "next-i18next";
import { Container } from "@mui/material";
import { useTranslation } from "next-i18next";
export const getServerSideProps: GetServerSideProps<SSRConfig> = async ({
  locale,
}) => {
  const content = await serverSideTranslations(locale ?? "en", ["common"]);

  return {
    props: {
      ...content,
    },
  };
};

const Page: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({}) => {
  const { t, ready } = useTranslation("common");
  if (!ready) return <div>Loading...</div>;
  return (
    <Container>
      Hello there,
      {<p>{t("description")}</p>}
    </Container>
  );
};

export default Page;
