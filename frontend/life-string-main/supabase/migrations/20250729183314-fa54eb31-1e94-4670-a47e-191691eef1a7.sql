-- Create products table for house-branded merchandise
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  house_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  product_type TEXT NOT NULL, -- 't-shirt', 'jersey', 'cap', 'socks'
  base_price DECIMAL(10,2) NOT NULL,
  printify_product_id TEXT, -- Reference to Printify product
  printify_variant_id TEXT, -- Reference to Printify variant
  image_url TEXT,
  sizes JSONB DEFAULT '[]'::jsonb, -- Available sizes
  colors JSONB DEFAULT '[]'::jsonb, -- Available colors
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID NOT NULL
);

-- Create orders table to track customer purchases
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  house_id INTEGER NOT NULL,
  stripe_session_id TEXT UNIQUE,
  stripe_payment_intent_id TEXT,
  printify_order_id TEXT, -- Reference to Printify order
  total_amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'usd',
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'
  shipping_address JSONB NOT NULL,
  billing_address JSONB,
  customer_email TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  tracking_number TEXT,
  tracking_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create order_items table for individual products within orders
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  printify_print_provider_id TEXT,
  printify_variant_id TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  size TEXT,
  color TEXT,
  customization_details JSONB, -- House branding details
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for products
CREATE POLICY "Anyone can view active products" 
ON public.products 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Authenticated users can create products" 
ON public.products 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creators can update their products" 
ON public.products 
FOR UPDATE 
USING (auth.uid() = created_by);

CREATE POLICY "Creators can delete their products" 
ON public.products 
FOR DELETE 
USING (auth.uid() = created_by);

-- RLS Policies for orders
CREATE POLICY "Users can view their own orders" 
ON public.orders 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders" 
ON public.orders 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own orders" 
ON public.orders 
FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policies for order_items
CREATE POLICY "Users can view order items for their orders" 
ON public.order_items 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.orders 
  WHERE orders.id = order_items.order_id 
  AND orders.user_id = auth.uid()
));

CREATE POLICY "Users can create order items for their orders" 
ON public.order_items 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.orders 
  WHERE orders.id = order_items.order_id 
  AND orders.user_id = auth.uid()
));

-- Create indexes for better performance
CREATE INDEX idx_products_house_id ON public.products(house_id);
CREATE INDEX idx_products_type ON public.products(product_type);
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_house_id ON public.orders(house_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX idx_order_items_product_id ON public.order_items(product_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();