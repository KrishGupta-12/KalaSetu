"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { paymentService, type PaymentStatus } from "@/lib/payment-service"
import { Clock, CheckCircle, XCircle, Download, Eye } from "lucide-react"

interface PaymentHistoryProps {
  userEmail: string
}

export function PaymentHistory({ userEmail }: PaymentHistoryProps) {
  const [payments, setPayments] = useState<PaymentStatus[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPaymentHistory()
  }, [userEmail])

  const loadPaymentHistory = async () => {
    try {
      setLoading(true)
      const history = await paymentService.getPaymentHistory(userEmail)
      setPayments(history)
    } catch (error) {
      console.error("Error loading payment history:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-sage-green" />
      case "pending":
        return <Clock className="w-4 h-4 text-heritage-gold" />
      case "failed":
      case "expired":
        return <XCircle className="w-4 h-4 text-warm-red" />
      default:
        return <Clock className="w-4 h-4 text-warm-brown" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-sage-green text-white">Completed</Badge>
      case "pending":
        return <Badge className="bg-heritage-gold text-deep-teal">Pending</Badge>
      case "failed":
        return <Badge className="bg-warm-red text-white">Failed</Badge>
      case "expired":
        return <Badge className="bg-warm-brown text-white">Expired</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <Card className="border-warm-brown/20">
        <CardHeader>
          <CardTitle className="text-deep-teal">Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (payments.length === 0) {
    return (
      <Card className="border-warm-brown/20">
        <CardHeader>
          <CardTitle className="text-deep-teal">Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-warm-brown/50 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-deep-teal mb-2">No payments yet</h3>
            <p className="text-warm-brown">Your payment history will appear here</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-warm-brown/20">
      <CardHeader>
        <CardTitle className="text-deep-teal">Payment History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {payments.map((payment) => (
            <div
              key={payment.transactionId}
              className="flex items-center justify-between p-4 border border-warm-brown/10 rounded-lg"
            >
              <div className="flex items-center gap-3">
                {getStatusIcon(payment.status)}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-deep-teal">₹{payment.amount.toLocaleString()}</span>
                    {getStatusBadge(payment.status)}
                  </div>
                  <p className="text-sm text-warm-brown">
                    {payment.timestamp.toLocaleDateString()} • {payment.paymentMethod}
                  </p>
                  <p className="text-xs text-warm-brown/70">ID: {payment.transactionId}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline">
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </Button>
                {payment.status === "completed" && (
                  <Button size="sm" variant="outline">
                    <Download className="w-4 h-4 mr-1" />
                    Receipt
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
