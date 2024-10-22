import { Account } from "@/lib/account";
import { syncEmailsToDatabase } from "@/lib/sync-to-db";
import { db } from "@/server/db";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  const body = await req.json()
  const { accountId, userId } = body
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

   const response = await account.performInitialSync()
   if (!response) {
      return NextResponse.json({ error: "Failed to perform initial sync" }, { status: 500 });
   }
   const { deltaToken, emails } = response

   await syncEmailsToDatabase(emails, accountId)



   await db.account.update({
    where: {
      id: accountId
    },
    data: {
      nextDeltaToken: deltaToken
    }

   })

   

   console.log('completed sync', deltaToken)
   return NextResponse.json({ success: true, deltaToken }, {status: 200})
};
