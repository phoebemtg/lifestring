import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Package, Download, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface PrintifyProduct {
  printify_product_id: string;
  name: string;
  description: string;
  product_type: string;
  base_price: number;
  image_url: string;
  sizes: string[];
  colors: string[];
  variants: any[];
  options: any[];
  images: any[];
}

interface House {
  id: number;
  name: string;
  colors: [string, string];
}

interface ProductMapping {
  printify_product_id: string;
  house_id: number | null;
  name: string;
  description: string;
  price: number;
}

interface ProductManagerProps {
  isOpen: boolean;
  onClose: () => void;
  houses: House[];
}

const ProductManager: React.FC<ProductManagerProps> = ({ isOpen, onClose, houses }) => {
  const [printifyProducts, setPrintifyProducts] = useState<PrintifyProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [productMappings, setProductMappings] = useState<ProductMapping[]>([]);

  const fetchPrintifyProducts = async () => {
    setLoading(true);
    try {
      // First, get the shop ID from the get-printify-shops function
      const { data: shopsData, error: shopsError } = await supabase.functions.invoke('get-printify-shops');
      
      if (shopsError) throw shopsError;
      
      const shops = shopsData?.shops || [];
      if (shops.length === 0) {
        throw new Error('No Printify shops found');
      }

      // Use the first shop ID to fetch products
      const shopId = shops[0].id;
      
      const { data: productsData, error: productsError } = await supabase.functions.invoke('get-printify-products', {
        body: { shop_id: shopId }
      });

      if (productsError) throw productsError;

      const products = productsData?.products || [];
      setPrintifyProducts(products);
      
      // Initialize product mappings
      const mappings: ProductMapping[] = products.map((product: PrintifyProduct) => ({
        printify_product_id: product.printify_product_id,
        house_id: null,
        name: product.name,
        description: product.description,
        price: 40 // Default $40 pricing
      }));
      
      setProductMappings(mappings);
      
      toast({
        title: "Products Loaded",
        description: `Found ${products.length} products from Printify`,
      });
    } catch (error) {
      console.error('Error fetching Printify products:', error);
      toast({
        title: "Error",
        description: "Failed to fetch Printify products. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProductMapping = (printifyProductId: string, field: keyof ProductMapping, value: any) => {
    setProductMappings(prev => 
      prev.map(mapping => 
        mapping.printify_product_id === printifyProductId 
          ? { ...mapping, [field]: value }
          : mapping
      )
    );
  };

  const saveAllMappings = async () => {
    setSaving(true);
    try {
      const mappingsToSave = productMappings.filter(mapping => mapping.house_id !== null);
      
      if (mappingsToSave.length === 0) {
        toast({
          title: "No Mappings",
          description: "Please assign at least one product to a house before saving.",
          variant: "destructive",
        });
        return;
      }

      // Get current user for created_by field
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const productsToInsert = mappingsToSave.map(mapping => {
        const printifyProduct = printifyProducts.find(p => p.printify_product_id === mapping.printify_product_id);
        return {
          name: `${houses.find(h => h.id === mapping.house_id)?.name} Jersey`,
          description: mapping.description,
          product_type: 'jersey',
          base_price: mapping.price,
          house_id: mapping.house_id,
          printify_product_id: mapping.printify_product_id,
          image_url: printifyProduct?.image_url || '',
          sizes: printifyProduct?.sizes || [],
          colors: printifyProduct?.colors || [],
          is_active: true,
          created_by: user?.id || '',
        };
      });

      const { error } = await supabase
        .from('products')
        .insert(productsToInsert);

      if (error) throw error;

      toast({
        title: "Products Saved",
        description: `Successfully saved ${mappingsToSave.length} jersey products to the database.`,
      });

      onClose();
    } catch (error) {
      console.error('Error saving product mappings:', error);
      toast({
        title: "Error",
        description: "Failed to save product mappings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Product Management
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="jerseys" className="w-full">
          <TabsList className="grid w-full grid-cols-1">
            <TabsTrigger value="jerseys">Jerseys</TabsTrigger>
          </TabsList>

          <TabsContent value="jerseys" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Jersey Import & Mapping</CardTitle>
                <div className="flex gap-2">
                  <Button
                    onClick={fetchPrintifyProducts}
                    disabled={loading}
                    variant="outline"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    Import from Printify
                  </Button>
                  <Button
                    onClick={saveAllMappings}
                    disabled={saving || printifyProducts.length === 0}
                  >
                    {saving ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save All Mappings
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {printifyProducts.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Click "Import from Printify" to fetch your products and start mapping them to houses.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Assign each Printify product to a house. Products will be saved with $40 pricing and set as active jerseys.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {printifyProducts.map((product) => {
                        const mapping = productMappings.find(m => m.printify_product_id === product.printify_product_id);
                        return (
                          <Card key={product.printify_product_id} className="border">
                            <CardContent className="p-4">
                              <div className="space-y-3">
                                {product.image_url && (
                                  <img
                                    src={product.image_url}
                                    alt={product.name}
                                    className="w-full h-32 object-cover rounded-md"
                                  />
                                )}
                                <div>
                                  <h3 className="font-semibold text-sm truncate">{product.name}</h3>
                                  <p className="text-xs text-muted-foreground line-clamp-2">
                                    {product.description}
                                  </p>
                                </div>
                                
                                <div className="flex flex-wrap gap-1">
                                  {product.sizes.slice(0, 4).map((size) => (
                                    <Badge key={size} variant="secondary" className="text-xs">
                                      {size}
                                    </Badge>
                                  ))}
                                  {product.sizes.length > 4 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{product.sizes.length - 4} more
                                    </Badge>
                                  )}
                                </div>

                                <Select
                                  value={mapping?.house_id?.toString() || ''}
                                  onValueChange={(value) => 
                                    updateProductMapping(product.printify_product_id, 'house_id', value ? parseInt(value) : null)
                                  }
                                >
                                  <SelectTrigger className="text-xs">
                                    <SelectValue placeholder="Select house..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {houses.map((house) => (
                                      <SelectItem key={house.id} value={house.id.toString()}>
                                        <div className="flex items-center gap-2">
                                          <div 
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: house.colors[0] }}
                                          />
                                          {house.name}
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>

                                <div className="text-xs text-muted-foreground">
                                  Price: ${mapping?.price || 40}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ProductManager;