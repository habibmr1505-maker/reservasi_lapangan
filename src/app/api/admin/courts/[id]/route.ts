import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { z } from "zod";
export async function PATCH(req:Request,{params}:{params:Promise<{id:string}>}){const u=await getSession();if(!u||u.role!=="ADMIN")return NextResponse.json({error:"Akses admin diperlukan."},{status:403});const id=Number((await params).id);const p=z.object({statusAktif:z.boolean()}).safeParse(await req.json().catch(()=>null));if(!Number.isInteger(id)||!p.success)return NextResponse.json({error:"Data tidak valid."},{status:400});const c=await prisma.court.update({where:{id},data:{statusAktif:p.data.statusAktif}});return NextResponse.json({...c,tarifRegulerPerJam:Number(c.tarifRegulerPerJam),tarifMalamPerJam:Number(c.tarifMalamPerJam)});}
