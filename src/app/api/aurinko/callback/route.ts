import { waitUntil } from '@vercel/functions'
import axios, { AxiosError } from "axios";
import { exchangeCodeForAccessToken, getAccountDetails } from "@/lib/aurinko";
import { db } from "@/server/db";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  try {
    const { userId } = await auth();
    if (!userId)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    // Checking if user exists
    let user = await db.user.findUnique({
      where: { id: userId }
    });

    // creating user if they don't exist
    if (!user) {
      try {
        // Getting user data from Clerk
        const clerkUser = await clerkClient.users.getUser(userId);
        
        // Creating user in database
        user = await db.user.create({
          data: {
            id: userId,
            emailAddress: clerkUser.emailAddresses?.[0]?.emailAddress ?? '',
            firstName: clerkUser.firstName ?? '',
            lastName: clerkUser.lastName ?? '',
            imageUrl: clerkUser.imageUrl ?? null,
          },
        });
        
        console.log('Created new user:', user);
      } catch (error) {
        console.error('Error creating user:', error);
        return NextResponse.json(
          { message: "Failed to create user record" },
          { status: 500 }
        );
      }
    }

    const params = req.nextUrl.searchParams;
    const status = params.get("status");
    if (status !== "success")
      return NextResponse.json(
        { message: "Failed to link account" },
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

    try {
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
    } catch (error) {
      console.error('Error upserting account:', error);
      return NextResponse.json(
        { message: "Failed to create or update account" },
        { status: 500 }
      );
    }

    waitUntil(
      axios.post(`${process.env.NEXT_PUBLIC_URL}/api/initial-sync`, {
        accountId: token.accountId.toString(),
        userId
      })
      .then((res) => {
        console.log(res.data)
      })
      .catch(err => {
        console.log(err.response?.data || err.message)
      })
    );

    return NextResponse.redirect(new URL('/mail', req.url));
  } catch (error) {
    console.error('Unhandled error in callback route:', error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
};