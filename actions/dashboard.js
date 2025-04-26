"use server"

import { auth } from "@clerk/nextjs/server"
import { db } from "@lib/prisma";
import { revalidatePath } from "next/cache";

//converting the account balance of float to number because nextjs is not able to serialize float numbers
const serializedTransaction = (obj) => {
    const serialized = {...obj};

    if(obj.balance){
        serialized.balance = obj.balance.toNumber();
    }
}

export async function createAccount(data){
    try{
        const {userId} = await auth();
        if(!userId) throw new Error("Unauthorized");
         
        const user = await db.User.findUnique({
            where: { clerkUserId: userId},
        });

        if(!user){
            throw new Error("No user found");
        }

        // convert the balance before saving
        const balanceFloat = parseFloat(data.balance);
        if(isNaN(balanceFloat)){
            throw new Error("Invalid balance amount");
        }

        // check inf the user already have a account
        const existingAccount = await db.account.findMany({
            where: {
                userId: user.id
            }
        });

        // if user has no or having account return  accordingly
        const shouldBeDefault = existingAccount.length===0?true:data.isDefault;

        //one account at one time should be a default account
        if(shouldBeDefault){
            await db.account.updateMany({
                where: {userId: user.id, isDefault: true},
                data: {isDefault: false}
            });
        }

        const account = await db.account.create({
            data: {
                ...data,
                balance: balanceFloat,
                userId: user.id,
                isDefault: shouldBeDefault,
            }
        });

        const serializedAccount = serializedTransaction(account);

        revalidatePath("/dashboard");
        return {success: true, data: serializedAccount};

    }catch(err){
        throw new Error (error.message);
    }
}