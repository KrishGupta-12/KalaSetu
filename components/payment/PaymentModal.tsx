"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { paymentService, type PaymentDetails, type UPIQRData, type PaymentStatus } from "@/lib/payment-service"
import { X, Clock, CheckCircle, XCircle, Smartphone, Copy } from "lucide-react"
import Image from "next/image"

interface PaymentModalProps {
  product: {
    id: string
    name: string
    price: number
    artisanId: string
    artisanName: string
    images: string[]
  }
  onClose: () => void
  onSuccess: (transactionId: string) => void
}

export function PaymentModal({ product, onClose, onSuccess }: PaymentModalProps) {
  const [step, setStep] = useState<"details" | "payment" | "status">("details")
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>({
    amount: product.price,
    productId: product.id,
    productName: product.name,
    artisanId: product.artisanId,
    artisanName: product.artisanName,
    buyerEmail: "",
    buyerName: "",
    buyerPhone: "",
    buyerAddress: "",
  })
  const [qrData, setQrData] = useState<UPIQRData | null>(null)
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)

  // Calculate payment breakdown
  const breakdown = paymentService.calculatePaymentBreakdown(product.price)

  // Timer for QR code expiration
  useEffect(() => {
    if (qrData && step === "payment") {
      const interval = setInterval(() => {
        const now = new Date().getTime()
        const expiry = new Date(qrData.expiresAt).getTime()
        const remaining = Math.max(0, expiry - now)

        setTimeLeft(remaining)

        if (remaining === 0) {
          setStep("status")
          setPaymentStatus({
            transactionId: qrData.transactionId,
            status: "expired",
            amount: qrData.amount,
            timestamp: new Date(),
            paymentMethod: "UPI",
          })
        }
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [qrData, step])

  // Poll payment status
  useEffect(() => {
    if (qrData && step === "payment") {
      const pollInterval = setInterval(async () => {
        try {
          const status = await paymentService.checkPaymentStatus(qrData.transactionId)
          if (status.status === "completed") {
            setPaymentStatus(status)
            setStep("status")
            onSuccess(status.transactionId)
          } else if (status.status === "failed" || status.status === "expired") {
            setPaymentStatus(status)
            setStep("status")
          }
        } catch (error) {
          console.error("Error polling payment status:", error)
        }
      }, 3000)

      return () => clearInterval(pollInterval)
    }
  }, [qrData, step, onSuccess])

  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const qrResult = await paymentService.generateUPIQR(paymentDetails)
      setQrData(qrResult)
      setStep("payment")
    } catch (error) {
      console.error("Error generating payment:", error)
      alert("Failed to generate payment. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (milliseconds: number) => {
    const minutes = Math.floor(milliseconds / 60000)
    const seconds = Math.floor((milliseconds % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const copyUPIId = () => {
    if (qrData) {
      navigator.clipboard.writeText(qrData.upiId)
      alert("UPI ID copied to clipboard!")
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-deep-teal">
            {step === "details" && "Order Details"}
            {step === "payment" && "Complete Payment"}
            {step === "status" && "Payment Status"}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Product Summary */}
          <div className="flex items-center gap-4 p-4 bg-soft-cream rounded-lg">
            <div className="w-16 h-16 rounded-lg overflow-hidden">
              <Image
                src={product.images[0] || "/placeholder.svg?height=64&width=64&query=product"}
                alt={product.name}
                width={64}
                height={64}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-deep-teal">{product.name}</h3>
              <p className="text-sm text-warm-brown">by {product.artisanName}</p>
              <p className="text-lg font-bold text-heritage-gold">₹{product.price.toLocaleString()}</p>
            </div>
          </div>

          {/* Payment Breakdown */}
          <div className="space-y-2">
            <h4 className="font-semibold text-deep-teal">Payment Breakdown</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Product Price</span>
                <span>₹{breakdown.totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-warm-brown">
                <span>Platform Fee (5%)</span>
                <span>₹{breakdown.platformFee}</span>
              </div>
              <div className="flex justify-between text-warm-brown">
                <span>Payment Gateway Fee</span>
                <span>₹{breakdown.paymentGatewayFee}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total Amount</span>
                <span>₹{breakdown.totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sage-green text-xs">
                <span>Artisan receives</span>
                <span>₹{breakdown.artisanShare.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Step Content */}
          {step === "details" && (
            <form onSubmit={handleDetailsSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="buyerName">Full Name *</Label>
                  <Input
                    id="buyerName"
                    value={paymentDetails.buyerName}
                    onChange={(e) => setPaymentDetails((prev) => ({ ...prev, buyerName: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="buyerPhone">Phone *</Label>
                  <Input
                    id="buyerPhone"
                    type="tel"
                    value={paymentDetails.buyerPhone}
                    onChange={(e) => setPaymentDetails((prev) => ({ ...prev, buyerPhone: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="buyerEmail">Email *</Label>
                <Input
                  id="buyerEmail"
                  type="email"
                  value={paymentDetails.buyerEmail}
                  onChange={(e) => setPaymentDetails((prev) => ({ ...prev, buyerEmail: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="buyerAddress">Delivery Address *</Label>
                <Textarea
                  id="buyerAddress"
                  value={paymentDetails.buyerAddress}
                  onChange={(e) => setPaymentDetails((prev) => ({ ...prev, buyerAddress: e.target.value }))}
                  rows={3}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-heritage-gold text-deep-teal hover:bg-heritage-gold/90"
                disabled={loading}
              >
                {loading ? "Generating Payment..." : "Proceed to Payment"}
              </Button>
            </form>
          )}

          {step === "payment" && qrData && (
            <div className="space-y-4 text-center">
              <div className="flex items-center justify-center gap-2 text-heritage-gold">
                <Clock className="w-5 h-5" />
                <span className="font-semibold">Time remaining: {formatTime(timeLeft)}</span>
              </div>

              <div className="bg-white p-4 rounded-lg border-2 border-heritage-gold/20">
                <Image
                  src={qrData.qrCodeUrl || "/placeholder.svg"}
                  alt="UPI QR Code"
                  width={250}
                  height={250}
                  className="mx-auto"
                />
              </div>

              <div className="space-y-2">
                <p className="text-sm text-warm-brown">Scan the QR code with any UPI app or use the UPI ID below:</p>
                <div className="flex items-center gap-2 p-2 bg-soft-cream rounded">
                  <code className="flex-1 text-sm">{qrData.upiId}</code>
                  <Button size="sm" variant="outline" onClick={copyUPIId}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-center gap-4 text-sm text-warm-brown">
                <div className="flex items-center gap-1">
                  <Smartphone className="w-4 h-4" />
                  <span>Amount: ₹{qrData.amount.toLocaleString()}</span>
                </div>
              </div>

              <p className="text-xs text-warm-brown">Payment will be automatically verified once completed</p>
            </div>
          )}

          {step === "status" && paymentStatus && (
            <div className="space-y-4 text-center">
              {paymentStatus.status === "completed" && (
                <>
                  <div className="w-16 h-16 bg-sage-green/10 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="w-8 h-8 text-sage-green" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-sage-green mb-2">Payment Successful!</h3>
                    <p className="text-sm text-warm-brown mb-4">
                      Your order has been confirmed. You will receive a confirmation email shortly.
                    </p>
                    <Badge className="bg-sage-green text-white">Transaction ID: {paymentStatus.transactionId}</Badge>
                  </div>
                </>
              )}

              {paymentStatus.status === "expired" && (
                <>
                  <div className="w-16 h-16 bg-warm-red/10 rounded-full flex items-center justify-center mx-auto">
                    <XCircle className="w-8 h-8 text-warm-red" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-warm-red mb-2">Payment Expired</h3>
                    <p className="text-sm text-warm-brown mb-4">The payment session has expired. Please try again.</p>
                    <Button
                      onClick={() => setStep("details")}
                      className="bg-heritage-gold text-deep-teal hover:bg-heritage-gold/90"
                    >
                      Try Again
                    </Button>
                  </div>
                </>
              )}

              {paymentStatus.status === "failed" && (
                <>
                  <div className="w-16 h-16 bg-warm-red/10 rounded-full flex items-center justify-center mx-auto">
                    <XCircle className="w-8 h-8 text-warm-red" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-warm-red mb-2">Payment Failed</h3>
                    <p className="text-sm text-warm-brown mb-4">
                      There was an issue processing your payment. Please try again.
                    </p>
                    <Button
                      onClick={() => setStep("details")}
                      className="bg-heritage-gold text-deep-teal hover:bg-heritage-gold/90"
                    >
                      Try Again
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
