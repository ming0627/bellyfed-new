// This file contains global type declarations for the frontend package

// Declare UI components
declare module '@/components/ui/avatar' {
  export const Avatar: React.ComponentType<any>;
  export const AvatarFallback: React.ComponentType<any>;
  export const AvatarImage: React.ComponentType<any>;
}

declare module '@/components/ui/button' {
  export const Button: React.ComponentType<any>;
  export const buttonVariants: any;
}

declare module '@/components/ui/dialog' {
  export const Dialog: React.ComponentType<any>;
  export const DialogTrigger: React.ComponentType<any>;
  export const DialogContent: React.ComponentType<any>;
  export const DialogHeader: React.ComponentType<any>;
  export const DialogTitle: React.ComponentType<any>;
  export const DialogDescription: React.ComponentType<any>;
  export const DialogFooter: React.ComponentType<any>;
  export const DialogClose: React.ComponentType<any>;
}

declare module '@/components/ui/input' {
  export const Input: React.ComponentType<any>;
}

declare module '@/components/ui/badge' {
  export const Badge: React.ComponentType<any>;
}

declare module '@/components/ui/label' {
  export const Label: React.ComponentType<any>;
}

declare module '@/components/ui/radio-group' {
  export const RadioGroup: React.ComponentType<any>;
  export const RadioGroupItem: React.ComponentType<any>;
}

declare module '@/components/ui/select' {
  export const Select: React.ComponentType<any>;
  export const SelectContent: React.ComponentType<any>;
  export const SelectItem: React.ComponentType<any>;
  export const SelectTrigger: React.ComponentType<any>;
  export const SelectValue: React.ComponentType<any>;
}

declare module '@/components/ui/tabs' {
  export const Tabs: React.ComponentType<any>;
  export const TabsContent: React.ComponentType<any>;
  export const TabsList: React.ComponentType<any>;
  export const TabsTrigger: React.ComponentType<any>;
}

declare module '@/components/ui/textarea' {
  export const Textarea: React.ComponentType<any>;
}

declare module '@/components/ui/use-toast' {
  export const useToast: () => any;
}

declare module '@/components/ui/card' {
  export const Card: React.ComponentType<any>;
  export const CardContent: React.ComponentType<any>;
  export const CardHeader: React.ComponentType<any>;
  export const CardTitle: React.ComponentType<any>;
  export const CardDescription: React.ComponentType<any>;
  export const CardFooter: React.ComponentType<any>;
}

declare module '@/components/ui/dynamic-content' {
  export const DynamicContent: React.ComponentType<any>;
}

declare module '@/components/ui/client-only' {
  export const ClientOnly: React.ComponentType<any>;
}

declare module '@/components/ui/collapsible' {
  export const Collapsible: React.ComponentType<any>;
  export const CollapsibleContent: React.ComponentType<any>;
  export const CollapsibleTrigger: React.ComponentType<any>;
}

declare module '@/components/ui/command' {
  export const Command: React.ComponentType<any>;
  export const CommandGroup: React.ComponentType<any>;
  export const CommandItem: React.ComponentType<any>;
  export const CommandList: React.ComponentType<any>;
  export const CommandInput: React.ComponentType<any>;
  export const CommandEmpty: React.ComponentType<any>;
  export const CommandSeparator: React.ComponentType<any>;
}

declare module '@/components/ui/custom-tabs' {
  export const CustomTabs: React.ComponentType<any>;
  export const TabsContent: React.ComponentType<any>;
}

declare module '@/components/ui/lucide-icon' {
  export const LucideClientIcon: React.ComponentType<any>;
}

declare module '@/components/ui/skeleton' {
  export const Skeleton: React.ComponentType<any>;
}

declare module '@/components/ui/scroll-area' {
  export const ScrollArea: React.ComponentType<any>;
}

declare module '@/components/ui/popover' {
  export const Popover: React.ComponentType<any>;
  export const PopoverContent: React.ComponentType<any>;
  export const PopoverTrigger: React.ComponentType<any>;
}

declare module '@/components/ui/search-field' {
  export const SearchField: React.ComponentType<any>;
}

