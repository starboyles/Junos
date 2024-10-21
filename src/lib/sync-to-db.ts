import { db } from "@/server/db";
import { EmailMessage, EmailAddress, EmailAttachment, EmailHeader } from "@/types";
import pLimit from 'p-limit';

export async function syncEmailsToDatabase(emails: EmailMessage[], accountId: string){
    console.log('attempting to sync database', emails.length)
    const limit = pLimit(10)

    try {
        Promise.all(emails.map((email, index) => upsertEmail(email, accountId, index)))
    } catch (error) {
        console.log('oops', error)
    }
}

async function upsertEmail(email: EmailMessage, accountId: string, index: number) {
    console.log('upserting email', email)
try {
    let emailLabelType: 'inbox' | 'sent' | 'draft' = 'inbox'
    if (email.sysLabels.includes('inbox') || email.sysLabels.includes('important')) {
        emailLabelType = 'inbox'
} else if (email.sysLabels.includes('sent')) {
    emailLabelType = 'sent'
} else if (email.sysLabels.includes('draft')) {
    emailLabelType = 'draft'
}

const addressesToUpsert = new Map()
for (const address of [email.from, ...email.to, ...email.cc, ...email.bcc, ...email.replyTo]) {
    addressesToUpsert.set(address.address, address)
}

for (const address of addressesToUpsert.values()) {
 
}
} catch (error) {
    
}
}

async function upsertEmailAddress(address: EmailAddress, accountId: string) {
    try {
        const existingAddress = await db.emailAddress.findUnique({
            where: { accountId_address: { accountId: accountId, address: address.address ?? "" } },
        });

        if (existingAddress) {
            return await db.emailAddress.update({
                where: { id: existingAddress.id },
                data: { name: address.name, raw: address.raw },
            });
        } else {
            return await db.emailAddress.create({
                data: { address: address.address ?? "", name: address.name, raw: address.raw, accountId },
            })};
    } catch (error) {
        console.log('Failure to upsert email address', error)
        return null
    }
}


