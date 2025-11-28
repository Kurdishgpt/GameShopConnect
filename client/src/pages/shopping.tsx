import { useEffect, useState } from "react";
import { useAuth } from "@/lib/authUtils";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { ShopItem } from "@shared/schema";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Search, Trash2, X, Zap } from "lucide-react";
import bo3LiquidImage from "@assets/generated_images/bo3_liquid_gaming_drink.png";

interface CartItem extends ShopItem {
  quantity: number;
}

export default function Shopping() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
  const [requestMessage, setRequestMessage] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [bo3SelectedQty, setBo3SelectedQty] = useState<number | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, authLoading, toast]);

  const { data: items, isLoading } = useQuery<ShopItem[]>({
    queryKey: ["/api/shop/items"],
    enabled: isAuthenticated,
  });

  const requestMutation = useMutation({
    mutationFn: async (data: { itemId: string; message: string }) => {
      await apiRequest("POST", "/api/shop/requests", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Your request has been submitted!",
      });
      setSelectedItem(null);
      setRequestMessage("");
      queryClient.invalidateQueries({ queryKey: ["/api/shop/requests"] });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: error.message || "Failed to submit request",
        variant: "destructive",
      });
    },
  });

  const filteredItems = items?.filter((item) =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRequestClick = (item: ShopItem) => {
    setSelectedItem(item);
  };

  const handleSubmitRequest = () => {
    if (selectedItem) {
      requestMutation.mutate({
        itemId: selectedItem.id,
        message: requestMessage,
      });
    }
  };

  const handleAddToCart = (item: ShopItem) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((ci) => ci.id === item.id);
      if (existingItem) {
        return prevCart.map((ci) =>
          ci.id === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci
        );
      }
      return [...prevCart, { ...item, quantity: 1 }];
    });
    toast({
      title: "Added to Cart",
      description: `${item.title} added to your shopping cart`,
    });
  };

  const handleRemoveFromCart = (itemId: string) => {
    setCart((prevCart) => prevCart.filter((ci) => ci.id !== itemId));
  };

  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveFromCart(itemId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((ci) => (ci.id === itemId ? { ...ci, quantity } : ci))
    );
  };

  const handleClearCart = () => {
    setCart([]);
    setShowCart(false);
    toast({
      title: "Cart Cleared",
      description: "All items have been removed from your cart",
    });
  };

  const cartTotal = cart.reduce((sum, item) => {
    const price = parseFloat(item.price.replace(/[^0-9.-]+/g, ""));
    return sum + price * item.quantity;
  }, 0);

  if (authLoading || isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-10 w-full max-w-md" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-80" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-start gap-6">
        {/* Main Content */}
        <div className="flex-1 space-y-6">
          <div className="space-y-4">
            <h1 className="font-heading font-bold text-4xl md:text-5xl flex items-center gap-3" data-testid="heading-shopping">
              <ShoppingBag className="h-10 w-10 text-primary" />
              Gaming Shop
            </h1>
            <p className="text-muted-foreground text-lg">
              Browse and request the latest gaming gear and accessories
            </p>

            {/* Search */}
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
                data-testid="input-search-items"
              />
            </div>
          </div>

          {/* Featured BO3 Liquid */}
          <div className="bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 rounded-lg p-6 border border-cyan-400/30">
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className="flex-1 text-center md:text-left space-y-4">
                <div className="flex items-center gap-2">
                  <Zap className="h-6 w-6 text-yellow-400" />
                  <h2 className="font-bold text-2xl text-white">BO3 Liquid</h2>
                  <Badge className="bg-gradient-to-r from-cyan-400 to-purple-500 text-white">Featured</Badge>
                </div>
                <p className="text-sm text-white/80">
                  Premium Call of Duty Black Ops 3 gaming liquid. 50,000 units - $399.99
                </p>
                <Button
                  onClick={() => {
                    if (user?.role === "seller") {
                      // Redirect sellers to their seller page with auto-order
                      window.location.href = "/seller?orderBo3=true";
                    } else {
                      setBo3SelectedQty(50000);
                    }
                  }}
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold"
                  data-testid="button-bo3-qty-50k"
                >
                  50K x - $399.99 ⚡
                </Button>
                {bo3SelectedQty && (
                  <Button
                    className="w-full bg-gradient-to-r from-cyan-400 to-purple-500 hover:from-cyan-300 hover:to-purple-400 text-white font-bold"
                    onClick={() => {
                      setCart(prev => [...prev, { 
                        id: "bo3-liquid", 
                        title: `BO3 Liquid (50000x)`,
                        price: "$399.99",
                        description: "Premium BO3 Gaming Liquid",
                        ownerId: "system",
                        quantity: 1,
                        category: "Gaming",
                      } as CartItem]);
                      toast({
                        title: "Added to Cart",
                        description: `BO3 Liquid (50000x) added successfully!`,
                      });
                      setBo3SelectedQty(null);
                    }}
                    data-testid="button-add-bo3-to-cart"
                  >
                    Add to Cart
                  </Button>
                )}
              </div>
              <div className="w-full md:w-64 flex-shrink-0">
                <img 
                  src={bo3LiquidImage} 
                  alt="BO3 Liquid Gaming Drink" 
                  className="w-full h-auto rounded-lg shadow-lg border border-cyan-400/50"
                />
              </div>
            </div>
          </div>

          {/* Items Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredItems?.map((item) => (
          <Card key={item.id} className="hover-elevate flex flex-col" data-testid={`card-shop-item-${item.id}`}>
            <CardHeader className="pb-3">
              {item.imageUrl ? (
                <div className="aspect-square rounded-md bg-muted mb-3 overflow-hidden">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-square rounded-md bg-gradient-to-br from-primary/20 to-accent/20 mb-3 flex items-center justify-center">
                  <ShoppingBag className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
              <CardTitle className="line-clamp-2 text-lg" data-testid={`text-item-title-${item.id}`}>
                {item.title}
              </CardTitle>
              <CardDescription className="line-clamp-2">
                {item.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-3 flex-1">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-2xl font-bold text-primary" data-testid={`text-item-price-${item.id}`}>
                    {item.price}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {(item as any).currency || 'USD'}
                  </span>
                </div>
                {item.category && (
                  <Badge variant="secondary" className="text-xs">
                    {item.category}
                  </Badge>
                )}
              </div>
            </CardContent>
            <CardFooter className="gap-2 flex-col">
              <Button
                className="w-full bg-gradient-to-r from-cyan-400 to-purple-500 hover:from-cyan-300 hover:to-purple-400 text-white font-bold"
                onClick={() => {
                  requestMutation.mutate({
                    itemId: item.id,
                    message: `Buy order for ${item.title}`,
                  });
                }}
                disabled={requestMutation.isPending}
                data-testid={`button-order-now-${item.id}`}
              >
                {requestMutation.isPending ? "Processing..." : "Order Now"}
              </Button>
              <Button
                className="w-full"
                variant="outline"
                onClick={() => handleAddToCart(item)}
                data-testid={`button-add-cart-${item.id}`}
              >
                Add to Cart
              </Button>
            </CardFooter>
          </Card>
            ))}
          </div>

          {filteredItems?.length === 0 && (
            <div className="text-center py-12">
              <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No items found</h3>
              <p className="text-muted-foreground">Try adjusting your search</p>
            </div>
          )}
        </div>

        {/* Shopping Cart Sidebar */}
        <div className="w-full md:w-96 space-y-2">
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 relative"
              onClick={() => setShowCart(!showCart)}
              data-testid="button-toggle-cart"
            >
              <ShoppingBag className="h-4 w-4 mr-2" />
              Shopping Cart ({cart.length})
              {cart.length > 0 && (
                <Badge className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center p-0">
                  {cart.length}
                </Badge>
              )}
            </Button>
            {cart.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleClearCart}
                data-testid="button-clear-all-items"
                title="Remove all items from cart"
              >
                Clear All
              </Button>
            )}
          </div>

          {showCart && (
            <Card className="sticky top-0 md:top-4 z-40" data-testid="panel-shopping-cart">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Your Cart</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCart(false)}
                    data-testid="button-close-cart"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              
              {cart.length === 0 ? (
                <CardContent className="text-center py-6">
                  <ShoppingBag className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                  <p className="text-sm text-muted-foreground">Your cart is empty</p>
                </CardContent>
              ) : (
                <>
                  <CardContent className="space-y-3 max-h-96 overflow-y-auto">
                    {cart.map((item) => (
                      <div
                        key={item.id}
                        className="border rounded-lg p-3 space-y-2"
                        data-testid={`cart-item-${item.id}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className="font-semibold text-sm line-clamp-1">{item.title}</p>
                            <p className="text-sm text-primary font-bold">{item.price} {(item as any).currency || 'USD'}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveFromCart(item.id)}
                            data-testid={`button-remove-${item.id}`}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                            data-testid={`button-qty-minus-${item.id}`}
                          >
                            −
                          </Button>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              handleUpdateQuantity(item.id, parseInt(e.target.value) || 1)
                            }
                            className="w-10 h-7 text-center text-sm border rounded"
                            data-testid={`input-qty-${item.id}`}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            data-testid={`button-qty-plus-${item.id}`}
                          >
                            +
                          </Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                  <CardFooter className="flex flex-col gap-3 border-t pt-3">
                    <div className="w-full space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal:</span>
                        <span className="font-semibold">${cartTotal.toFixed(2)}</span>
                      </div>
                    </div>
                    <Button
                      className="w-full"
                      variant="default"
                      data-testid="button-checkout"
                    >
                      Proceed to Checkout
                    </Button>
                    <Button
                      className="w-full"
                      variant="destructive"
                      onClick={handleClearCart}
                      data-testid="button-clear-cart"
                    >
                      Clear Cart
                    </Button>
                  </CardFooter>
                </>
              )}
            </Card>
          )}
        </div>
      </div>

      {/* Request Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <DialogContent data-testid="dialog-request-item">
          <DialogHeader>
            <DialogTitle>Request {selectedItem?.title}</DialogTitle>
            <DialogDescription>
              Send a request for this item. Add any special requirements or questions.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <p className="text-sm font-medium mb-1">Price: {selectedItem?.price}</p>
            </div>
            <Textarea
              placeholder="Add a message (optional)"
              value={requestMessage}
              onChange={(e) => setRequestMessage(e.target.value)}
              data-testid="input-request-message"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSelectedItem(null)}
              data-testid="button-cancel-request"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitRequest}
              disabled={requestMutation.isPending}
              data-testid="button-submit-request"
            >
              {requestMutation.isPending ? "Submitting..." : "Submit Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
