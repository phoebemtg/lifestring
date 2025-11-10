import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/contexts/CartContext";
import { ShoppingCart, Plus, Minus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const TAX_RATE = 0.08; // 8% tax rate

export const CartSidebar = () => {
  const { items, itemCount, totalPrice, isOpen, setCartOpen, updateQuantity, removeItem, clearCart } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const { user, userProfile } = useAuth();
  const { toast } = useToast();

  const subtotal = totalPrice;
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeItem(id);
    } else {
      updateQuantity(id, newQuantity);
    }
  };

  const handleCheckout = async () => {
    if (!user || !userProfile) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to complete your purchase",
        variant: "destructive",
      });
      return;
    }

    if (items.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Please add items to your cart before checkout",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Create checkout session
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          items,
          customer_name: userProfile.full_name || "Customer",
          customer_email: user.email || "",
          shipping_address: {
            line1: userProfile.address || "123 Main St", // Default if no address
            city: "City",
            state: "State", 
            postal_code: "12345",
            country: "US",
          },
        },
      });

      if (error) {
        console.error('Checkout error:', error);
        throw new Error(error.message || 'Failed to create checkout session');
      }

      if (data?.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "Checkout Error",
        description: error instanceof Error ? error.message : "Failed to start checkout process",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setCartOpen}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Shopping Cart ({itemCount} {itemCount === 1 ? 'item' : 'items'})
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col h-full py-6">
          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Your cart is empty</h3>
              <p className="text-muted-foreground mb-4">
                Add some jerseys to get started!
              </p>
              <Button onClick={() => setCartOpen(false)} variant="outline">
                Continue Shopping
              </Button>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3 p-3 border rounded-lg">
                    {item.image_url && (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{item.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Size: {item.size} • Color: {item.color}
                      </p>
                      <p className="font-semibold">${item.price.toFixed(2)}</p>
                      
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          className="h-8 w-8 p-0"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="font-medium w-8 text-center">{item.quantity}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          className="h-8 w-8 p-0"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeItem(item.id)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive ml-auto"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              {/* Clear Cart Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearCart}
                className="text-destructive hover:text-destructive self-start mb-4"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Clear Cart
              </Button>

              {/* Cart Summary */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax (8%):</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <Button
                onClick={handleCheckout}
                disabled={isLoading}
                className="w-full"
                size="lg"
              >
                {isLoading ? 'Processing...' : `Proceed to Checkout - $${total.toFixed(2)}`}
              </Button>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export const CartIcon = () => {
  const { itemCount, toggleCart } = useCart();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleCart}
      className="relative"
    >
      <ShoppingCart className="h-5 w-5" />
      {itemCount > 0 && (
        <Badge
          variant="destructive"
          className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
        >
          {itemCount > 9 ? '9+' : itemCount}
        </Badge>
      )}
    </Button>
  );
};