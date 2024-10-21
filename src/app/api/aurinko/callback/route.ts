// /api/aurinko/callback
import { waitUntil } from '@vercel/functions'
import axios, { AxiosError } from "axios";
import { exchangeCodeForAccessToken, getAccountDetails } from "@/lib/aurinko";
import { db } from "@/server/db";
import { auth, EmailAddress } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const params = req.nextUrl.searchParams;
  const status = params.get("status");
  if (status != "success")
    return NextResponse.json(
      { message: "Failed too link acccount" },
      { status: 400 },
    );

  const code = params.get("code");
  if (!code)
    return NextResponse.json({ message: "No code provided" }, { status: 400 });
  const token = await exchangeCodeForAccessToken(code);
  if (!token)
    return NextResponse.json(
      { message: "Failed to exchange code for access token" },
      { status: 400 },
    );

  const accountDetails = await getAccountDetails(token.accessToken);
  if (!accountDetails)
    return NextResponse.json(
      { message: "Failed to retrieve account details" },
      { status: 400 },
    );

  await db.account.upsert({
    where: {
      id: token.accountId.toString(),
    },
    update: {
      accessToken: token.accessToken,
    },
    create: {
      id: token.accountId.toString(),
      userId,
      emailAddress: accountDetails.email,
      name: accountDetails.name,
      accessToken: token.accessToken,
    },
  });

  waitUntil(axios.post(`${process.env.NEXT_PUBLIC_URL}/api/initial-sync`, {
    accountId: token.accountId.toString(),
    userId
  }).then(response => {
    console.log('Initial sync triggered', response.data)
  }).catch(error => {
    console.error('Failed to trigger initial sync', error)
  })
)
  

  return NextResponse.redirect(new URL ('/mail', req.url));
};
