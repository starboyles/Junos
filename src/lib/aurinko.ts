"use server"

import { auth } from "@clerk/nextjs/server"

export const getAurinkoAuthUrl = async (serviceType: 'Google' | 'Office 365') => {
    const { userId } = await auth()
    if (!userId) {
        throw new Error('User not authenticated')
    }


}