declare module '@/components/ui/tooltip' {
  export const Tooltip: React.ComponentType<any>;
  export const TooltipContent: React.ComponentType<any>;
  export const TooltipProvider: React.ComponentType<any>;
  export const TooltipTrigger: React.ComponentType<any>;
}

declare module '@/components/ui/progress' {
  export const Progress: React.ComponentType<any>;
}

declare module '@/components/ui/alert-dialog' {
  export const AlertDialog: React.ComponentType<any>;
  export const AlertDialogAction: React.ComponentType<any>;
  export const AlertDialogCancel: React.ComponentType<any>;
  export const AlertDialogContent: React.ComponentType<any>;
  export const AlertDialogDescription: React.ComponentType<any>;
  export const AlertDialogFooter: React.ComponentType<any>;
  export const AlertDialogHeader: React.ComponentType<any>;
  export const AlertDialogTitle: React.ComponentType<any>;
  export const AlertDialogTrigger: React.ComponentType<any>;
}

declare module '@/components/ui/calendar' {
  export const Calendar: React.ComponentType<any>;
}

declare module '@/components/ui/sheet' {
  export const Sheet: React.ComponentType<any>;
  export const SheetClose: React.ComponentType<any>;
  export const SheetContent: React.ComponentType<any>;
  export const SheetDescription: React.ComponentType<any>;
  export const SheetFooter: React.ComponentType<any>;
  export const SheetHeader: React.ComponentType<any>;
  export const SheetTitle: React.ComponentType<any>;
  export const SheetTrigger: React.ComponentType<any>;
}

declare module '@/components/ui/slider' {
  export const Slider: React.ComponentType<any>;
}

declare module '@/components/ui/photo-uploader' {
  export const PhotoUploader: React.ComponentType<any>;
}

// Declare contexts
declare module '@/contexts/CountryContext' {
  export const useCountry: () => any;
}

declare module '@/contexts/AuthContext' {
  export const useAuth: () => any;
}

// Declare utils
declare module '@/utils/image' {
  export const getImageUrl: (path: string) => string;
}

declare module '@/utils/imageCompression' {
  export const compressImage: (file: File) => Promise<File>;
  export const validateImageFile: (file: File) => boolean;
}

declare module '@/utils/events' {
  export const updateUserEvent: (userId: string, eventType: string, data: any) => void;
}

// Declare config
declare module '@/config/countries' {
  export const COUNTRIES: any[];
}

declare module '@/config/restaurant' {
  export const CUISINE_TYPES: any[];
  export const CuisineType: any;
  export const PRICE_RANGES: any[];
  export const PriceRange: any;
}

declare module '@/config/restaurantConfig' {
  export const CuisineType: any;
}

// Declare services
declare module '@/services/rankingService' {
  export const rankingService: any;
}

declare module '@/services/databaseService' {
  export const databaseService: any;
}

declare module '@/services/restaurantService' {
  export const restaurantService: any;
}

declare module '@/services/postgresService' {
  export const postgresService: any;
}

declare module '@/services/openai' {
  export const OpenAIService: any;
}

// Generic module declarations
declare module '@/components/*' {}
declare module '@/contexts/*' {}

declare module '@/hooks/useAuth' {
  export const useAuth: () => any;
}

declare module '@/hooks/*' {}
declare module '@/services/*' {}
declare module '@/utils/*' {}

