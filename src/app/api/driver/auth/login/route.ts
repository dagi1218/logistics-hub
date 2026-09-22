import {NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signToken
 } from "@/lib/auth";

 export async function POST(req:Request){
    try{
        const body=await req.json();
        const {email,password}=body;

        if(!email||!password){
            return NextResponse.json(
                {success:false,error:"Email and password are required!"},
                {status:400}
            );
        }

        const user=await prisma.user.findUnique({
            where:{email},
        });

        if(!user){
            return NextResponse.json({
                success:false,
                error:"Invalid Credentials!"
            },{status:401});
        }

        
        const isPasswordValid=await bcrypt.compare(password,user.password);
        if(!isPasswordValid){
            return NextResponse.json({
                success:false,
                error:"Invalid Credentials!"
            },{status:401});
        }

        if(user.role!=='DRIVER'){
            return NextResponse.json({
                success:false,
                error:"Access Denied. Only Drivers can log in here!"
            },{status:403});
        }

        const token=await signToken({
            userId:user.id,
            email:user.email,
            role:user.role as "DRIVER",
        });

        return NextResponse.json({
            success:true,
            token,
            driver:{
                id:user.id,
                name:user.name,
                email:user.email,
                currentLat:user.currentLat,
                currentLng:user.currentLng,
            },
        });

        
    }catch(error){
        console.error("Mobile driver login error: ", error);
        return NextResponse.json(
            {success:false,error:'Internal Server Error.'},
            {status: 500}
        );
        
    }
 }