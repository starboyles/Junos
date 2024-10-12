import { db } from "@/server/db";

await db.user.create({
    data: {
    emailAddress: 'testing@gmail.com',
    firstName: 'Leslie',
    lastName: 'Gyamfi'  ,
    imageUrl: ''  
}
});