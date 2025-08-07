// User Types
export interface User {
  id: string;
  email: string;
  role: 'customer' | 'craftsman' | 'business' | 'property_manager' | 'insurance' | 'admin';
  segment: 'hausbesitzer' | 'handwerker' | 'gewerbe' | 'mieter' | 'vermieter' | 'property_manager' | 'versicherung';
  isVerified: boolean;
  profileCompleted: boolean;
  onboardingStep: number;
  createdAt: Date;
  updatedAt: Date;
}

// Job Types
export interface Job {
  id: string;
  customerId: string;
  title: string;
  description: string;
  location: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  category: string;
  budget: {
    min: number;
    max: number;
  };
  urgency: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  assignedCraftsmanId?: string;
  images?: string[];
  createdAt: Date;
  updatedAt: Date;
  deadline?: Date;
}

// Application Types
export interface JobApplication {
  id: string;
  jobId: string;
  craftsmanId: string;
  offerPrice: number;
  message: string;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  createdAt: Date;
  updatedAt: Date;
}

// Review Types
export interface Review {
  id: string;
  reviewerId: string;
  targetId: string;
  targetType: 'craftsman' | 'customer' | 'product' | 'job';
  rating: number;
  comment: string;
  helpful: number;
  reported: boolean;
  createdAt: Date;
}

// Marketplace Types
export interface Product {
  id: string;
  sellerId: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  images: string[];
  condition: 'new' | 'used' | 'refurbished';
  location: string;
  isPremium: boolean;
  status: 'active' | 'sold' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id: string;
  productId: string;
  buyerId: string;
  sellerId: string;
  quantity: number;
  totalPrice: number;
  status: 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled';
  shippingAddress: Address;
  paymentMethod: string;
  createdAt: Date;
  updatedAt: Date;
}

// Profile Types
export interface CustomerProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: Address;
  propertyType: string;
  preferredContact: string;
  createdAt: Date;
}

export interface CraftsmanProfile {
  id: string;
  userId: string;
  companyName: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: Address;
  skills: string[];
  experience: number;
  documents: {
    businessLicense?: string;
    insurance?: string;
    certifications?: string[];
  };
  verifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface BusinessProfile {
  id: string;
  userId: string;
  companyName: string;
  taxId: string;
  employeeCount: number;
  businessType: string;
  address: Address;
  website?: string;
  createdAt: Date;
}

// Address Type
export interface Address {
  street: string;
  city: string;
  postalCode: string;
  country: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

// Verification Types
export interface VerificationRequest {
  id: string;
  userId: string;
  type: 'craftsman' | 'business' | 'customer';
  status: 'pending' | 'approved' | 'rejected';
  documents: {
    identity?: string;
    businessLicense?: string;
    insurance?: string;
    references?: string[];
  };
  requestedAt: Date;
  verifiedAt?: Date;
  verifiedBy?: string;
  notes?: string;
}

// Subscription Types
export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: 'active' | 'cancelled' | 'past_due' | 'unpaid';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  trialEnd?: Date;
  stripeSubscriptionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  type: 'craftsman' | 'customer' | 'business';
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  limits: Record<string, number>;
  stripePriceId: string;
}

// Commission Types
export interface Commission {
  id: string;
  transactionId: string;
  transactionType: 'job' | 'marketplace_sale' | 'service';
  amount: number;
  commissionRate: number;
  commissionAmount: number;
  status: 'pending' | 'calculated' | 'paid' | 'cancelled';
  createdAt: Date;
  paidAt?: Date;
}

// Lead Types
export interface Lead {
  id: string;
  customerId: string;
  craftsmanId: string;
  jobId: string;
  status: 'generated' | 'qualified' | 'contacted' | 'converted' | 'lost';
  quality: 'low' | 'medium' | 'high';
  value: number;
  commission: number;
  createdAt: Date;
  convertedAt?: Date;
}

// Advertisement Types
export interface Advertisement {
  id: string;
  advertiserId: string;
  type: 'featured_listing' | 'sponsored_post' | 'banner' | 'category_sponsorship';
  title: string;
  description: string;
  imageUrl?: string;
  targetUrl: string;
  budget: number;
  spent: number;
  status: 'active' | 'paused' | 'completed' | 'rejected';
  startDate: Date;
  endDate: Date;
  targeting: {
    location?: string[];
    category?: string[];
    userType?: string[];
  };
  metrics: {
    impressions: number;
    clicks: number;
    conversions: number;
    ctr: number;
    cpc: number;
  };
  createdAt: Date;
}

// Support Types
export interface SupportTicket {
  id: string;
  userId: string;
  subject: string;
  description: string;
  category: 'technical' | 'billing' | 'general' | 'feature-request' | 'complaint';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in-progress' | 'waiting' | 'resolved' | 'closed';
  assignedTo?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  messages: TicketMessage[];
  attachments: string[];
  satisfaction?: number;
}

export interface TicketMessage {
  id: string;
  senderId: string;
  senderType: 'user' | 'agent' | 'system';
  message: string;
  timestamp: Date;
  attachments?: string[];
}

// Analytics Types
export interface AnalyticsData {
  users: {
    total: number;
    newThisMonth: number;
    activeThisMonth: number;
    bySegment: Record<string, number>;
  };
  jobs: {
    total: number;
    postedThisMonth: number;
    completedThisMonth: number;
    avgCompletionTime: number;
  };
  revenue: {
    total: number;
    thisMonth: number;
    bySource: Record<string, number>;
  };
  engagement: {
    avgSessionDuration: number;
    bounceRate: number;
    conversionRate: number;
  };
}

