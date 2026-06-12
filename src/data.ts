export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: 'user' | 'mechanic' | 'admin';
  createdAt: string;
  isActive: boolean;
}

export interface Vehicle {
  id: string;
  userId: string;
  model: string;
  plateNumber: string;
  year: string;
  color: string;
  type: string;
}

export interface ClientRequest {
  id: string;
  userId: string;
  clientName: string;
  phone: string;
  vehicleModel: string;
  plateNumber: string;
  issueDescription: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'approved' | 'in-progress' | 'completed' | 'cancelled' | 'rejected';
  adminStatus: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  mechanicNotes?: string;
  repairs: Repair[];
  cost?: number;
  trackingCode: string;
  mechanicId?: string | null;
  mechanicName?: string;
  acceptedAt?: string;
  images: string[];
  audioFiles: string[];
  rating?: { score: number; comment: string; createdAt: string };
}

export interface Repair {
  id: string;
  date: string;
  description: string;
  partsUsed: string[];
  laborHours: number;
  cost: number;
  mechanic: string;
  status: 'pending' | 'in-progress' | 'completed';
}

export interface MechanicProfile {
  id: string;
  userId: string;
  fullName: string;
  nationalId: string;
  phone: string;
  email: string;
  address: string;
  specialty: string;
  experienceYears: number;
  workshopName: string;
  workshopAddress: string;
  bio: string;
  avatar: string;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  ratings: { score: number; comment: string; userId: string; createdAt: string }[];
  avgRating: number;
  totalRatings: number;
}

export interface AdminStats {
  totalUsers: number;
  totalMechanics: number;
  totalRequests: number;
  totalCompleted: number;
  totalApprovedRequests: number;
  pendingApprovals: number;
  pendingMechanics: number;
}

export const initialUsers: User[] = [
  { id: 'admin1', fullName: 'ادمین', email: 'admin@carsense.com', phone: '09120000000', role: 'admin', createdAt: '1404/01/01', isActive: true },
];

export const initialMechanicProfiles: MechanicProfile[] = [];

export const initialRequests: ClientRequest[] = [];

export const initialVehicles: Vehicle[] = [];

export const initialPasswords: Record<string, string> = { 'admin@carsense.com': 'admin123' };
