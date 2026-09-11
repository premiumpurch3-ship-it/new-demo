import {NextResponse} from "next/server"; import {query} from "@/lib/db";
export async function GET(){try{await query("select 1");return NextResponse.json({ok:true,database:"connected",timestamp:new Date().toISOString()});}catch(e){return NextResponse.json({ok:false,database:"error",error:e instanceof Error?e.message:"Database unavailable"},{status:503});}}
