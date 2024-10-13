
export const POST = async (req: Request) => {
    const { data } = await req.json();
    console.log('webhook received',data);
    return new Response ('webhook received', {status: 200} )
}