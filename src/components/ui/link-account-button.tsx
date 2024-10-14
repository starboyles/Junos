"use client";
import React from "react";
import { Button } from "./button";
import { getAurinkoAuthUrl } from "@/lib/aurinko";

const LinkAccountButton = () => {
  return (
    <Button
      onClick={async () => {
        const authUrl = await getAurinkoAuthUrl("Google");
        console.log(authUrl);
      }}
    >
      Link Account
    </Button>
  );
};
export default LinkAccountButton;
