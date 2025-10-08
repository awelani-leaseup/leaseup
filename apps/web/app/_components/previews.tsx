import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@leaseup/ui/components/tabs';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from '@leaseup/ui/components/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@leaseup/ui/components/dropdown-menu';
import { Button } from '@leaseup/ui/components/button';
import {
  AlertCircle,
  Banknote,
  BookOpen,
  Building,
  Calendar,
  DoorOpen,
  Download as DownloadIcon,
  FileText,
  Folder,
  KeyRound,
  LayoutDashboard,
  MessageSquare,
  Plus,
  ReceiptText,
  Settings,
  SquareUserRound,
} from 'lucide-react';
import { FC } from 'react';
import Link from 'next/link';
import { AlertTitle } from '@leaseup/ui/components/alert';

export const Previews: FC = () => {
  return (
    <div className='flex-col gap-4 w-full my-10 hidden lg:flex'>
      <Tabs defaultValue='dashboard'>
        <TabsList className='self-center w-full max-w-md bg-white'>
          <TabsTrigger value='dashboard' className='text-xs sm:text-sm'>
            <LayoutDashboard className='w-4 h-4' />
            <span className='hidden sm:inline'>Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value='properties' className='text-xs sm:text-sm'>
            <Building className='w-4 h-4' />
            <span className='hidden sm:inline'>Properties</span>
          </TabsTrigger>
          <TabsTrigger value='accounting' className='text-xs sm:text-sm'>
            <Banknote className='w-4 h-4' />
            <span className='hidden sm:inline'>Invoices</span>
          </TabsTrigger>
          <TabsTrigger value='documents' className='text-xs sm:text-sm'>
            <Folder className='w-4 h-4' />
            <span className='hidden sm:inline'>Documents</span>
          </TabsTrigger>
          <TabsTrigger value='leases' className='text-xs sm:text-sm'>
            <FileText className='w-4 h-4' />
            <span className='hidden sm:inline'>Leases</span>
          </TabsTrigger>
        </TabsList>
        <TabsContent
          value='dashboard'
          className='animate-in slide-in-from-bottom-5 duration-300'
        >
          <DashboardPreview />
        </TabsContent>
        <TabsContent
          value='properties'
          className='animate-in slide-in-from-bottom-5 duration-300'
        >
          <PropertiesPreview />
        </TabsContent>
        <TabsContent
          value='accounting'
          className='animate-in slide-in-from-bottom-5 duration-300'
        >
          <AccountingPreview />
        </TabsContent>
        <TabsContent
          value='documents'
          className='animate-in slide-in-from-bottom-5 duration-300'
        >
          <DocumentsPreview />
        </TabsContent>
        <TabsContent
          value='leases'
          className='animate-in slide-in-from-bottom-5 duration-300'
        >
          <LeasesPreview />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Shared Sidebar Component using the same structure as app layout
const PreviewSidebar = ({ activeItem }: { activeItem: string }) => {
  const isActive = (path: string) => activeItem === path;

  return (
    <div className='w-64 pointer-events-none'>
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader>
            <Link href='/'>
              <span className='px-2 text-2xl font-bold tracking-tight'>
                LeaseUp
              </span>
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button className='w-full'>
                            <Plus /> Create New
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                          <DropdownMenuItem>
                            <Link href='/properties/create'>Property</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Link href='/units/create'>Unit</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Link href='/leases/create'>Lease</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Link href='/tenants/create'>Tenant</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Link href='/invoices/create'>Invoice</Link>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton isActive={isActive('dashboard')}>
                      <LayoutDashboard />
                      <Link href='/dashboard'>Dashboard</Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarGroupLabel>Portfolio</SidebarGroupLabel>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton isActive={isActive('properties')}>
                      <Building />
                      <Link href='/properties'>Properties</Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton isActive={isActive('units')}>
                      <DoorOpen />
                      <Link href='/units'>Units</Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton isActive={isActive('keys')}>
                      <KeyRound />
                      <Link href='/keys'>Keys</Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton isActive={isActive('tenants')}>
                      <SquareUserRound />
                      <Link href='/tenants'>Tenants</Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton isActive={isActive('leases')}>
                      <FileText />
                      <Link href='/leases'>Leases</Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton isActive={isActive('documents')}>
                      <Folder />
                      <Link href='/documents'>File Storage</Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarGroupLabel>Accounting</SidebarGroupLabel>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton isActive={isActive('accounting')}>
                      <Banknote />
                      <Link href='/invoices'>Invoices</Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton isActive={isActive('transactions')}>
                      <Folder />
                      <Link href='/transactions'>Transactions</Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a
                    rel='noopener noreferrer'
                    target='_blank'
                    href='https://leaseup.featurebase.app/help'
                  >
                    <BookOpen />
                    Help Center
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a
                    rel='noopener noreferrer'
                    target='_blank'
                    href='https://leaseup.featurebase.app'
                  >
                    <MessageSquare />
                    Feedback Center
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href='/settings'>
                    <Settings />
                    Account Settings
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
      </SidebarProvider>
    </div>
  );
};

const DashboardPreview = () => {
  return (
    <div className='bg-[#ECF0F1] p-2 sm:p-4 rounded-2xl *:text-left scale-[0.7] sm:scale-[0.85] lg:scale-[0.95] relative border border-[#CBD5E1] transition-all overflow-hidden hidden lg:block h-[50rem] ring-8 ring-primary/10 pointer-events-none'>
      <div className='flex w-full mx-auto min-h-[400px]'>
        <div className='hidden lg:block'>
          <PreviewSidebar activeItem='dashboard' />
        </div>

        {/* Main Content */}
        <div className='flex-1 h-full bg-[#ECF0F1] px-2 sm:px-4 lg:px-8 py-4 sm:py-8 pt-[40px] sm:pt-[73px]'>
          <div className='mx-auto max-w-5xl'>
            {/* Dashboard Header */}
            <div className='mb-8'>
              <div className='flex flex-col md:flex-row md:items-center md:justify-between'>
                <div>
                  <h1 className='text-lg font-bold text-[#2D3436]'>
                    Dashboard
                  </h1>
                  <p className='text-[#7F8C8D]'>
                    Welcome back, John! Let&apos;s start managing your
                    properties.
                  </p>
                </div>
                <div className='mt-4 flex space-x-3 md:mt-0'>
                  <button className='bg-white border border-gray-200 text-[#2D3436] px-4 py-2 rounded-lg flex items-center text-sm'>
                    <DownloadIcon className='mr-2 h-4 w-4' />
                    Export
                  </button>
                  <button className='bg-[#3498DB] text-white px-4 py-2 rounded-lg flex items-center text-sm'>
                    <Plus className='mr-2 h-4 w-4' />
                    Add Property
                  </button>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className='mb-8 grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4'>
              {/* Properties Card */}
              <div className='rounded-xl border border-gray-200 bg-white p-4'>
                <div className='mb-4 flex items-center justify-between'>
                  <div className='flex size-10 items-center justify-center rounded-full bg-blue-100'>
                    <Building className='size-5 stroke-1 text-[#3498DB]' />
                  </div>
                  <span className='text-[#7F8C8D]'>Properties</span>
                </div>
                <h3 className='text-xl font-bold text-[#2D3436]'>3</h3>
                <p className='mt-2 text-sm text-[#7F8C8D]'>Active properties</p>
              </div>

              {/* Tenants Card */}
              <div className='rounded-xl border border-gray-200 bg-white p-4'>
                <div className='mb-4 flex items-center justify-between'>
                  <div className='flex size-10 items-center justify-center rounded-full bg-green-100'>
                    <SquareUserRound className='size-5 stroke-1 text-[#2ECC71]' />
                  </div>
                  <span className='text-[#7F8C8D]'>Tenants</span>
                </div>
                <h3 className='text-xl font-bold text-[#2D3436]'>5</h3>
                <p className='mt-2 text-sm text-[#7F8C8D]'>Total tenants</p>
              </div>

              {/* Revenue Card */}
              <div className='rounded-xl border border-gray-200 bg-white p-4'>
                <div className='mb-4 flex items-center justify-between'>
                  <div className='flex size-10 items-center justify-center rounded-full bg-yellow-100'>
                    <Banknote className='size-5 stroke-1 text-[#F39C12]' />
                  </div>
                  <span className='text-[#7F8C8D]'>Revenue</span>
                </div>
                <h3 className='text-xl font-bold text-[#2D3436]'>R 52,000</h3>
                <p className='mt-2 text-sm text-[#7F8C8D]'>Total collected</p>
              </div>

              {/* Pending Issues Card */}
              <div className='rounded-xl border border-gray-200 bg-white p-4'>
                <div className='mb-4 flex items-center justify-between'>
                  <div className='flex size-10 items-center justify-center rounded-full bg-red-100'>
                    <AlertCircle className='size-5 stroke-1 text-[#E74C3C]' />
                  </div>
                  <span className='text-[#7F8C8D]'>Pending Issues</span>
                </div>
                <h3 className='text-xl font-bold text-[#2D3436]'>2</h3>
                <p className='mt-2 text-sm text-[#7F8C8D]'>Require attention</p>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className='grid grid-cols-1 gap-8 lg:grid-cols-3'>
              {/* Left Column */}
              <div className='space-y-8 lg:col-span-2'>
                {/* Recent Activity Chart */}
                <div className='rounded-xl border border-gray-200 bg-white'>
                  <div className='p-6 pb-0'>
                    <div className='flex items-center justify-between mb-2'>
                      <h2 className='text-xl font-semibold text-[#2D3436]'>
                        Recent Activity
                      </h2>
                      <button className='text-sm text-[#3498DB] border border-gray-200 px-3 py-1 rounded-lg'>
                        View All
                      </button>
                    </div>
                    <p className='text-sm text-[#7F8C8D] mb-6'>
                      Last 2 weeks • 8 payments • R 37,500
                    </p>
                  </div>
                  <div className='px-6 pb-6'>
                    {/* Simple Chart Representation */}
                    <div className='h-[200px] flex items-end justify-between gap-2'>
                      {[2, 8, 5, 12, 3, 15, 7, 9, 4, 11, 6, 13, 8, 10].map(
                        (height, i) => (
                          <div
                            key={i}
                            className='flex-1 flex flex-col items-center'
                          >
                            <div
                              className='w-full bg-[#2ECC71] rounded-t opacity-80 hover:opacity-100 transition-opacity'
                              style={{ height: `${height * 8}px` }}
                            />
                          </div>
                        )
                      )}
                    </div>
                    <div className='flex justify-between mt-2 text-xs text-[#7F8C8D]'>
                      <span>Sep 7</span>
                      <span>Sep 14</span>
                      <span>Sep 21</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className='space-y-8'>
                {/* Upcoming Payments */}
                <div className='rounded-xl border border-gray-200 bg-white'>
                  <div className='p-6'>
                    <h2 className='text-xl font-semibold text-[#2D3436] mb-6'>
                      Upcoming Payments
                    </h2>
                    <div className='space-y-4'>
                      <div className='flex items-center justify-between'>
                        <div className='flex-1'>
                          <p className='font-medium text-[#2D3436]'>
                            John Smith
                          </p>
                          <p className='text-sm text-[#7F8C8D]'>Due Oct 1</p>
                        </div>
                        <div className='text-right'>
                          <p className='font-semibold text-[#2D3436]'>
                            R 25,000
                          </p>
                        </div>
                      </div>
                      <div className='flex items-center justify-between'>
                        <div className='flex-1'>
                          <p className='font-medium text-[#2D3436]'>
                            Mary Johnson
                          </p>
                          <p className='text-sm text-[#7F8C8D]'>Due Oct 1</p>
                        </div>
                        <div className='text-right'>
                          <p className='font-semibold text-[#2D3436]'>
                            R 12,000
                          </p>
                        </div>
                      </div>
                      <div className='flex items-center justify-between'>
                        <div className='flex-1'>
                          <p className='font-medium text-[#2D3436]'>
                            David Wilson
                          </p>
                          <p className='text-sm text-[#7F8C8D]'>Due Oct 5</p>
                        </div>
                        <div className='text-right'>
                          <p className='font-semibold text-[#2D3436]'>
                            R 15,000
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lease Renewals */}
                <div className='rounded-xl border border-gray-200 bg-white p-6'>
                  <h2 className='mb-6 text-base font-semibold text-[#2D3436]'>
                    Upcoming Lease Renewals
                  </h2>
                  <div className='space-y-4'>
                    <div className='flex items-center justify-between'>
                      <div className='flex-1'>
                        <p className='flex items-center gap-2 font-medium tracking-tight text-[#2D3436]'>
                          <div className='w-8 h-8 bg-[#3498DB] rounded-full flex items-center justify-center text-white text-xs font-medium'>
                            JS
                          </div>
                          <div>
                            <p>John Smith</p>
                            <p className='text-sm tracking-tight text-[#7F8C8D]'>
                              Expires Dec 31, 2024
                            </p>
                          </div>
                        </p>
                      </div>
                    </div>
                    <div className='flex items-center justify-between'>
                      <div className='flex-1'>
                        <p className='flex items-center gap-2 font-medium tracking-tight text-[#2D3436]'>
                          <div className='w-8 h-8 bg-[#3498DB] rounded-full flex items-center justify-center text-white text-xs font-medium'>
                            DW
                          </div>
                          <div>
                            <p>David Wilson</p>
                            <p className='text-sm tracking-tight text-[#7F8C8D]'>
                              Expires Jan 15, 2025
                            </p>
                          </div>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const PropertiesPreview = () => {
  return (
    <div className='bg-[#ECF0F1] p-2 sm:p-4 rounded-2xl *:text-left scale-[0.7] sm:scale-[0.85] lg:scale-[0.95] relative border border-[#CBD5E1] transition-all overflow-hidden hidden lg:block h-[50rem] ring-8 ring-primary/10 pointer-events-none'>
      <div className='flex w-full mx-auto min-h-[400px]'>
        <div className='hidden lg:block'>
          <PreviewSidebar activeItem='properties' />
        </div>

        {/* Main Content */}
        <div className='flex-1 h-full bg-[#ECF0F1] px-2 sm:px-4 lg:px-8 py-4 sm:py-8 pt-[40px] sm:pt-[73px]'>
          <div className='mx-auto max-w-7xl'>
            {/* Properties Header Card */}
            <div className='rounded-xl border border-gray-200 bg-white'>
              <div className='flex flex-row items-center justify-between p-6'>
                <div>
                  <h1 className='text-2xl font-bold text-[#2D3436]'>
                    Properties
                  </h1>
                  <p className='text-[#7F8C8D]'>
                    Manage your properties and units.
                  </p>
                </div>
                <button className='bg-[#3498DB] text-white px-4 py-2 rounded-lg flex items-center'>
                  <i className='fa-solid fa-plus mr-2'></i>
                  Create Property
                </button>
              </div>
            </div>

            {/* Properties List */}
            <div className='mt-6 flex flex-col gap-4'>
              {/* Single Unit Property */}
              <div className='w-full py-0 rounded-xl border border-gray-200 bg-white pr-6'>
                <div className='flex w-full pl-0'>
                  <div className='shrink-0'>
                    <div className='w-64 h-48 relative'>
                      <img
                        className='w-full h-full object-cover rounded-l-xl'
                        src='https://storage.googleapis.com/uxpilot-auth.appspot.com/0df9eb9634-639e150add565c0ac2fa.png'
                        alt='satellite map view showing property location'
                      />
                    </div>
                  </div>
                  <div className='w-full py-6 pl-6'>
                    <div className='flex w-full justify-between'>
                      <div className='w-full'>
                        <div className='flex items-center gap-4'>
                          <h3 className='text-lg font-semibold text-[#2D3436]'>
                            Sunset Villa
                          </h3>
                          <span className='bg-[#2ECC71]/10 text-[#2ECC71] text-xs font-medium px-3 py-1 rounded-full border border-[#2ECC71]/20'>
                            Occupied
                          </span>
                        </div>
                        <p className='text-[#7F8C8D] mt-2 flex max-w-md items-center gap-1 text-sm'>
                          <span className='line-clamp-2'>
                            45 Ocean Drive, Cape Town, Western Cape, 8001 South
                            Africa
                          </span>
                        </p>
                      </div>
                      <div className='shrink-0'>
                        <p className='text-[#3498DB] items-end text-right tabular-nums text-lg font-semibold'>
                          R 25,000
                          <span className='text-[#7F8C8D] text-sm font-normal'>
                            /mo
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className='mt-4'>
                      <div className='flex gap-2'>
                        <span className='border border-gray-200 text-[#7F8C8D] text-xs px-3 py-1 rounded-full flex items-center gap-1'>
                          <i className='fa-solid fa-bed'></i> 3 Bedrooms
                        </span>
                        <span className='border border-gray-200 text-[#7F8C8D] text-xs px-3 py-1 rounded-full flex items-center gap-1'>
                          <i className='fa-solid fa-bath'></i> 2 Bathrooms
                        </span>
                        <span className='border border-gray-200 text-[#7F8C8D] text-xs px-3 py-1 rounded-full flex items-center gap-1'>
                          <i className='fa-solid fa-ruler-combined'></i> 150 sqm
                        </span>
                      </div>
                      <div className='mt-4 flex flex-col gap-2'>
                        <div className='flex flex-wrap gap-2'>
                          <span className='border border-[#3498DB] text-[#3498DB] text-xs px-3 py-1 rounded-full font-semibold'>
                            ✅ Swimming Pool
                          </span>
                          <span className='border border-[#3498DB] text-[#3498DB] text-xs px-3 py-1 rounded-full font-semibold'>
                            ✅ Garden
                          </span>
                          <span className='border border-[#3498DB] text-[#3498DB] text-xs px-3 py-1 rounded-full font-semibold'>
                            ✅ Parking
                          </span>
                        </div>
                        <div className='flex flex-wrap gap-2'>
                          <span className='border border-[#3498DB] text-[#3498DB] text-xs px-3 py-1 rounded-full font-semibold'>
                            ⭐ Ocean View
                          </span>
                          <span className='border border-[#3498DB] text-[#3498DB] text-xs px-3 py-1 rounded-full font-semibold'>
                            ⭐ Modern Kitchen
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Multi Unit Property */}
              <div className='w-full py-0 rounded-xl border border-gray-200 bg-white pr-6'>
                <div className='flex w-full pl-0'>
                  <div className='shrink-0'>
                    <div className='w-64 h-48 relative'>
                      <img
                        className='w-full h-full object-cover rounded-l-xl'
                        src='https://storage.googleapis.com/uxpilot-auth.appspot.com/0df9eb9634-639e150add565c0ac2fa.png'
                        alt='satellite map view showing property location'
                      />
                    </div>
                  </div>
                  <div className='w-full py-6 pl-6'>
                    <div className='flex w-full justify-between'>
                      <div className='w-full'>
                        <div className='flex items-center gap-4'>
                          <h3 className='text-lg font-semibold text-[#2D3436]'>
                            Parkview Apartments
                          </h3>
                        </div>
                        <p className='text-[#7F8C8D] mt-2 flex max-w-md items-center gap-1 text-sm'>
                          <span className='line-clamp-2'>
                            123 Park Avenue, Johannesburg, Gauteng, 2000 South
                            Africa
                          </span>
                        </p>
                      </div>
                      <div className='shrink-0'>
                        <p className='text-[#3498DB] items-end text-right tabular-nums text-lg font-semibold'>
                          R 12,000
                          <span className='text-[#7F8C8D] text-sm font-normal'>
                            /mo
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className='mt-4'>
                      <div className='flex flex-wrap gap-2'>
                        {/* Unit 1 */}
                        <div className='mt-2 flex w-52 flex-col items-start gap-1 overflow-hidden rounded-md px-4 py-2 border border-[#3498DB] bg-[#3498DB]/5'>
                          <div className='item-center flex w-full justify-between'>
                            <span className='font-medium text-sm'>#101</span>
                            <span className='bg-[#2ECC71]/10 text-[#2ECC71] text-xs font-medium px-2 py-1 rounded-full border border-[#2ECC71]/20'>
                              Occupied
                            </span>
                          </div>
                          <div className='w-[100%] overflow-hidden'>
                            <span className='flex items-center gap-2'>
                              <div className='w-6 h-6 rounded-full bg-[#3498DB] flex items-center justify-center text-white text-xs font-medium'>
                                JS
                              </div>
                              <span className='text-sm text-[#2D3436]'>
                                John Smith
                              </span>
                            </span>
                          </div>
                        </div>

                        {/* Unit 2 */}
                        <div className='mt-2 flex w-52 flex-col items-start gap-1 overflow-hidden rounded-md px-4 py-2 border border-[#F39C12] bg-[#F39C12]/5'>
                          <div className='item-center flex w-full justify-between'>
                            <span className='font-medium text-sm'>#102</span>
                            <span className='bg-[#F39C12]/10 text-[#F39C12] text-xs font-medium px-2 py-1 rounded-full border border-[#F39C12]/20'>
                              Vacant
                            </span>
                          </div>
                          <div className='w-[100%] overflow-hidden'>
                            <div className='flex items-center gap-2'></div>
                          </div>
                        </div>

                        {/* Unit 3 */}
                        <div className='mt-2 flex w-52 flex-col items-start gap-1 overflow-hidden rounded-md px-4 py-2 border border-[#3498DB] bg-[#3498DB]/5'>
                          <div className='item-center flex w-full justify-between'>
                            <span className='font-medium text-sm'>#201</span>
                            <span className='bg-[#2ECC71]/10 text-[#2ECC71] text-xs font-medium px-2 py-1 rounded-full border border-[#2ECC71]/20'>
                              Occupied
                            </span>
                          </div>
                          <div className='w-[100%] overflow-hidden'>
                            <span className='flex items-center gap-2'>
                              <div className='w-6 h-6 rounded-full bg-[#3498DB] flex items-center justify-center text-white text-xs font-medium'>
                                MJ
                              </div>
                              <span className='text-sm text-[#2D3436]'>
                                Mary Johnson
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className='mt-4 flex flex-col gap-2'>
                        <div className='flex flex-wrap gap-2'>
                          <span className='border border-[#3498DB] text-[#3498DB] text-xs px-3 py-1 rounded-full font-semibold'>
                            ✅ Gym
                          </span>
                          <span className='border border-[#3498DB] text-[#3498DB] text-xs px-3 py-1 rounded-full font-semibold'>
                            ✅ Laundry
                          </span>
                          <span className='border border-[#3498DB] text-[#3498DB] text-xs px-3 py-1 rounded-full font-semibold'>
                            ✅ Security
                          </span>
                        </div>
                        <div className='flex flex-wrap gap-2'>
                          <span className='border border-[#3498DB] text-[#3498DB] text-xs px-3 py-1 rounded-full font-semibold'>
                            ⭐ Elevator Access
                          </span>
                          <span className='border border-[#3498DB] text-[#3498DB] text-xs px-3 py-1 rounded-full font-semibold'>
                            ⭐ Central Location
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Single Unit Property 2 */}
              <div className='w-full py-0 rounded-xl border border-gray-200 bg-white pr-6'>
                <div className='flex w-full pl-0'>
                  <div className='shrink-0'>
                    <div className='w-64 h-48 relative'>
                      <img
                        className='w-full h-full object-cover rounded-l-xl'
                        src='https://storage.googleapis.com/uxpilot-auth.appspot.com/0df9eb9634-639e150add565c0ac2fa.png'
                        alt='satellite map view showing property location'
                      />
                    </div>
                  </div>
                  <div className='w-full py-6 pl-6'>
                    <div className='flex w-full justify-between'>
                      <div className='w-full'>
                        <div className='flex items-center gap-4'>
                          <h3 className='text-lg font-semibold text-[#2D3436]'>
                            Garden Cottage
                          </h3>
                          <span className='bg-[#F39C12]/10 text-[#F39C12] text-xs font-medium px-3 py-1 rounded-full border border-[#F39C12]/20'>
                            Vacant
                          </span>
                        </div>
                        <p className='text-[#7F8C8D] mt-2 flex max-w-md items-center gap-1 text-sm'>
                          <span className='line-clamp-2'>
                            78 Maple Street, Durban, KwaZulu-Natal, 4001 South
                            Africa
                          </span>
                        </p>
                      </div>
                      <div className='shrink-0'>
                        <p className='text-[#3498DB] items-end text-right tabular-nums text-lg font-semibold'>
                          R 15,000
                          <span className='text-[#7F8C8D] text-sm font-normal'>
                            /mo
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className='mt-4'>
                      <div className='flex gap-2'>
                        <span className='border border-gray-200 text-[#7F8C8D] text-xs px-3 py-1 rounded-full flex items-center gap-1'>
                          <i className='fa-solid fa-bed'></i> 2 Bedrooms
                        </span>
                        <span className='border border-gray-200 text-[#7F8C8D] text-xs px-3 py-1 rounded-full flex items-center gap-1'>
                          <i className='fa-solid fa-bath'></i> 1 Bathroom
                        </span>
                        <span className='border border-gray-200 text-[#7F8C8D] text-xs px-3 py-1 rounded-full flex items-center gap-1'>
                          <i className='fa-solid fa-ruler-combined'></i> 80 sqm
                        </span>
                      </div>
                      <div className='mt-4 flex flex-col gap-2'>
                        <span className='border border-gray-200 text-[#7F8C8D] text-xs px-3 py-1 rounded-full w-fit'>
                          No amenities
                        </span>
                        <div className='flex flex-wrap gap-2'>
                          <span className='border border-[#3498DB] text-[#3498DB] text-xs px-3 py-1 rounded-full font-semibold'>
                            ⭐ Quiet Neighborhood
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AccountingPreview = () => {
  return (
    <div className='bg-[#ECF0F1] p-2 sm:p-4 rounded-2xl *:text-left scale-[0.7] sm:scale-[0.85] lg:scale-[0.95] relative border border-[#CBD5E1] transition-all overflow-hidden hidden lg:block h-[50rem] ring-8 ring-primary/10 pointer-events-none'>
      <div className='flex w-full mx-auto min-h-[400px]'>
        <div className='hidden lg:block'>
          <PreviewSidebar activeItem='accounting' />
        </div>

        {/* Main Content */}
        <div className='flex-1 h-full bg-[#ECF0F1] px-2 sm:px-4 lg:px-8 py-4 sm:py-8 pt-[40px] sm:pt-[73px]'>
          <div className='mx-auto max-w-7xl flex flex-col space-y-8'>
            {/* Page Header */}
            <div className='rounded-xl border border-gray-200 bg-white'>
              <div className='p-6'>
                <div className='flex flex-col items-start justify-between md:flex-row md:items-center'>
                  <div>
                    <h1 className='text-2xl font-bold text-[#2D3436]'>
                      Invoices Management
                    </h1>
                    <p className='text-[#7F8C8D]'>
                      Create, track and manage tenant rental invoices
                    </p>
                  </div>
                  <div className='mt-4 flex gap-3 md:mt-0'>
                    <button className='border border-[#3498DB] text-[#3498DB] px-4 py-2 rounded-lg flex items-center text-sm'>
                      <i className='fa-solid fa-download mr-2'></i>
                      Export
                    </button>
                    <button className='bg-[#3498DB] text-white px-4 py-2 rounded-lg flex items-center text-sm'>
                      <i className='fa-solid fa-plus mr-2'></i>
                      Create Invoice
                    </button>
                  </div>
                </div>

                {/* Summary Cards */}
                <div className='grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-4 mt-4 sm:mt-6'>
                  <div className='h-auto rounded-md p-2 sm:p-4 bg-green-50 border border-green-200'>
                    <div className='flex w-full items-center justify-between'>
                      <div>
                        <p className='mb-1 sm:mb-2 text-xs sm:text-sm text-green-700'>
                          Total Invoiced
                        </p>
                        <p className='text-lg sm:text-2xl font-bold text-green-800'>
                          R 37,500
                        </p>
                      </div>
                      <ReceiptText className='w-6 h-6 text-green-600 stroke-1' />
                    </div>
                  </div>
                  <div className='h-auto rounded-md p-2 sm:p-4 bg-orange-50 border border-orange-200'>
                    <div className='flex w-full items-center justify-between'>
                      <div>
                        <p className='mb-1 sm:mb-2 text-xs sm:text-sm text-orange-700'>
                          Pending Payment
                        </p>
                        <p className='text-lg sm:text-2xl font-bold text-orange-800'>
                          R 12,000
                        </p>
                      </div>
                      <AlertCircle className='w-6 h-6 text-orange-600 stroke-1' />
                    </div>
                  </div>
                  <div className='h-auto rounded-md p-2 sm:p-4 bg-red-50 border border-red-200'>
                    <div className='flex w-full items-center justify-between'>
                      <div>
                        <p className='mb-1 sm:mb-2 text-xs sm:text-sm text-red-700'>
                          Overdue
                        </p>
                        <p className='text-lg sm:text-2xl font-bold text-red-800'>
                          R 8,500
                        </p>
                      </div>
                      <AlertTitle className='w-6 h-6 text-red-600 stroke-1' />
                    </div>
                  </div>
                  <div className='h-auto rounded-md p-2 sm:p-4 bg-blue-50 border border-blue-200'>
                    <div className='flex w-full items-center justify-between'>
                      <div>
                        <p className='mb-1 sm:mb-2 text-xs sm:text-sm text-blue-700'>
                          This Month
                        </p>
                        <p className='text-lg sm:text-2xl font-bold text-blue-800'>
                          3
                        </p>
                      </div>
                      <Calendar className='w-6 h-6 text-blue-600 stroke-1' />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters and Table */}
            <div className='rounded-xl border border-gray-200 bg-white'>
              <div className='p-6'>
                <div className='flex flex-col gap-4'>
                  <h2 className='text-xl font-semibold text-[#2D3436]'>
                    All Invoices
                  </h2>

                  {/* Filters */}
                  <div className='flex flex-col gap-4 md:flex-row md:items-center'>
                    <div className='relative flex-1'>
                      <i className='fa-solid fa-search absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400'></i>
                      <input
                        placeholder='Search invoices, tenants, or properties...'
                        className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm'
                      />
                    </div>

                    <div className='flex gap-2'>
                      <select className='w-[150px] px-3 py-2 border border-gray-300 rounded-lg text-sm'>
                        <option>All Status</option>
                        <option>Paid</option>
                        <option>Pending</option>
                        <option>Overdue</option>
                      </select>

                      <select className='w-[200px] px-3 py-2 border border-gray-300 rounded-lg text-sm'>
                        <option>All Properties</option>
                        <option>Sunset Villa</option>
                        <option>Parkview Apartments</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Table */}
                <div className='mt-4 sm:mt-6 rounded-md border overflow-x-auto'>
                  <table className='w-full min-w-[600px]'>
                    <thead>
                      <tr className='border-b bg-gray-50'>
                        <th className='p-2 sm:p-4 text-left text-xs sm:text-sm font-semibold text-[#2D3436]'>
                          Invoice
                        </th>
                        <th className='p-2 sm:p-4 text-left text-xs sm:text-sm font-semibold text-[#2D3436]'>
                          Tenant
                        </th>
                        <th className='p-2 sm:p-4 text-left text-xs sm:text-sm font-semibold text-[#2D3436]'>
                          Property
                        </th>
                        <th className='p-2 sm:p-4 text-left text-xs sm:text-sm font-semibold text-[#2D3436]'>
                          Amount
                        </th>
                        <th className='p-2 sm:p-4 text-left text-xs sm:text-sm font-semibold text-[#2D3436]'>
                          Due Date
                        </th>
                        <th className='p-2 sm:p-4 text-left text-xs sm:text-sm font-semibold text-[#2D3436]'>
                          Status
                        </th>
                        <th className='p-2 sm:p-4 text-left text-xs sm:text-sm font-semibold text-[#2D3436]'>
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Invoice 1 */}
                      <tr className='border-b hover:bg-gray-50'>
                        <td className='p-2 sm:p-4'>
                          <div>
                            <p className='font-medium text-xs sm:text-sm text-[#2D3436]'>
                              #INV-2024001
                            </p>
                            <p className='text-xs sm:text-sm text-[#7F8C8D]'>
                              Monthly Rent January
                            </p>
                          </div>
                        </td>
                        <td className='p-2 sm:p-4'>
                          <div className='flex items-center'>
                            <div className='w-6 h-6 sm:w-8 sm:h-8 bg-[#3498DB] rounded-full flex items-center justify-center text-white text-xs font-medium mr-2 sm:mr-3'>
                              JS
                            </div>
                            <div>
                              <p className='font-medium text-xs sm:text-sm text-[#2D3436]'>
                                John Smith
                              </p>
                              <p className='text-xs text-[#7F8C8D] hidden sm:block'>
                                john@example.com
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className='p-2 sm:p-4'>
                          <div>
                            <p className='text-xs sm:text-sm text-[#2D3436]'>
                              Sunset Villa
                            </p>
                            <p className='text-xs text-[#7F8C8D]'>Unit Main</p>
                          </div>
                        </td>
                        <td className='p-2 sm:p-4'>
                          <span className='font-semibold text-xs sm:text-sm text-[#2D3436]'>
                            R 25,000
                          </span>
                        </td>
                        <td className='p-2 sm:p-4'>
                          <p className='text-xs sm:text-sm text-[#2D3436]'>
                            Feb 01, 2024
                          </p>
                        </td>
                        <td className='p-2 sm:p-4'>
                          <span className='bg-green-100 text-green-800 text-xs font-medium px-2 sm:px-3 py-1 rounded-full border border-green-200'>
                            Paid
                          </span>
                        </td>
                        <td className='p-2 sm:p-4'>
                          <button className='text-gray-400 hover:text-gray-600'>
                            <i className='fa-solid fa-ellipsis-h'></i>
                          </button>
                        </td>
                      </tr>

                      {/* Invoice 2 */}
                      <tr className='border-b hover:bg-gray-50'>
                        <td className='p-4'>
                          <div>
                            <p className='font-medium text-[#2D3436]'>
                              #INV-2024002
                            </p>
                            <p className='text-sm text-[#7F8C8D]'>
                              Monthly Rent January
                            </p>
                          </div>
                        </td>
                        <td className='p-4'>
                          <div className='flex items-center'>
                            <div className='w-8 h-8 bg-[#3498DB] rounded-full flex items-center justify-center text-white text-xs font-medium mr-3'>
                              MJ
                            </div>
                            <div>
                              <p className='font-medium text-[#2D3436]'>
                                Mary Johnson
                              </p>
                              <p className='text-sm text-[#7F8C8D]'>
                                mary@example.com
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className='p-4'>
                          <div>
                            <p className='text-[#2D3436]'>
                              Parkview Apartments
                            </p>
                            <p className='text-sm text-[#7F8C8D]'>Unit 201</p>
                          </div>
                        </td>
                        <td className='p-4'>
                          <span className='font-semibold text-[#2D3436]'>
                            R 12,000
                          </span>
                        </td>
                        <td className='p-4'>
                          <p className='text-[#F39C12]'>Jan 28, 2024</p>
                        </td>
                        <td className='p-4'>
                          <span className='bg-orange-100 text-orange-800 text-xs font-medium px-3 py-1 rounded-full border border-orange-200'>
                            Pending
                          </span>
                        </td>
                        <td className='p-4'>
                          <button className='text-gray-400 hover:text-gray-600'>
                            <i className='fa-solid fa-ellipsis-h'></i>
                          </button>
                        </td>
                      </tr>

                      {/* Invoice 3 */}
                      <tr className='border-b hover:bg-gray-50'>
                        <td className='p-4'>
                          <div>
                            <p className='font-medium text-[#2D3436]'>
                              #INV-2024003
                            </p>
                            <p className='text-sm text-[#7F8C8D]'>
                              Monthly Rent December
                            </p>
                          </div>
                        </td>
                        <td className='p-4'>
                          <div className='flex items-center'>
                            <div className='w-8 h-8 bg-[#3498DB] rounded-full flex items-center justify-center text-white text-xs font-medium mr-3'>
                              DR
                            </div>
                            <div>
                              <p className='font-medium text-[#2D3436]'>
                                David Rodriguez
                              </p>
                              <p className='text-sm text-[#7F8C8D]'>
                                david@example.com
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className='p-4'>
                          <div>
                            <p className='text-[#2D3436]'>Garden Cottage</p>
                            <p className='text-sm text-[#7F8C8D]'>Unit Main</p>
                          </div>
                        </td>
                        <td className='p-4'>
                          <span className='font-semibold text-[#2D3436]'>
                            R 15,000
                          </span>
                        </td>
                        <td className='p-4'>
                          <p className='text-[#E74C3C]'>Dec 15, 2023</p>
                        </td>
                        <td className='p-4'>
                          <span className='bg-red-100 text-red-800 text-xs font-medium px-3 py-1 rounded-full border border-red-200'>
                            Overdue
                          </span>
                        </td>
                        <td className='p-4'>
                          <button className='text-gray-400 hover:text-gray-600'>
                            <i className='fa-solid fa-ellipsis-h'></i>
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className='flex items-center justify-between px-6 py-4'>
                  <div className='flex items-center gap-2'>
                    <button className='px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 cursor-not-allowed opacity-50'>
                      Previous
                    </button>
                    <button className='px-3 py-1 bg-[#3498DB] text-white rounded text-sm'>
                      1
                    </button>
                    <button className='px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50'>
                      2
                    </button>
                    <button className='px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50'>
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DocumentsPreview = () => {
  return (
    <div className='bg-[#ECF0F1] p-2 sm:p-4 rounded-2xl *:text-left scale-[0.7] sm:scale-[0.85] lg:scale-[0.95] relative border border-[#CBD5E1] transition-all overflow-hidden hidden lg:block h-[50rem] ring-8 ring-primary/10 pointer-events-none'>
      <div className='flex w-full mx-auto min-h-[400px]'>
        <div className='hidden lg:block'>
          <PreviewSidebar activeItem='documents' />
        </div>

        {/* Main Content */}
        <div className='flex-1 h-full bg-[#ECF0F1] px-2 sm:px-4 lg:px-8 py-4 sm:py-8 pt-[40px] sm:pt-[73px]'>
          <div className='mx-auto max-w-7xl flex flex-col space-y-8'>
            {/* Page Header */}
            <div className='rounded-xl border border-gray-200 bg-white'>
              <div className='p-6'>
                <div className='flex flex-col items-start justify-between md:flex-row md:items-center'>
                  <div>
                    <h1 className='text-2xl font-bold text-[#2D3436]'>
                      Documents
                    </h1>
                    <p className='text-[#7F8C8D]'>
                      Manage and organize your property documents
                    </p>
                  </div>
                  <div className='mt-4 flex gap-3 md:mt-0'>
                    <button className='bg-[#3498DB] text-white px-4 py-2 rounded-lg flex items-center text-sm'>
                      <i className='fa-solid fa-upload mr-2'></i>
                      Upload Document
                    </button>
                  </div>
                </div>

                {/* Summary Cards */}
                <div className='grid grid-cols-1 gap-4 md:grid-cols-3 mt-6'>
                  <div className='h-auto rounded-md p-4 bg-blue-50 border border-blue-200'>
                    <div className='flex w-full items-center justify-between'>
                      <div>
                        <p className='mb-2 text-sm text-blue-700'>
                          Total Files
                        </p>
                        <p className='text-2xl font-bold text-blue-800'>24</p>
                      </div>
                      <FileText className='w-6 h-6 text-blue-600 stroke-1' />
                    </div>
                  </div>
                  <div className='h-auto rounded-md p-4 bg-orange-50 border border-orange-200'>
                    <div className='flex w-full items-center justify-between'>
                      <div>
                        <p className='mb-2 text-sm text-orange-700'>
                          Storage Used
                        </p>
                        <p className='text-2xl font-bold text-orange-800'>
                          2.4 GB
                        </p>
                      </div>
                      <i className='fa-solid fa-hard-drive text-xl text-orange-600'></i>
                    </div>
                  </div>
                  <div className='h-auto rounded-md p-4 bg-green-50 border border-green-200'>
                    <div className='flex w-full items-center justify-between'>
                      <div>
                        <p className='mb-2 text-sm text-green-700'>
                          Document Types
                        </p>
                        <p className='text-2xl font-bold text-green-800'>5</p>
                      </div>
                      <Folder className='w-6 h-6 text-green-600 stroke-1' />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Documents Table */}
            <div className='rounded-xl border border-gray-200 bg-white'>
              <div className='p-6'>
                <div className='flex flex-col gap-4'>
                  <div className='flex flex-col items-start justify-between md:flex-row md:items-center'>
                    <div>
                      <h2 className='text-xl font-semibold text-[#2D3436]'>
                        All Documents
                      </h2>
                      <p className='text-[#7F8C8D]'>24 total documents</p>
                    </div>
                  </div>

                  {/* Filters */}
                  <div className='flex flex-col gap-4 md:flex-row md:items-center'>
                    <div className='relative flex-1'>
                      <i className='fa-solid fa-search absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400'></i>
                      <input
                        placeholder='Search documents, properties, or tenants...'
                        className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm'
                      />
                    </div>

                    <div className='flex gap-2'>
                      <select className='w-[150px] px-3 py-2 border border-gray-300 rounded-lg text-sm'>
                        <option>All Properties</option>
                        <option>Sunset Villa</option>
                        <option>Parkview Apartments</option>
                        <option>Garden Cottage</option>
                      </select>

                      <select className='w-[120px] px-3 py-2 border border-gray-300 rounded-lg text-sm'>
                        <option>All Types</option>
                        <option>PDF</option>
                        <option>Images</option>
                        <option>Documents</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Table */}
                <div className='mt-6 rounded-md border overflow-x-auto'>
                  <table className='w-full min-w-[700px]'>
                    <thead>
                      <tr className='border-b bg-gray-50'>
                        <th className='p-4 text-left text-sm font-semibold text-[#2D3436]'>
                          File Name
                        </th>
                        <th className='p-4 text-left text-sm font-semibold text-[#2D3436]'>
                          Size
                        </th>
                        <th className='p-4 text-left text-sm font-semibold text-[#2D3436]'>
                          Associated With
                        </th>
                        <th className='p-4 text-left text-sm font-semibold text-[#2D3436]'>
                          Uploaded
                        </th>
                        <th className='p-4 text-left text-sm font-semibold text-[#2D3436]'>
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Document 1 - Lease Agreement */}
                      <tr className='border-b hover:bg-gray-50'>
                        <td className='p-4'>
                          <div className='flex items-center space-x-3'>
                            <FileText className='text-[#3498DB] h-5 w-5 stroke-1' />
                            <div>
                              <p className='font-medium text-[#2D3436]'>
                                lease-agreement-sunset-villa.pdf
                              </p>
                              <p className='text-xs text-gray-500 uppercase'>
                                PDF
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className='p-4'>
                          <span className='text-sm text-gray-600'>2.4 MB</span>
                        </td>
                        <td className='p-4'>
                          <div className='flex items-center space-x-2'>
                            <span className='bg-[#2ECC71]/10 text-[#2ECC71] text-xs font-medium px-3 py-1 rounded-full border border-[#2ECC71]/20'>
                              Lease
                            </span>
                            <span className='text-sm'>
                              Sunset Villa - Unit Main
                            </span>
                          </div>
                        </td>
                        <td className='p-4'>
                          <div className='flex items-center space-x-2'>
                            <Calendar className='h-4 w-4 text-gray-500' />
                            <span className='text-sm'>Jan 15, 2024</span>
                          </div>
                        </td>
                        <td className='p-4'>
                          <button className='text-gray-400 hover:text-gray-600'>
                            <i className='fa-solid fa-ellipsis-h'></i>
                          </button>
                        </td>
                      </tr>

                      {/* Document 2 - Property Photo */}
                      <tr className='border-b hover:bg-gray-50'>
                        <td className='p-4'>
                          <div className='flex items-center space-x-3'>
                            <FileText className='text-[#3498DB] h-5 w-5 stroke-1' />
                            <div>
                              <p className='font-medium text-[#2D3436]'>
                                property-exterior-photo.jpg
                              </p>
                              <p className='text-xs text-gray-500 uppercase'>
                                JPEG
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className='p-4'>
                          <span className='text-sm text-gray-600'>1.8 MB</span>
                        </td>
                        <td className='p-4'>
                          <div className='flex items-center space-x-2'>
                            <span className='bg-[#3498DB]/10 text-[#3498DB] text-xs font-medium px-3 py-1 rounded-full border border-[#3498DB]/20'>
                              Property
                            </span>
                            <span className='text-sm'>Parkview Apartments</span>
                          </div>
                        </td>
                        <td className='p-4'>
                          <div className='flex items-center space-x-2'>
                            <Calendar className='h-4 w-4 text-gray-500' />
                            <span className='text-sm'>Jan 10, 2024</span>
                          </div>
                        </td>
                        <td className='p-4'>
                          <button className='text-gray-400 hover:text-gray-600'>
                            <i className='fa-solid fa-ellipsis-h'></i>
                          </button>
                        </td>
                      </tr>

                      {/* Document 3 - Tenant ID */}
                      <tr className='border-b hover:bg-gray-50'>
                        <td className='p-4'>
                          <div className='flex items-center space-x-3'>
                            <FileText className='text-[#3498DB] h-5 w-5 stroke-1' />
                            <div>
                              <p className='font-medium text-[#2D3436]'>
                                john-smith-id-copy.pdf
                              </p>
                              <p className='text-xs text-gray-500 uppercase'>
                                PDF
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className='p-4'>
                          <span className='text-sm text-gray-600'>856 KB</span>
                        </td>
                        <td className='p-4'>
                          <div className='flex items-center space-x-2'>
                            <div className='w-6 h-6 bg-[#3498DB] rounded-full flex items-center justify-center text-white text-xs font-medium'>
                              JS
                            </div>
                            <span className='text-sm'>John Smith</span>
                          </div>
                        </td>
                        <td className='p-4'>
                          <div className='flex items-center space-x-2'>
                            <Calendar className='h-4 w-4 text-gray-500' />
                            <span className='text-sm'>Jan 08, 2024</span>
                          </div>
                        </td>
                        <td className='p-4'>
                          <button className='text-gray-400 hover:text-gray-600'>
                            <i className='fa-solid fa-ellipsis-h'></i>
                          </button>
                        </td>
                      </tr>

                      {/* Document 4 - Invoice */}
                      <tr className='border-b hover:bg-gray-50'>
                        <td className='p-4'>
                          <div className='flex items-center space-x-3'>
                            <FileText className='text-[#3498DB] h-5 w-5 stroke-1' />
                            <div>
                              <p className='font-medium text-[#2D3436]'>
                                invoice-2024001-receipt.pdf
                              </p>
                              <p className='text-xs text-gray-500 uppercase'>
                                PDF
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className='p-4'>
                          <span className='text-sm text-gray-600'>324 KB</span>
                        </td>
                        <td className='p-4'>
                          <div className='flex items-center space-x-2'>
                            <span className='bg-[#F39C12]/10 text-[#F39C12] text-xs font-medium px-3 py-1 rounded-full border border-[#F39C12]/20'>
                              Invoice
                            </span>
                            <span className='text-sm'>#INV-2024001</span>
                          </div>
                        </td>
                        <td className='p-4'>
                          <div className='flex items-center space-x-2'>
                            <Calendar className='h-4 w-4 text-gray-500' />
                            <span className='text-sm'>Jan 05, 2024</span>
                          </div>
                        </td>
                        <td className='p-4'>
                          <button className='text-gray-400 hover:text-gray-600'>
                            <i className='fa-solid fa-ellipsis-h'></i>
                          </button>
                        </td>
                      </tr>

                      {/* Document 5 - Maintenance Request */}
                      <tr className='border-b hover:bg-gray-50'>
                        <td className='p-4'>
                          <div className='flex items-center space-x-3'>
                            <FileText className='text-[#3498DB] h-5 w-5 stroke-1' />
                            <div>
                              <p className='font-medium text-[#2D3436]'>
                                maintenance-kitchen-sink.jpg
                              </p>
                              <p className='text-xs text-gray-500 uppercase'>
                                JPEG
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className='p-4'>
                          <span className='text-sm text-gray-600'>1.2 MB</span>
                        </td>
                        <td className='p-4'>
                          <div className='flex items-center space-x-2'>
                            <span className='bg-[#7F8C8D]/10 text-[#7F8C8D] text-xs font-medium px-3 py-1 rounded-full border border-[#7F8C8D]/20'>
                              Maintenance
                            </span>
                            <span className='text-sm'>Kitchen Sink Repair</span>
                          </div>
                        </td>
                        <td className='p-4'>
                          <div className='flex items-center space-x-2'>
                            <Calendar className='h-4 w-4 text-gray-500' />
                            <span className='text-sm'>Dec 28, 2023</span>
                          </div>
                        </td>
                        <td className='p-4'>
                          <button className='text-gray-400 hover:text-gray-600'>
                            <i className='fa-solid fa-ellipsis-h'></i>
                          </button>
                        </td>
                      </tr>

                      {/* Document 6 - General Document */}
                      <tr className='border-b hover:bg-gray-50'>
                        <td className='p-4'>
                          <div className='flex items-center space-x-3'>
                            <FileText className='text-[#3498DB] h-5 w-5 stroke-1' />
                            <div>
                              <p className='font-medium text-[#2D3436]'>
                                property-insurance-policy.pdf
                              </p>
                              <p className='text-xs text-gray-500 uppercase'>
                                PDF
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className='p-4'>
                          <span className='text-sm text-gray-600'>3.1 MB</span>
                        </td>
                        <td className='p-4'>
                          <div className='flex items-center space-x-2'>
                            <span className='bg-[#7F8C8D]/10 text-[#7F8C8D] text-xs font-medium px-3 py-1 rounded-full border border-[#7F8C8D]/20'>
                              General
                            </span>
                          </div>
                        </td>
                        <td className='p-4'>
                          <div className='flex items-center space-x-2'>
                            <Calendar className='h-4 w-4 text-gray-500' />
                            <span className='text-sm'>Dec 20, 2023</span>
                          </div>
                        </td>
                        <td className='p-4'>
                          <button className='text-gray-400 hover:text-gray-600'>
                            <i className='fa-solid fa-ellipsis-h'></i>
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className='flex items-center justify-between px-6 py-4'>
                  <div className='flex items-center gap-2'>
                    <button className='px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 cursor-not-allowed opacity-50'>
                      Previous
                    </button>
                    <button className='px-3 py-1 bg-[#3498DB] text-white rounded text-sm'>
                      1
                    </button>
                    <button className='px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50'>
                      2
                    </button>
                    <button className='px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50'>
                      Next
                    </button>
                  </div>
                  <div className='text-sm text-gray-600'>
                    Showing 1-6 of 24 documents
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const LeasesPreview = () => {
  return (
    <div className='bg-[#ECF0F1] p-2 sm:p-4 rounded-2xl *:text-left scale-[0.7] sm:scale-[0.85] lg:scale-[0.95] relative border border-[#CBD5E1] transition-all overflow-hidden hidden lg:block h-[50rem] ring-8 ring-primary/10 pointer-events-none'>
      <div className='flex w-full mx-auto min-h-[400px]'>
        <div className='hidden lg:block'>
          <PreviewSidebar activeItem='leases' />
        </div>

        {/* Main Content */}
        <div className='flex-1 h-full bg-[#ECF0F1] px-2 sm:px-4 lg:px-8 py-4 sm:py-8 pt-[40px] sm:pt-[73px]'>
          <div className='mx-auto max-w-7xl flex flex-col space-y-8'>
            {/* Page Header */}
            <div className='rounded-xl border border-gray-200 bg-white'>
              <div className='p-6'>
                <div className='flex flex-col items-start justify-between md:flex-row md:items-center'>
                  <div>
                    <h1 className='text-2xl font-bold text-[#2D3436]'>
                      Lease Management
                    </h1>
                    <p className='text-[#7F8C8D]'>
                      Manage tenant leases and rental agreements
                    </p>
                  </div>
                  <div className='mt-4 flex gap-3 md:mt-0'>
                    <button className='border border-[#3498DB] text-[#3498DB] px-4 py-2 rounded-lg flex items-center text-sm'>
                      <DownloadIcon className='mr-2 h-4 w-4' />
                      Export
                    </button>
                    <button className='bg-[#3498DB] text-white px-4 py-2 rounded-lg flex items-center text-sm'>
                      <Plus className='mr-2 h-4 w-4' />
                      Create Lease
                    </button>
                  </div>
                </div>

                {/* Summary Cards */}
                <div className='grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-4 mt-4 sm:mt-6'>
                  <div className='h-auto rounded-md p-2 sm:p-4 bg-green-50 border border-green-200'>
                    <div className='flex w-full items-center justify-between'>
                      <div>
                        <p className='mb-1 sm:mb-2 text-xs sm:text-sm text-green-700'>
                          Active Leases
                        </p>
                        <p className='text-lg sm:text-2xl font-bold text-green-800'>
                          5
                        </p>
                      </div>
                      <FileText className='w-6 h-6 text-green-600 stroke-1' />
                    </div>
                  </div>
                  <div className='h-auto rounded-md p-2 sm:p-4 bg-orange-50 border border-orange-200'>
                    <div className='flex w-full items-center justify-between'>
                      <div>
                        <p className='mb-1 sm:mb-2 text-xs sm:text-sm text-orange-700'>
                          Expiring Soon
                        </p>
                        <p className='text-lg sm:text-2xl font-bold text-orange-800'>
                          2
                        </p>
                      </div>
                      <AlertCircle className='w-6 h-6 text-orange-600 stroke-1' />
                    </div>
                  </div>
                  <div className='h-auto rounded-md p-2 sm:p-4 bg-blue-50 border border-blue-200'>
                    <div className='flex w-full items-center justify-between'>
                      <div>
                        <p className='mb-1 sm:mb-2 text-xs sm:text-sm text-blue-700'>
                          Total Revenue
                        </p>
                        <p className='text-lg sm:text-2xl font-bold text-blue-800'>
                          R 82,000
                        </p>
                      </div>
                      <Banknote className='w-6 h-6 text-blue-600 stroke-1' />
                    </div>
                  </div>
                  <div className='h-auto rounded-md p-2 sm:p-4 bg-red-50 border border-red-200'>
                    <div className='flex w-full items-center justify-between'>
                      <div>
                        <p className='mb-1 sm:mb-2 text-xs sm:text-sm text-red-700'>
                          Vacant Units
                        </p>
                        <p className='text-lg sm:text-2xl font-bold text-red-800'>
                          1
                        </p>
                      </div>
                      <DoorOpen className='w-6 h-6 text-red-600 stroke-1' />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Leases Table */}
            <div className='rounded-xl border border-gray-200 bg-white'>
              <div className='p-6'>
                <div className='flex flex-col gap-4'>
                  <div className='flex flex-col items-start justify-between md:flex-row md:items-center'>
                    <div>
                      <h2 className='text-xl font-semibold text-[#2D3436]'>
                        All Leases
                      </h2>
                      <p className='text-[#7F8C8D]'>
                        5 active lease agreements
                      </p>
                    </div>
                  </div>

                  {/* Filters */}
                  <div className='flex flex-col gap-4 md:flex-row md:items-center'>
                    <div className='relative flex-1'>
                      <i className='fa-solid fa-search absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400'></i>
                      <input
                        placeholder='Search leases, tenants, or properties...'
                        className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm'
                      />
                    </div>

                    <div className='flex gap-2'>
                      <select className='w-[150px] px-3 py-2 border border-gray-300 rounded-lg text-sm'>
                        <option>All Status</option>
                        <option>Active</option>
                        <option>Expiring Soon</option>
                        <option>Expired</option>
                      </select>

                      <select className='w-[200px] px-3 py-2 border border-gray-300 rounded-lg text-sm'>
                        <option>All Properties</option>
                        <option>Sunset Villa</option>
                        <option>Parkview Apartments</option>
                        <option>Garden Cottage</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Table */}
                <div className='mt-4 sm:mt-6 rounded-md border overflow-x-auto'>
                  <table className='w-full min-w-[800px]'>
                    <thead>
                      <tr className='border-b bg-gray-50'>
                        <th className='p-2 sm:p-4 text-left text-xs sm:text-sm font-semibold text-[#2D3436]'>
                          Tenant
                        </th>
                        <th className='p-2 sm:p-4 text-left text-xs sm:text-sm font-semibold text-[#2D3436]'>
                          Property
                        </th>
                        <th className='p-2 sm:p-4 text-left text-xs sm:text-sm font-semibold text-[#2D3436]'>
                          Rent Amount
                        </th>
                        <th className='p-2 sm:p-4 text-left text-xs sm:text-sm font-semibold text-[#2D3436]'>
                          Start Date
                        </th>
                        <th className='p-2 sm:p-4 text-left text-xs sm:text-sm font-semibold text-[#2D3436]'>
                          End Date
                        </th>
                        <th className='p-2 sm:p-4 text-left text-xs sm:text-sm font-semibold text-[#2D3436]'>
                          Status
                        </th>
                        <th className='p-2 sm:p-4 text-left text-xs sm:text-sm font-semibold text-[#2D3436]'>
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Lease 1 - Active */}
                      <tr className='border-b hover:bg-gray-50'>
                        <td className='p-2 sm:p-4'>
                          <div className='flex items-center'>
                            <div className='w-6 h-6 sm:w-8 sm:h-8 bg-[#3498DB] rounded-full flex items-center justify-center text-white text-xs font-medium mr-2 sm:mr-3'>
                              JS
                            </div>
                            <div>
                              <p className='font-medium text-xs sm:text-sm text-[#2D3436]'>
                                John Smith
                              </p>
                              <p className='text-xs text-[#7F8C8D] hidden sm:block'>
                                john@example.com
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className='p-2 sm:p-4'>
                          <div>
                            <p className='text-xs sm:text-sm text-[#2D3436] font-medium'>
                              Sunset Villa
                            </p>
                            <p className='text-xs text-[#7F8C8D]'>
                              45 Ocean Drive, Cape Town
                            </p>
                          </div>
                        </td>
                        <td className='p-2 sm:p-4'>
                          <span className='font-semibold text-xs sm:text-sm text-[#2D3436]'>
                            R 25,000
                          </span>
                          <p className='text-xs text-[#7F8C8D]'>per month</p>
                        </td>
                        <td className='p-2 sm:p-4'>
                          <p className='text-xs sm:text-sm text-[#2D3436]'>
                            Jan 01, 2024
                          </p>
                        </td>
                        <td className='p-2 sm:p-4'>
                          <p className='text-xs sm:text-sm text-[#2D3436]'>
                            Dec 31, 2024
                          </p>
                        </td>
                        <td className='p-2 sm:p-4'>
                          <span className='bg-green-100 text-green-800 text-xs font-medium px-2 sm:px-3 py-1 rounded-full border border-green-200'>
                            Active
                          </span>
                        </td>
                        <td className='p-2 sm:p-4'>
                          <button className='text-gray-400 hover:text-gray-600'>
                            <i className='fa-solid fa-ellipsis-h'></i>
                          </button>
                        </td>
                      </tr>

                      {/* Lease 2 - Active */}
                      <tr className='border-b hover:bg-gray-50'>
                        <td className='p-4'>
                          <div className='flex items-center'>
                            <div className='w-8 h-8 bg-[#3498DB] rounded-full flex items-center justify-center text-white text-xs font-medium mr-3'>
                              MJ
                            </div>
                            <div>
                              <p className='font-medium text-[#2D3436]'>
                                Mary Johnson
                              </p>
                              <p className='text-sm text-[#7F8C8D]'>
                                mary@example.com
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className='p-4'>
                          <div>
                            <p className='text-[#2D3436] font-medium'>
                              Parkview Apartments
                            </p>
                            <p className='text-sm text-[#7F8C8D]'>
                              Unit 201 - 123 Park Avenue, Johannesburg
                            </p>
                          </div>
                        </td>
                        <td className='p-4'>
                          <span className='font-semibold text-[#2D3436]'>
                            R 12,000
                          </span>
                          <p className='text-sm text-[#7F8C8D]'>per month</p>
                        </td>
                        <td className='p-4'>
                          <p className='text-[#2D3436]'>Mar 01, 2024</p>
                        </td>
                        <td className='p-4'>
                          <p className='text-[#2D3436]'>Feb 28, 2025</p>
                        </td>
                        <td className='p-4'>
                          <span className='bg-green-100 text-green-800 text-xs font-medium px-3 py-1 rounded-full border border-green-200'>
                            Active
                          </span>
                        </td>
                        <td className='p-4'>
                          <button className='text-gray-400 hover:text-gray-600'>
                            <i className='fa-solid fa-ellipsis-h'></i>
                          </button>
                        </td>
                      </tr>

                      {/* Lease 3 - Expiring Soon */}
                      <tr className='border-b hover:bg-gray-50'>
                        <td className='p-4'>
                          <div className='flex items-center'>
                            <div className='w-8 h-8 bg-[#3498DB] rounded-full flex items-center justify-center text-white text-xs font-medium mr-3'>
                              DW
                            </div>
                            <div>
                              <p className='font-medium text-[#2D3436]'>
                                David Wilson
                              </p>
                              <p className='text-sm text-[#7F8C8D]'>
                                david@example.com
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className='p-4'>
                          <div>
                            <p className='text-[#2D3436] font-medium'>
                              Parkview Apartments
                            </p>
                            <p className='text-sm text-[#7F8C8D]'>
                              Unit 101 - 123 Park Avenue, Johannesburg
                            </p>
                          </div>
                        </td>
                        <td className='p-4'>
                          <span className='font-semibold text-[#2D3436]'>
                            R 12,000
                          </span>
                          <p className='text-sm text-[#7F8C8D]'>per month</p>
                        </td>
                        <td className='p-4'>
                          <p className='text-[#2D3436]'>Jan 15, 2024</p>
                        </td>
                        <td className='p-4'>
                          <p className='text-[#F39C12]'>Jan 15, 2025</p>
                        </td>
                        <td className='p-4'>
                          <span className='bg-orange-100 text-orange-800 text-xs font-medium px-3 py-1 rounded-full border border-orange-200'>
                            Expiring Soon
                          </span>
                        </td>
                        <td className='p-4'>
                          <button className='text-gray-400 hover:text-gray-600'>
                            <i className='fa-solid fa-ellipsis-h'></i>
                          </button>
                        </td>
                      </tr>

                      {/* Lease 4 - Active */}
                      <tr className='border-b hover:bg-gray-50'>
                        <td className='p-4'>
                          <div className='flex items-center'>
                            <div className='w-8 h-8 bg-[#3498DB] rounded-full flex items-center justify-center text-white text-xs font-medium mr-3'>
                              SA
                            </div>
                            <div>
                              <p className='font-medium text-[#2D3436]'>
                                Sarah Adams
                              </p>
                              <p className='text-sm text-[#7F8C8D]'>
                                sarah@example.com
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className='p-4'>
                          <div>
                            <p className='text-[#2D3436] font-medium'>
                              Garden Cottage
                            </p>
                            <p className='text-sm text-[#7F8C8D]'>
                              78 Maple Street, Durban
                            </p>
                          </div>
                        </td>
                        <td className='p-4'>
                          <span className='font-semibold text-[#2D3436]'>
                            R 15,000
                          </span>
                          <p className='text-sm text-[#7F8C8D]'>per month</p>
                        </td>
                        <td className='p-4'>
                          <p className='text-[#2D3436]'>Jun 01, 2024</p>
                        </td>
                        <td className='p-4'>
                          <p className='text-[#2D3436]'>May 31, 2025</p>
                        </td>
                        <td className='p-4'>
                          <span className='bg-green-100 text-green-800 text-xs font-medium px-3 py-1 rounded-full border border-green-200'>
                            Active
                          </span>
                        </td>
                        <td className='p-4'>
                          <button className='text-gray-400 hover:text-gray-600'>
                            <i className='fa-solid fa-ellipsis-h'></i>
                          </button>
                        </td>
                      </tr>

                      {/* Lease 5 - Expiring Soon */}
                      <tr className='border-b hover:bg-gray-50'>
                        <td className='p-4'>
                          <div className='flex items-center'>
                            <div className='w-8 h-8 bg-[#3498DB] rounded-full flex items-center justify-center text-white text-xs font-medium mr-3'>
                              RT
                            </div>
                            <div>
                              <p className='font-medium text-[#2D3436]'>
                                Robert Taylor
                              </p>
                              <p className='text-sm text-[#7F8C8D]'>
                                robert@example.com
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className='p-4'>
                          <div>
                            <p className='text-[#2D3436] font-medium'>
                              Sunset Villa
                            </p>
                            <p className='text-sm text-[#7F8C8D]'>
                              Guest House - 45 Ocean Drive, Cape Town
                            </p>
                          </div>
                        </td>
                        <td className='p-4'>
                          <span className='font-semibold text-[#2D3436]'>
                            R 18,000
                          </span>
                          <p className='text-sm text-[#7F8C8D]'>per month</p>
                        </td>
                        <td className='p-4'>
                          <p className='text-[#2D3436]'>Feb 01, 2024</p>
                        </td>
                        <td className='p-4'>
                          <p className='text-[#F39C12]'>Jan 31, 2025</p>
                        </td>
                        <td className='p-4'>
                          <span className='bg-orange-100 text-orange-800 text-xs font-medium px-3 py-1 rounded-full border border-orange-200'>
                            Expiring Soon
                          </span>
                        </td>
                        <td className='p-4'>
                          <button className='text-gray-400 hover:text-gray-600'>
                            <i className='fa-solid fa-ellipsis-h'></i>
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className='flex items-center justify-between px-6 py-4'>
                  <div className='flex items-center gap-2'>
                    <button className='px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 cursor-not-allowed opacity-50'>
                      Previous
                    </button>
                    <button className='px-3 py-1 bg-[#3498DB] text-white rounded text-sm'>
                      1
                    </button>
                    <button className='px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50'>
                      Next
                    </button>
                  </div>
                  <div className='text-sm text-gray-600'>
                    Showing 1-5 of 5 leases
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
