-- Tavern Creative - Database Schema
-- Run this in the Supabase SQL Editor to set up all tables

-- Profiles (extends auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Admins can view all profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Templates
create table public.templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  category text not null check (category in ('save-the-date', 'invitation', 'on-the-day', 'thank-you')),
  dimensions jsonb not null,
  sections jsonb not null default '[]'::jsonb,
  color_palettes jsonb not null default '[]'::jsonb,
  font_options jsonb not null default '[]'::jsonb,
  background jsonb,
  thumbnail_url text,
  status text not null default 'draft' check (status in ('draft', 'active', 'archived')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.templates enable row level security;

create policy "Anyone can view active templates"
  on public.templates for select
  using (status = 'active');

create policy "Admins can manage templates"
  on public.templates for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Products
create table public.products (
  id uuid primary key default gen_random_uuid(),
  template_id uuid references public.templates(id) on delete cascade not null,
  name text not null,
  slug text unique not null,
  description text,
  price_pence integer not null,
  print_options jsonb not null default '{"quantities": [25, 50, 75, 100], "paper_stocks": ["cotton-350gsm"]}'::jsonb,
  is_digital_only boolean default false,
  featured boolean default false,
  sort_order integer default 0,
  status text not null default 'draft' check (status in ('draft', 'active', 'archived')),
  created_at timestamptz default now()
);

alter table public.products enable row level security;

create policy "Anyone can view active products"
  on public.products for select
  using (status = 'active');

create policy "Admins can manage products"
  on public.products for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Customizations (saved designs, before payment)
create table public.customizations (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete cascade not null,
  session_token text not null,
  customer_id uuid references public.profiles(id),
  sections_data jsonb not null default '{}'::jsonb,
  selected_palette text not null default '',
  selected_fonts text not null default '',
  proof_pdf_url text,
  status text not null default 'draft' check (status in ('draft', 'proof_generated', 'proof_approved')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_customizations_session on public.customizations(session_token);
create index idx_customizations_customer on public.customizations(customer_id);

alter table public.customizations enable row level security;

create policy "Anyone can create customizations"
  on public.customizations for insert
  with check (true);

create policy "Session owners can view customizations"
  on public.customizations for select
  using (true);

create policy "Session owners can update customizations"
  on public.customizations for update
  using (true);

create policy "Admins can manage customizations"
  on public.customizations for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Orders (created after payment)
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.profiles(id),
  customization_id uuid references public.customizations(id) not null,
  product_id uuid references public.products(id) not null,
  status text not null default 'payment_complete' check (status in ('payment_complete', 'in_production', 'shipped', 'delivered')),
  print_config jsonb not null,
  final_pdf_url text,
  total_pence integer not null,
  shipping_address jsonb,
  stripe_checkout_session_id text,
  stripe_payment_intent_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_orders_customer on public.orders(customer_id);
create index idx_orders_status on public.orders(status);

alter table public.orders enable row level security;

create policy "Customers can view own orders"
  on public.orders for select
  using (customer_id = auth.uid());

create policy "Admins can manage orders"
  on public.orders for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Order Events (audit trail)
create table public.order_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade not null,
  event_type text not null,
  metadata jsonb,
  created_at timestamptz default now()
);

alter table public.order_events enable row level security;

create policy "Admins can manage order events"
  on public.order_events for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Indexes for common queries
create index idx_templates_slug on public.templates(slug);
create index idx_templates_status on public.templates(status);
create index idx_products_slug on public.products(slug);
create index idx_products_status on public.products(status);
create index idx_products_featured on public.products(featured) where featured = true;

-- Updated_at trigger
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger templates_updated_at
  before update on public.templates
  for each row execute function public.update_updated_at();

create trigger customizations_updated_at
  before update on public.customizations
  for each row execute function public.update_updated_at();

create trigger orders_updated_at
  before update on public.orders
  for each row execute function public.update_updated_at();
