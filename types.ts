export enum UserType {
  CLIENT = 'client',
  ADMIN = 'admin', // Represents a Barbershop owner/manager
}

// Supabase specific metadata types
export interface UserMetadata {
  name?: string;
  phone?: string;
  // Any other custom fields you store in user_metadata
}

export interface AppMetadata {
  user_type?: UserType;
  barbershop_name?: string; // Only for admin users
  initial_address?: string; // For initial setup of barbershop
  // Any other custom fields you store in app_metadata
}

export interface User {
  id: string; // Supabase user ID
  email?: string; // Supabase email
  user_metadata?: UserMetadata;
  app_metadata?: AppMetadata;
  // Deprecated fields, to be derived from metadata
  type: UserType; // Will derive from app_metadata.user_type
  name?: string; // Will derive from user_metadata.name
  phone?: string; // Will derive from user_metadata.phone
  barbershopName?: string; // Will derive from app_metadata.barbershop_name
  address?: string; // Will derive from app_metadata.initial_address
}


export interface Service {
  id: string;
  barbershopId: string; // Foreign key to BarbershopProfile.id (which is a user.id)
  name: string;
  price: number;
  duration: number; // in minutes
  isActive: boolean;
  description?: string;
}

export interface Barber {
  id: string;
  barbershopId: string;
  name: string;
  availableHours: { dayOfWeek: number; start: string; end: string }[]; // 0 for Sunday, 6 for Saturday
  assignedServices: string[]; // array of service IDs
}

export interface Appointment {
  id: string;
  clientId: string;
  clientName?: string; // Denormalized for easier display
  barbershopId: string;
  barbershopName?: string; // Denormalized
  serviceId: string;
  serviceName?: string; // Denormalized
  barberId?: string; // Optional: if specific barber chosen
  barberName?: string; // Denormalized
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  status: 'scheduled' | 'completed' | 'cancelled_by_client' | 'cancelled_by_admin';
  notes?: string;
  createdAt: string; // ISO date string
}

export interface Review {
  id: string;
  appointmentId: string;
  clientId: string;
  clientName?: string; // Denormalized
  barbershopId: string;
  rating: number; // 1-5
  comment?: string;
  createdAt: string; // ISO date string
  reply?: string; // Admin's reply
  replyAt?: string; // ISO date string
}

export enum SubscriptionPlanTier {
  FREE = 'free',
  PRO = 'pro',
  PREMIUM = 'premium',
}

export interface SubscriptionPlan {
  id: SubscriptionPlanTier;
  name: string;
  price: number; // per month
  appointmentLimit: number | 'unlimited';
  employeeLimit: number | 'unlimited';
  features: string[];
}

export interface BarbershopSubscription {
  barbershopId: string; // user.id of the admin
  planId: SubscriptionPlanTier;
  status: 'active' | 'inactive' | 'past_due' | 'cancelled'; // inactive could mean payment failed
  startDate: string; // ISO date string
  endDate?: string; // ISO date string for fixed term or cancellation
  nextBillingDate?: string; // ISO date string
}

export interface BarbershopProfile {
  id: string; // same as user.id for admin type user
  name: string; // Barbershop name
  responsibleName: string;
  email: string; // Contact email for the barbershop (often same as user's email)
  phone: string;
  address: string;
  description?: string;
  logoUrl?: string; // URL to logo image
  coverPhotoUrl?: string; // URL to cover photo image
  workingHours: { dayOfWeek: number; start: string; end: string; isOpen: boolean }[];
  // Other settings like cover images, specific theme colors could be added later
}

export interface NotificationMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

// New type for the find barbershops page
export interface BarbershopSearchResultItem extends BarbershopProfile {
  averageRating: number;
  reviewCount: number;
  sampleServices: Pick<Service, 'id' | 'name' | 'price'>[]; 
}