"use server";
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';

const VALID_VEHICLE_STATUSES = ['AVAILABLE', 'IN_TRANSIT', 'MAINTENANCE'] as const;

type VehicleStatus = (typeof VALID_VEHICLE_STATUSES)[number];

export async function createVehicle(formData: FormData) {
  const licensePlate = formData.get('licensePlate') as string;
  const model = formData.get('model') as string;
  const make = formData.get('make') as string;
  const year = parseInt(formData.get('year') as string, 10);
  const capacity = parseFloat(formData.get('capacity') as string);
  const statusInput = formData.get('status');
  const status =
    typeof statusInput === 'string' && VALID_VEHICLE_STATUSES.includes(statusInput as VehicleStatus)
      ? (statusInput as VehicleStatus)
      : 'AVAILABLE';

     if (!licensePlate || !make || !model) {
    return { success: false, error: 'Please fill in all required fields.' };
  }

  try {
    const vehicle = await prisma.vehicle.create({
      data: {
        licensePlate,
        model,
        make,
        year,
        capacity,
        status,
      },
    });
    revalidatePath('/fleet');
    return { success: true, data: vehicle };
  } catch (error) {
    console.error('Failed to register vehicle: ',error);
    return {success:false,error:"Database error.Registartion Failed"};

  }
}