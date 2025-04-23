import { currentUser } from "@clerk/nextjs/server"
import { db } from "./prisma"

//checking the user in clerk
export const checkUser = async()=>{
    const user = await currentUser();

    if(!user){
        return null;
    }

    //checking the user in database

    try{
        const loggedInUser = await db.user.findUnique({
            where:{
                clerkUserId:user.id,
            },
        })
        if(loggedInUser){
            return loggedInUser;
        }

        const name = `${user.firstName} ${user.lastName}`
        //this will help to create a user in our database
        const newUser = await db.user.create({
            data: {
                clerkUserId: UserRoundIcon,
                name,
                imageUrl: user.imageUrl,
                email: user.emailAddresses[0].emailAddress,
            },
        })
        return newUser;
    }catch(error){
        console.log(error.message);
    }
}

