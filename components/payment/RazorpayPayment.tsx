"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { razorpayService, type PaymentOptions, type PaymentResult } from "@/lib/razorpay-service"
import { useCart } from "@/contexts/CartContext"
import { CreditCard, Smartphone, QrCode, CheckCircle } from "lucide-react"
import { toast } from "sonner"

interface RazorpayPaymentProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (paymentResult: PaymentResult) => void
}

export function RazorpayPayment({ isOpen, onClose, onSuccess }: RazorpayPaymentProps) {
  const { state } = useCart()
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<"card" | "upi" | "qr">("card")

  if (!isOpen) return null

  const handlePayment = async () => {
    try {
      setIsProcessing(true)

      // Create order
      const orderId = await razorpayService.createOrder(state.total * 100) // Convert to paise

      const paymentOptions: PaymentOptions = {
        amount: state.total * 100, // Amount in paise
        currency: "INR",
        orderId,
        name: "Kalasetu",
        description: `Payment for ${state.itemCount} items`,
        image: "/logo.png",
        prefill: {
          name: "Customer Name",
          email: "customer@example.com",
          contact: "9999999999",
        },
        theme: {
          color: "#D4A574", // Heritage gold color
        },
      }

      const paymentResult = await razorpayService.openPayment(paymentOptions)

      // Verify payment
      const isVerified = await razorpayService.verifyPayment(paymentResult)

      if (isVerified) {
        toast.success("Payment successful!")
        onSuccess(paymentResult)
      } else {
        toast.error("Payment verification failed")
      }
    } catch (error) {
      console.error("Payment error:", error)
      toast.error("Payment failed. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  const generateUPIQR = () => {
    const upiData = razorpayService.generateUPIQR(
      state.total,
      "karigari@upi",
      "Kalasetu",
      `Payment for ${state.itemCount} items`,
    )
    return upiData
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md border-warm-brown/20">
        <CardHeader className="text-center">
          <CardTitle className="text-deep-teal">Complete Payment</CardTitle>
          <div className="text-2xl font-bold text-heritage-gold">₹{state.total.toLocaleString()}</div>
          <p className="text-warm-brown text-sm">
            {state.itemCount} item{state.itemCount > 1 ? "s" : ""} in cart
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Order Summary */}
          <div className="space-y-2">
            <h4 className="font-semibold text-deep-teal">Order Summary</h4>
            <div className="max-h-32 overflow-y-auto space-y-2">
              {state.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-warm-brown">
                    {item.name} x {item.quantity}
                  </span>
                  <span className="text-heritage-gold font-medium">
                    ₹{(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
            <Separator />
            <div className="flex justify-between font-semibold">
              <span className="text-deep-teal">Total</span>
              <span className="text-heritage-gold">₹{state.total.toLocaleString()}</span>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="space-y-3">
            <h4 className="font-semibold text-deep-teal">Payment Method</h4>

            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={paymentMethod === "card" ? "default" : "outline"}
                size="sm"
                onClick={() => setPaymentMethod("card")}
                className={paymentMethod === "card" ? "bg-heritage-gold text-deep-teal" : ""}
              >
                <CreditCard className="w-4 h-4 mr-1" />
                Card
              </Button>
              <Button
                variant={paymentMethod === "upi" ? "default" : "outline"}
                size="sm"
                onClick={() => setPaymentMethod("upi")}
                className={paymentMethod === "upi" ? "bg-heritage-gold text-deep-teal" : ""}
              >
                <Smartphone className="w-4 h-4 mr-1" />
                UPI
              </Button>
              <Button
                variant={paymentMethod === "qr" ? "default" : "outline"}
                size="sm"
                onClick={() => setPaymentMethod("qr")}
                className={paymentMethod === "qr" ? "bg-heritage-gold text-deep-teal" : ""}
              >
                <QrCode className="w-4 h-4 mr-1" />
                QR
              </Button>
            </div>
          </div>

          {/* UPI QR Code */}
          {paymentMethod === "qr" && (
            <div className="text-center space-y-3">
              <div className="bg-white p-4 rounded-lg border">
                <div className="w-32 h-32 mx-auto bg-gray-100 rounded flex items-center justify-center">
                  <QrCode className="w-16 h-16 text-gray-400" />
                </div>
              </div>
              <p className="text-sm text-warm-brown">Scan with any UPI app to pay ₹{state.total.toLocaleString()}</p>
              <Badge variant="outline" className="text-xs">
                karigari@upi
              </Badge>
            </div>
          )}

          {/* Test Mode Notice */}
          <div className="bg-soft-blue/10 p-3 rounded-lg">
            <div className="flex items-center text-soft-blue text-sm">
              <CheckCircle className="w-4 h-4 mr-2" />
              Test Mode: Use test card 4111 1111 1111 1111
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button variant="outline" onClick={onClose} disabled={isProcessing} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button
              onClick={handlePayment}
              disabled={isProcessing}
              className="flex-1 bg-heritage-gold text-deep-teal hover:bg-heritage-gold/90"
            >
              {isProcessing ? "Processing..." : `Pay ₹${state.total.toLocaleString()}`}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
