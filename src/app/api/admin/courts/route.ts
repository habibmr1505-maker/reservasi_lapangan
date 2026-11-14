import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { z } from "zod";
const schema=z.object({namaLapangan:z.string().trim().min(2).max(100),jenisOlahraga:z.string().trim().min(2).max(60),tarifRegulerPerJam:z.coerce.number().min(0),tarifMalamPerJam:z.coerce.number().min(0)});
export async function POST(req:Request){const u=await getSession();if(!u||u.role!=="ADMIN")return NextResponse.json({error:"Hanya admin yang boleh mengubah master data."},{status:403});const p=schema.safeParse(await req.json().catch(()=>null));if(!p.success)return NextResponse.json({error:"Data lapangan tidak valid."},{status:400});const c=await prisma.court.create({data:p.data});return NextResponse.json({...c,tarifRegulerPerJam:Number(c.tarifRegulerPerJam),tarifMalamPerJam:Number(c.tarifMalamPerJam)},{status:201});}
