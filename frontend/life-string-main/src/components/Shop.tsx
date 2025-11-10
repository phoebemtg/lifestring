import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ShoppingCart, Package, Store } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/contexts/CartContext";

interface Product {
  id: string;
  name: string;
  description: string;
  product_type: string;
  base_price: number;
  image_url: string;
  sizes: string[] | null;
  colors: string[] | null;
  house_id: number;
  printify_product_id: string;
}

interface ShopProps {
  communityId: number;
  communityName: string;
}

export const Shop = ({ communityId, communityName }: ShopProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSizes, setSelectedSizes] = useState<{[key: string]: string}>({});
  const [selectedColors, setSelectedColors] = useState<{[key: string]: string}>({});
  const { toast } = useToast();
  const { user } = useAuth();
  const { addItem } = useCart();

  useEffect(() => {
    fetchProducts();
  }, [communityId]);

  const fetchProducts = async () => {
    try {
      const { data: dbProducts, error: dbError } = await supabase
        .from('products')
        .select('*')
        .eq('house_id', communityId)
        .eq('is_active', true);

      if (dbError) throw dbError;

      setProducts(dbProducts as Product[] || []);
    } catch (error: any) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error",
        description: "Failed to fetch products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product: Product) => {
    const size = selectedSizes[product.id];
    const color = selectedColors[product.id];
    
    if (!size) {
      toast({
        title: "Please select a size",
        description: "Choose a size before adding to cart",
        variant: "destructive",
      });
      return;
    }
    
    if (!color) {
      toast({
        title: "Please select a color",
        description: "Choose a color before adding to cart",
        variant: "destructive",
      });
      return;
    }

    // Add to cart using CartContext
    addItem({
      productId: product.id,
      name: product.name,
      price: product.base_price,
      size,
      color,
      quantity: 1,
      image_url: product.image_url,
      printify_product_id: product.printify_product_id,
      community_id: product.house_id,
    });

    toast({
      title: "Added to Cart",
      description: `${product.name} (${size}, ${color}) added to cart`,
    });
  };

  const handleSizeChange = (productId: string, size: string) => {
    setSelectedSizes(prev => ({ ...prev, [productId]: size }));
  };

  const handleColorChange = (productId: string, color: string) => {
    setSelectedColors(prev => ({ ...prev, [productId]: color }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Store className="h-6 w-6" />
        <h2 className="text-2xl font-bold">{communityName} Shop</h2>
      </div>

      {products.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>No Products Available</CardTitle>
            <CardDescription>
              No products found for this community. Products will be available soon.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <Card key={product.id} className="overflow-hidden">
            {product.image_url && (
              <div className="aspect-square overflow-hidden">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                  <Badge variant="secondary" className="mt-1">
                    {product.product_type}
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">${product.base_price}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                {product.description}
              </p>
              
              {product.sizes && Array.isArray(product.sizes) && product.sizes.length > 0 && (
                <div className="mb-3">
                  <p className="text-sm font-medium mb-2">Size:</p>
                  <Select
                    value={selectedSizes[product.id] || ''}
                    onValueChange={(value) => handleSizeChange(product.id, value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      {product.sizes.map((size) => (
                        <SelectItem key={size} value={size}>
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {product.colors && Array.isArray(product.colors) && product.colors.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium mb-2">Color:</p>
                  <Select
                    value={selectedColors[product.id] || ''}
                    onValueChange={(value) => handleColorChange(product.id, value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select color" />
                    </SelectTrigger>
                    <SelectContent>
                      {product.colors.map((color) => (
                        <SelectItem key={color} value={color}>
                          {color}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Button 
                onClick={() => handleAddToCart(product)}
                className="w-full"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add to Cart
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};