import { Account } from "@/lib/account";
import { db } from "@/server/db";
import { NextRequest, NextResponse } from "next/server";


export const POST = async (req: NextRequest) => {
  const { accountId, userId } = await req.json();
  if (!accountId || !userId) {
    return NextResponse.json(
      { error: "Missing accountId or userId" },
      { status: 400 },
    );
  }
  const dbAccount = await db.account.findUnique({
    where: {
      id: accountId,
      userId,
    },
  })
  if (!dbAccount) 
    return NextResponse.json({ error: "Account not found" }, { status: 404 });

   const account = new Account(dbAccount.accessToken) 
   const emails = await performInitialSync()
   await syncEmailsToDatabase(emails)
};
