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
import { Store, Plus, Package, Trash2, Zap, Check } from "lucide-react";
import { useLocation } from "wouter";
import bo3LiquidImage from "@assets/generated_images/bo3_liquid_gaming_drink.png";

interface SellerOrder {
  id: string;
  title: string;
  price: string;
  quantity: number;
  status: "pending" | "processing" | "completed";
  createdAt: string;
}

interface ShopRequest {
  id: string;
  userId: string;
  itemId: string;
  status: "pending" | "accepted" | "rejected";
  message: string;
  createdAt: string;
}

export default function Seller() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [orders, setOrders] = useState<SellerOrder[]>([]);
  const [formData, setFormData] = useState({ title: "", description: "", price: "", currency: "USD" });

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

    // Check if user is seller
    if (user && user.role !== "seller") {
      toast({
        title: "Access Denied",
        description: "Only sellers can access this page",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
    }

    // Auto-add BO3 order if coming from shopping page
    const params = new URLSearchParams(window.location.search);
    if (params.get("orderBo3") === "true") {
      const bo3Order: SellerOrder = {
        id: `order-bo3-${Date.now()}`,
        title: "BO3 Liquid (50000x)",
        price: "$399.99",
        quantity: 1,
        status: "pending",
        createdAt: new Date().toISOString(),
      };
      setOrders([bo3Order]);
      toast({
        title: "BO3 Added",
        description: "BO3 Liquid (50000x) added to your orders!",
      });
      // Clean URL
      window.history.replaceState({}, document.title, "/seller");
    }
  }, [isAuthenticated, authLoading, user, toast]);

  const { data: sellerItems, isLoading } = useQuery<ShopItem[]>({
    queryKey: ["/api/shop/items"],
    enabled: isAuthenticated && user?.role === "seller",
  });

  const { data: shopRequests } = useQuery<ShopRequest[]>({
    queryKey: ["/api/shop/requests"],
    enabled: isAuthenticated && user?.role === "seller",
  });

  const acceptOrderMutation = useMutation({
    mutationFn: async (requestId: string) => {
      await apiRequest("PATCH", `/api/shop/requests/${requestId}`, { status: "accepted" });
    },
    onSuccess: (_, requestId) => {
      const request = shopRequests?.find(r => r.id === requestId);
      if (request) {
        navigate(`/messages?userId=${request.userId}`);
        toast({
          title: "Order Accepted",
          description: "Starting chat with buyer...",
        });
      }
      queryClient.invalidateQueries({ queryKey: ["/api/shop/requests"] });
    },
  });

  const rejectOrderMutation = useMutation({
    mutationFn: async (requestId: string) => {
      await apiRequest("PATCH", `/api/shop/requests/${requestId}`, { status: "rejected" });
    },
    onSuccess: () => {
      toast({
        title: "Order Rejected",
        description: "Order has been rejected",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/shop/requests"] });
    },
  });

  const deleteOrderMutation = useMutation({
    mutationFn: async (requestId: string) => {
      await apiRequest("DELETE", `/api/shop/requests/${requestId}`, {});
    },
    onSuccess: () => {
      toast({
        title: "Order Removed",
        description: "Order has been removed",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/shop/requests"] });
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      await apiRequest("DELETE", `/api/shop/items/${itemId}`, {});
    },
    onSuccess: () => {
      toast({
        title: "Item Deleted",
        description: "Your item has been deleted",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/shop/items"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete item",
        variant: "destructive",
      });
    },
  });

  const createItemMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/shop/items", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Item created successfully!",
      });
      setFormData({ title: "", description: "", price: "", currency: "USD" });
      setShowCreateForm(false);
      queryClient.invalidateQueries({ queryKey: ["/api/shop/items"] });
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
        description: error.message || "Failed to create item",
        variant: "destructive",
      });
    },
  });

  const handleCreateItem = () => {
    if (!formData.title || !formData.price) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    createItemMutation.mutate(formData);
  };

  const handleAddOrder = (item: ShopItem, quantity: number = 1) => {
    const newOrder: SellerOrder = {
      id: `order-${Date.now()}`,
      title: item.title,
      price: item.price,
      quantity,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    setOrders([newOrder, ...orders]);
    toast({
      title: "Order Added",
      description: `${item.title} added to orders`,
    });
  };

  if (authLoading || isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-10 w-full max-w-md" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-80" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="space-y-4">
        <h1 className="font-heading font-bold text-4xl md:text-5xl flex items-center gap-3" data-testid="heading-seller">
          <Store className="h-10 w-10 text-primary" />
          Seller Dashboard
        </h1>
        <p className="text-muted-foreground text-lg">
          Manage your products and orders
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side - Create Item */}
        <div className="space-y-4">
          <Card data-testid="panel-create-item">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Create Item
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Item Title</label>
                <Input
                  placeholder="Product name"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  data-testid="input-item-title"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  placeholder="Product description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  data-testid="input-item-description"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sm font-medium">Price</label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    data-testid="input-item-price"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Currency</label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                    data-testid="select-currency"
                  >
                    <option value="USD">USD</option>
                    <option value="IQD">IQD</option>
                  </select>
                </div>
              </div>
              <Button
                onClick={handleCreateItem}
                disabled={createItemMutation.isPending}
                className="w-full"
                data-testid="button-create-item"
              >
                {createItemMutation.isPending ? "Creating..." : "Create Item"}
              </Button>
            </CardContent>
          </Card>

          {/* Pending Orders */}
          <Card data-testid="panel-pending-orders">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Pending Orders ({shopRequests?.filter(r => r.status === "pending").length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-96 overflow-y-auto">
              {!shopRequests || shopRequests.filter(r => r.status === "pending").length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No pending orders</p>
              ) : (
                shopRequests.filter(r => r.status === "pending").map((request) => (
                  <div key={request.id} className="border rounded-lg p-3" data-testid={`pending-order-${request.id}`}>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{request.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">Requested at: {new Date(request.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1 bg-green-500 hover:bg-green-600"
                        onClick={() => acceptOrderMutation.mutate(request.id)}
                        disabled={acceptOrderMutation.isPending}
                        data-testid={`button-accept-order-${request.id}`}
                      >
                        <Check className="h-3 w-3 mr-1" />
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="flex-1"
                        onClick={() => deleteOrderMutation.mutate(request.id)}
                        disabled={deleteOrderMutation.isPending}
                        data-testid={`button-remove-order-${request.id}`}
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Remove
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Orders Summary */}
          <Card data-testid="panel-orders-summary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                My Orders ({orders.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-96 overflow-y-auto">
              {orders.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No orders yet</p>
              ) : (
                orders.map((order) => (
                  <div key={order.id} className="border rounded-lg p-3" data-testid={`order-item-${order.id}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="font-semibold text-sm line-clamp-1">{order.title}</p>
                        <p className="text-sm text-primary font-bold">{order.price} x {order.quantity}</p>
                        <Badge variant={order.status === "completed" ? "default" : "secondary"} className="mt-1 text-xs">
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Side - Items List */}
        <div className="lg:col-span-2 space-y-6">
          {/* Featured BO3 */}
          <Card className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-400/30" data-testid="card-bo3-featured">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-6 w-6 text-yellow-400" />
                Featured Product
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-4">
              <img src={bo3LiquidImage} alt="BO3 Liquid" className="w-20 h-20 rounded-lg" />
              <div className="flex-1">
                <h3 className="font-bold">BO3 Liquid (50000x)</h3>
                <p className="text-sm text-muted-foreground">Premium gaming liquid</p>
                <p className="text-lg font-bold text-yellow-500 mt-2">$399.99</p>
              </div>
              <Button
                onClick={() => handleAddOrder({ id: "bo3", title: "BO3 Liquid (50000x)", price: "$399.99", description: "Premium BO3 Gaming Liquid", category: "Gaming", ownerId: "system", currency: "USD" }, 1)}
                data-testid="button-add-bo3-order"
              >
                Add Order
              </Button>
            </CardContent>
          </Card>

          <Card data-testid="panel-items-list">
            <CardHeader>
              <CardTitle>Your Items</CardTitle>
              <CardDescription>
                {sellerItems?.length || 0} items listed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {!sellerItems || sellerItems.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                    <p className="text-muted-foreground">No items yet. Create your first item!</p>
                  </div>
                ) : (
                  sellerItems.map((item) => (
                    <div
                      key={item.id}
                      className="border rounded-lg p-4 flex items-start justify-between"
                      data-testid={`seller-item-${item.id}`}
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold">{item.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                        <p className="text-lg font-bold text-primary mt-2">{item.price} {item.currency || "USD"}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteItemMutation.mutate(item.id)}
                        disabled={deleteItemMutation.isPending}
                        data-testid={`button-delete-item-${item.id}`}
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
