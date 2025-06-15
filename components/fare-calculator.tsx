"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Calculator, IndianRupee, Loader2, Info, Train, Users, ExternalLink, AlertCircle } from "lucide-react"

interface FareData {
  trainNumber: string
  trainName: string
  from: string
  to: string
  passengerCounts: {
    adult: number
    child: number
    seniorFemale: number
    seniorMale: number
    total: number
  }
  individualFares: {
    [key: string]: {
      general: number
      tatkal: number | null
      child: number
      childTatkal: number | null
      senFemale: number
      senMale: number
    }
  }
  totalFares: {
    [key: string]: {
      general: number | null
      tatkal: number | null
    }
  }
  notes: {
    adult: string
    child: string
    seniorFemale: string
    seniorMale: string
  }
  sourceUrl?: string
}

interface FareCalculatorProps {
  trainNumber?: string
  fromStation?: string
  toStation?: string
  onClose?: () => void
}

export function FareCalculator({ trainNumber = "", fromStation = "", toStation = "", onClose }: FareCalculatorProps) {
  const [train, setTrain] = useState(trainNumber)
  const [from, setFrom] = useState(fromStation)
  const [to, setTo] = useState(toStation)
  const [adult, setAdult] = useState("1")
  const [child, setChild] = useState("0")
  const [seniorFemale, setSeniorFemale] = useState("0")
  const [seniorMale, setSeniorMale] = useState("0")
  const [loading, setLoading] = useState(false)
  const [fareData, setFareData] = useState<FareData | null>(null)
  const [error, setError] = useState("")
  const [trainDetails, setTrainDetails] = useState<any>(null)

  // Fetch train details when train number changes
  useEffect(() => {
    if (train && train.length >= 4) {
      fetchTrainDetails(train)
    }
  }, [train])

  const fetchTrainDetails = async (trainNum: string) => {
    try {
      const response = await fetch(`/api/trains/${trainNum}`)
      const data = await response.json()
      if (data.success) {
        setTrainDetails(data.data)
      }
    } catch (err) {
      console.error("Failed to fetch train details:", err)
    }
  }

  const calculateFare = async () => {
    if (!train || !from || !to) {
      setError("Please fill in train number, from station, and to station")
      return
    }

    setLoading(true)
    setError("")
    setFareData(null)

    try {
      const response = await fetch(
        `/api/trains/calculateFare?train=${train}&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&adult=${adult}&child=${child}&sfemale=${seniorFemale}&smale=${seniorMale}`,
      )
      const data = await response.json()

      if (data.success) {
        setFareData(data.data)
      } else {
        setError(data.data || "Failed to calculate fare")
      }
    } catch (err) {
      setError("An error occurred while calculating fare")
    } finally {
      setLoading(false)
    }
  }

  const passengerOptions = Array.from({ length: 7 }, (_, i) => i.toString())

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calculator className="h-5 w-5 mr-2 text-blue-500" />
            Train Fare Calculator
          </CardTitle>
          <CardDescription>Calculate train fares using live data from erail.in</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Train Selection */}
          <div className="space-y-2">
            <Label htmlFor="train-number">Train Number *</Label>
            <div className="flex gap-2">
              <Input
                id="train-number"
                placeholder="Enter train number (e.g., 12695)"
                value={train}
                onChange={(e) => setTrain(e.target.value)}
                className="flex-1"
              />
              {trainDetails && (
                <div className="flex items-center px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-md border">
                  <Train className="h-4 w-4 mr-2 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-400">
                    {trainDetails.train_name}
                  </span>
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              <AlertCircle className="h-3 w-3 inline mr-1" />
              Note: Fare data is fetched live from erail.in. Some trains may not have fare data available.
            </p>
          </div>

          {/* Station Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="from-station">From Station Code *</Label>
              <Input
                id="from-station"
                placeholder="Enter station code (e.g., MAS)"
                value={from}
                onChange={(e) => setFrom(e.target.value.toUpperCase())}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">Use station codes like MAS, NDLS, etc.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="to-station">To Station Code *</Label>
              <Input
                id="to-station"
                placeholder="Enter station code (e.g., AWY)"
                value={to}
                onChange={(e) => setTo(e.target.value.toUpperCase())}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">Use station codes like AWY, TVC, etc.</p>
            </div>
          </div>

          {/* Passenger Selection */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Passenger Details</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="adult">Adult</Label>
                <Select value={adult} onValueChange={setAdult}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {passengerOptions.map((num) => (
                      <SelectItem key={num} value={num}>
                        Adult {num}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="child">Child</Label>
                <Select value={child} onValueChange={setChild}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {passengerOptions.map((num) => (
                      <SelectItem key={num} value={num}>
                        Child {num}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="senior-female">Senior Female</Label>
                <Select value={seniorFemale} onValueChange={setSeniorFemale}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {passengerOptions.map((num) => (
                      <SelectItem key={num} value={num}>
                        Senior Female {num}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="senior-male">Senior Male</Label>
                <Select value={seniorMale} onValueChange={setSeniorMale}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {passengerOptions.map((num) => (
                      <SelectItem key={num} value={num}>
                        Senior Male {num}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Calculate Button */}
          <Button
            onClick={calculateFare}
            disabled={loading || !train || !from || !to}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Calculator className="h-4 w-4 mr-2" />}
            Calculate Fare
          </Button>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Fare Results */}
      {fareData && (
        <div className="space-y-6">
          {/* Summary */}
          <Card className="border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="flex items-center text-blue-700 dark:text-blue-400">
                <IndianRupee className="h-5 w-5 mr-2" />
                {fareData.trainName.startsWith(fareData.trainNumber) ? fareData.trainName : `${fareData.trainNumber} ${fareData.trainName}`}
              </CardTitle>
              <CardDescription className="flex items-center justify-between">
                <span>
                  {fareData.from} to {fareData.to} • {fareData.passengerCounts.total} Passenger(s)
                </span>
                {fareData.sourceUrl && (
                  <a
                    href={fareData.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-xs text-blue-600 hover:text-blue-800"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    View on erail.in
                  </a>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                {fareData.passengerCounts.adult > 0 && (
                  <Badge variant="secondary">
                    <Users className="h-3 w-3 mr-1" />
                    {fareData.passengerCounts.adult} Adult
                  </Badge>
                )}
                {fareData.passengerCounts.child > 0 && (
                  <Badge variant="secondary">
                    <Users className="h-3 w-3 mr-1" />
                    {fareData.passengerCounts.child} Child
                  </Badge>
                )}
                {fareData.passengerCounts.seniorFemale > 0 && (
                  <Badge variant="secondary">
                    <Users className="h-3 w-3 mr-1" />
                    {fareData.passengerCounts.seniorFemale} Senior Female
                  </Badge>
                )}
                {fareData.passengerCounts.seniorMale > 0 && (
                  <Badge variant="secondary">
                    <Users className="h-3 w-3 mr-1" />
                    {fareData.passengerCounts.seniorMale} Senior Male
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Total Fare Table */}
          {Object.keys(fareData.totalFares).length > 0 && (
            <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
              <CardHeader>
                <CardTitle className="text-green-700 dark:text-green-400">
                  Total fare for {fareData.passengerCounts.total} Passenger(s)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead></TableHead>
                      {Object.keys(fareData.totalFares).map((className) => (
                        <TableHead key={className} className="text-center">
                          {className}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">General</TableCell>
                      {Object.entries(fareData.totalFares).map(([className, fares]) => (
                        <TableCell key={className} className="text-center font-bold">
                          {fares.general ? `₹${fares.general}` : "-"}
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Tatkal</TableCell>
                      {Object.entries(fareData.totalFares).map(([className, fares]) => (
                        <TableCell key={className} className="text-center font-bold">
                          {fares.tatkal ? `₹${fares.tatkal}` : "-"}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Individual Passenger Fare Table */}
          {Object.keys(fareData.individualFares).length > 0 && (
            <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
              <CardHeader>
                <CardTitle className="text-amber-700 dark:text-amber-400">Individual passenger fare</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead></TableHead>
                      {Object.keys(fareData.individualFares).map((className) => (
                        <TableHead key={className} className="text-center">
                          {className}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Adult</TableCell>
                      {Object.entries(fareData.individualFares).map(([className, fares]) => (
                        <TableCell key={className} className="text-center font-bold">
                          ₹{fares.general}
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Child</TableCell>
                      {Object.entries(fareData.individualFares).map(([className, fares]) => (
                        <TableCell key={className} className="text-center font-bold">
                          ₹{fares.child}
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Adult Tatkal</TableCell>
                      {Object.entries(fareData.individualFares).map(([className, fares]) => (
                        <TableCell key={className} className="text-center font-bold">
                          {fares.tatkal ? `₹${fares.tatkal}` : "-"}
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Child Tatkal</TableCell>
                      {Object.entries(fareData.individualFares).map(([className, fares]) => (
                        <TableCell key={className} className="text-center font-bold">
                          {fares.childTatkal ? `₹${fares.childTatkal}` : "-"}
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Senior Female</TableCell>
                      {Object.entries(fareData.individualFares).map(([className, fares]) => (
                        <TableCell key={className} className="text-center font-bold">
                          ₹{fares.senFemale}
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Senior Male</TableCell>
                      {Object.entries(fareData.individualFares).map(([className, fares]) => (
                        <TableCell key={className} className="text-center font-bold">
                          ₹{fares.senMale}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableBody>
                </Table>

                <div className="mt-4 p-3 bg-white dark:bg-gray-800 rounded border text-sm text-muted-foreground">
                  <p>
                    <strong>Adult</strong> - {fareData.notes.adult}
                  </p>
                  <p>
                    <strong>Child</strong> - {fareData.notes.child}
                  </p>
                  <p>
                    <strong>Senior Female</strong> - {fareData.notes.seniorFemale}
                  </p>
                  <p>
                    <strong>Senior Male</strong> - {fareData.notes.seniorMale}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Additional Information */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start">
              <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2 mt-0.5" />
              <div className="space-y-2">
                <h4 className="font-medium text-blue-800 dark:text-blue-400">Important Notes</h4>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <li>• Fare data is fetched live from erail.in</li>
                  <li>• Payment gateway charges will be extra</li>
                  <li>• Fares are subject to change without notice</li>
                  <li>• Tatkal booking opens 1 day before journey date</li>
                  <li>• Senior citizen concession as per railway rules</li>
                  <li>• Use proper station codes (e.g., MAS, NDLS, TVC)</li>
                </ul>
              </div>
            </div>
          </div>

          {onClose && (
            <div className="flex justify-end">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
