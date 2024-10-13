import { db } from "@/server/db";

export const POST = async (req: Request) => {
  const { data } = await req.json();
  console.log("webhook received", data);
  const emailAddress = data.email_addresses[0].email_address;
  const firstName = data.first_name;
  const lastName = data.last_name;
  const imageUrl = data.image_url;
  const id = data.id;

  await db.user.create({
    data: {
          id: id,
          firstName: firstName,
          lastName: lastName,
          imageUrl: imageUrl, 
          emailAddress: emailAddress, 
        },
  });

  return new Response("webhook received", { status: 200 });
};
