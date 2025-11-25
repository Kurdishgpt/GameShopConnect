import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
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
import { ShoppingBag, Search } from "lucide-react";

export default function Shopping() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
  const [requestMessage, setRequestMessage] = useState("");

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
      <div className="space-y-4">
        <h1 className="font-heading font-bold text-4xl md:text-5xl flex items-center gap-3" data-testid="heading-shopping">
          <ShoppingBag className="h-10 w-10 text-primary" />
          Gaming Shop
        </h1>
        <p className="text-muted-foreground text-lg">
          Browse and request the latest gaming gear and accessories
        </p>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="input-search-items"
          />
        </div>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
                <span className="text-2xl font-bold text-primary" data-testid={`text-item-price-${item.id}`}>
                  {item.price}
                </span>
                {item.category && (
                  <Badge variant="secondary" className="text-xs">
                    {item.category}
                  </Badge>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={() => handleRequestClick(item)}
                data-testid={`button-request-${item.id}`}
              >
                Request
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