declare module '@/types' {
  export interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string | S3Object;
    bio?: string;
    location?: string;
    interests?: Interest[];
    followers?: number;
    following?: number;
    points?: number;
    rank?: number;
    createdAt?: string;
    updatedAt?: string;
    [key: string]: any;
  }

  export interface FoodCategory {
    id: string;
    name: string;
    icon?: string;
    [key: string]: any;
  }

  export interface FoodEstablishment {
    id: string;
    name: string;
    address?: string;
    cuisine?: string;
    rating?: number;
    image?: string;
    [key: string]: any;
  }

  export interface DishCategory {
    id: string;
    name: string;
    [key: string]: any;
  }

  export interface MenuItem {
    id: string;
    name: string;
    [key: string]: any;
  }

  export interface MenuItemRanking {
    id: string;
    menuItem: MenuItem;
    [key: string]: any;
  }

  export interface RankingCategory {
    id: string;
    name: string;
    [key: string]: any;
  }
}

  export interface Review {
    id: string;
    userId: string;
    restaurantId?: string;
    establishmentId?: string;
    dishName?: string;
    rating: number;
    comment?: string;
    notes?: string;
    visitStatus?: string;
    photos?: any[];
    rank?: any;
    date?: string;
    visitDate?: string;
    createdAt?: string;
    updatedAt?: string;
    [key: string]: any;
  }

  export interface Post {
    id: string;
    userId: string;
    content: string;
    date?: string;
    photos?: any[];
    video?: any;
    hashtags?: string[];
    location?: string;
    likeCount?: number;
    postedBy?: any;
    createdAt?: string;
    updatedAt?: string;
    [key: string]: any;
  }

  export interface S3Object {
    key: string;
    url: string;
    [key: string]: any;
  }

  export interface PostedBy {
    id: string;
    name: string;
    avatar?: string;
    [key: string]: any;
  }

  export interface Achievement {
    id: string;
    name: string;
    description?: string;
    icon?: string;
    points?: number;
    dateEarned?: string;
    category?: string;
    createdAt?: string;
    updatedAt?: string;
    [key: string]: any;
  }

  export interface Interest {
    id: string;
    name: string;
    [key: string]: any;
  }

  export interface Certificate {
    id: string;
    name: string;
    issuer: string;
    date: string;
    [key: string]: any;
  }

  export interface MenuItem {
    id: string;
    name: string;
    description?: string;
    price: number;
    [key: string]: any;
  }

  export interface MenuItemRanking {
    id: string;
    menuItemId: string;
    userId: string;
    rank: number;
    [key: string]: any;
  }

  export enum RankingCategory {
    GLOBAL = 'global',
    LOCAL = 'local',
    PERSONAL = 'personal',
    PLAN_TO_VISIT = 'plan_to_visit',
  }

  export enum VisitStatus {
    VISITED = 'visited',
    WANT_TO_VISIT = 'want_to_visit',
    NOT_INTERESTED = 'not_interested',
  }

declare module '@/types/restaurant' {
  export interface Restaurant {
    id: string;
    name: string;
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    phone?: string;
    website?: string;
    description?: string;
    photos?: string[];
    [key: string]: any;
  }

  export interface RestaurantWithDishes extends Restaurant {
    dishes: {
      id: string;
      name: string;
      description?: string;
      price?: number;
      photos?: string[];
      [key: string]: any;
    }[];
  }

  export interface RestaurantLocation {
    lat: number;
    lng: number;
  }

  export interface RestaurantHours {
    day: string;
    open: string;
    close: string;
  }

  export interface RestaurantReview {
    id: string;
    userId: string;
    rating: number;
    comment: string;
    date: string;
    [key: string]: any;
  }
}

declare module '@/config/*' {}

// Declare lib modules
declare module '@/lib/utils' {
  export function cn(...inputs: any[]): string;
}

declare module '@/lib/db' {
  export const prisma: any;
}

declare module '@/lib/db/index.js' {
  export const prisma: any;
}

declare module '@/lib/auth' {
  export const auth: () => Promise<any>;
}

declare module '@/lib/auth/index.js' {
  export const auth: () => Promise<any>;
}

declare module '@/lib/outbox' {
  export function createOutboxEvent(type: string, payload: any, aggregateId: string): Promise<any>;
}

declare module '@/lib/outbox/index.js' {
  export function createOutboxEvent(type: string, payload: any, aggregateId: string): Promise<any>;
  export function createOutboxEventInTransaction(type: string, payload: any, aggregateId: string): Promise<any>;
  export enum ImportEventType {
    IMPORT_JOB_CREATED = 'IMPORT_JOB_CREATED',
    IMPORT_BATCH_CREATED = 'IMPORT_BATCH_CREATED',
    IMPORT_DATA_PROCESSED = 'IMPORT_DATA_PROCESSED',
  }
}

declare module '@/lib/*' {}

// Declare app modules
declare module '@/app/actions/imports' {
  export function createImportJob(formData: FormData): Promise<any>;
  export function createImportBatch(formData: FormData): Promise<any>;
  export function processImportData(formData: FormData): Promise<any>;
  export function getImportJobStatus(formData: FormData): Promise<any>;
}

declare module '@/app/*' {}
