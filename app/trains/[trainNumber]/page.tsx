"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { FareCalculator } from "@/components/fare-calculator"
import { MapPin, ArrowLeft, Info, Route, AlertTriangle, CheckCircle2, Loader2, Calculator } from "lucide-react"
import Link from "next/link"

interface TrainDetails {
  train_no: string
  train_name: string
  from_stn_name: string
  from_stn_code: string
  to_stn_name: string
  to_stn_code: string
  from_time: string
  to_time: string
  travel_time: string
  running_days: string
  type: string
  train_id: string
  distance_from_to: string
  average_speed: string
}

interface RouteStation {
  source_stn_name: string
  source_stn_code: string
  arrive: string
  depart: string
  distance: string
  day: string
  zone: string
}

export default function TrainDetailPage() {
  const params = useParams()
  const trainNumber = params.trainNumber as string

  const [trainDetails, setTrainDetails] = useState<TrainDetails | null>(null)
  const [routeDetails, setRouteDetails] = useState<RouteStation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showFareCalculator, setShowFareCalculator] = useState(false)

  useEffect(() => {
    async function fetchTrainDetails() {
      setLoading(true)
      setError("")

      try {
        // Fetch train details
        const trainResponse = await fetch(`/api/trains/getTrain?trainNo=${trainNumber}`)
        const trainData = await trainResponse.json()

        if (!trainData.success) {
          setError(trainData.data || "Failed to fetch train details")
          setLoading(false)
          return
        }

        setTrainDetails(trainData.data)

        // Fetch route details
        const routeResponse = await fetch(`/api/trains/getRoute?trainNo=${trainNumber}`)
        const routeData = await routeResponse.json()

        if (routeData.success) {
          setRouteDetails(routeData.data)
        }
      } catch (err) {
        setError("An error occurred while fetching train information")
      } finally {
        setLoading(false)
      }
    }

    if (trainNumber) {
      fetchTrainDetails()
    }
  }, [trainNumber])

  // Format running days from binary string (e.g., "1111111" for all days)
  const formatRunningDays = (runningDaysStr: string) => {
    if (!runningDaysStr) return "Information not available"

    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    const runningDaysArray = runningDaysStr.split("")

    return days.filter((_, index) => runningDaysArray[index] === "1").join(", ")
  }

  if (loading) {
    return (
      <div className="container mx-auto py-4 sm:py-8 px-4">
        <div className="flex items-center mb-4 sm:mb-6">
          <Button variant="ghost" size="sm" asChild className="mr-4">
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
          <Skeleton className="h-6 sm:h-8 w-48 sm:w-64" />
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 sm:h-8 w-32 sm:w-48 mb-2" />
            <Skeleton className="h-4 w-48 sm:w-72" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-3 sm:space-y-4">
                <Skeleton className="h-20 sm:h-24 w-full" />
                <Skeleton className="h-20 sm:h-24 w-full" />
              </div>
              <div className="space-y-3 sm:space-y-4">
                <Skeleton className="h-20 sm:h-24 w-full" />
                <Skeleton className="h-20 sm:h-24 w-full" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6 sm:mt-8">
          <CardHeader>
            <Skeleton className="h-5 sm:h-6 w-24 sm:w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-48 sm:h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-4 sm:py-8 px-4">
        <Button variant="ghost" size="sm" asChild className="mb-4 sm:mb-6">
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Search
          </Link>
        </Button>

        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!trainDetails) {
    return (
      <div className="container mx-auto py-4 sm:py-8 px-4">
        <Button variant="ghost" size="sm" asChild className="mb-4 sm:mb-6">
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Search
          </Link>
        </Button>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>No Data</AlertTitle>
          <AlertDescription>No train information found for the given train number.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-4 sm:py-8 px-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3 sm:gap-0">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Search
          </Link>
        </Button>

        <Button
          variant="outline"
          onClick={() => setShowFareCalculator(!showFareCalculator)}
          className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800 w-full sm:w-auto"
        >
          <Calculator className="h-4 w-4 mr-2" />
          Check Fare
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6">
        {/* Train Header */}
        <Card className="border-l-4 border-l-orange-500 dark:border-l-orange-600">
          <CardHeader>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 lg:gap-0">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <CardTitle className="text-xl sm:text-2xl">{trainDetails.train_no}</CardTitle>
                  <Badge variant="outline" className="text-orange-600 dark:text-orange-400 text-xs sm:text-sm">
                    {trainDetails.type || "Express"}
                  </Badge>
                </div>
                <CardDescription className="text-base sm:text-lg font-medium text-foreground mt-1">
                  {trainDetails.train_name}
                </CardDescription>
              </div>
              <div>
                <Badge variant="secondary" className="text-xs sm:text-sm">
                  Avg. Speed: {trainDetails.average_speed || "N/A"} km/h
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Journey Overview */}
              <Card className="border bg-muted/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base sm:text-lg flex items-center">
                    <Route className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-orange-500" />
                    Journey Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start justify-between">
                    <div className="text-center flex-1">
                      <p className="font-bold text-lg sm:text-xl lg:text-2xl">{trainDetails.from_time}</p>
                      <div className="mt-1 space-y-1">
                        <p className="font-medium text-xs sm:text-sm lg:text-base truncate">
                          {trainDetails.from_stn_name}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {trainDetails.from_stn_code}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex flex-col items-center px-2 sm:px-4 flex-shrink-0">
                      <div className="h-0.5 w-8 sm:w-12 lg:w-16 xl:w-24 bg-orange-500 mb-2"></div>
                      <div className="text-center">
                        <p className="text-xs sm:text-sm font-medium">{trainDetails.travel_time}</p>
                        <p className="text-xs text-muted-foreground">{trainDetails.distance_from_to || "N/A"} km</p>
                      </div>
                    </div>

                    <div className="text-center flex-1">
                      <p className="font-bold text-lg sm:text-xl lg:text-2xl">{trainDetails.to_time}</p>
                      <div className="mt-1 space-y-1">
                        <p className="font-medium text-xs sm:text-sm lg:text-base truncate">
                          {trainDetails.to_stn_name}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {trainDetails.to_stn_code}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Train Information */}
              <Card className="border bg-muted/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base sm:text-lg flex items-center">
                    <Info className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-orange-500" />
                    Train Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground">Train Type</p>
                      <p className="font-medium text-sm sm:text-base">{trainDetails.type || "Express"}</p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground">Distance</p>
                      <p className="font-medium text-sm sm:text-base">{trainDetails.distance_from_to || "N/A"} km</p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground">Running Days</p>
                      <p className="font-medium text-sm sm:text-base">{formatRunningDays(trainDetails.running_days)}</p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground">Travel Time</p>
                      <p className="font-medium text-sm sm:text-base">{trainDetails.travel_time}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Fare Calculator */}
        {showFareCalculator && (
          <FareCalculator
            trainNumber={trainDetails.train_no}
            fromStation={trainDetails.from_stn_code}
            toStation={trainDetails.to_stn_code}
            onClose={() => setShowFareCalculator(false)}
          />
        )}

        {/* Train Route */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg flex items-center">
              <MapPin className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-orange-500" />
              Complete Route
            </CardTitle>
            <CardDescription className="text-sm sm:text-base">
              All stations where this train stops during its journey
            </CardDescription>
          </CardHeader>
          <CardContent>
            {routeDetails.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12 text-xs sm:text-sm">Day</TableHead>
                      <TableHead className="text-xs sm:text-sm">Station</TableHead>
                      <TableHead className="text-xs sm:text-sm">Arrives</TableHead>
                      <TableHead className="text-xs sm:text-sm">Departs</TableHead>
                      <TableHead className="text-xs sm:text-sm">Distance</TableHead>
                      <TableHead className="text-xs sm:text-sm">Zone</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {routeDetails.map((station, index) => (
                      <TableRow key={index}>
                        <TableCell className="text-xs sm:text-sm">{station.day}</TableCell>
                        <TableCell>
                          <div>
                            <span className="font-medium text-xs sm:text-sm">{station.source_stn_name}</span>
                            <span className="text-xs text-muted-foreground ml-1 sm:ml-2">
                              ({station.source_stn_code})
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm">
                          {station.arrive === "Source" ? (
                            <Badge
                              variant="outline"
                              className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 text-xs"
                            >
                              Source
                            </Badge>
                          ) : (
                            station.arrive
                          )}
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm">
                          {station.depart === "Destination" ? (
                            <Badge
                              variant="outline"
                              className="bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 text-xs"
                            >
                              Destination
                            </Badge>
                          ) : (
                            station.depart
                          )}
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm">{station.distance} km</TableCell>
                        <TableCell className="text-xs sm:text-sm">{station.zone}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-6 sm:py-8">
                <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-muted mb-3 sm:mb-4">
                  <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-sm sm:text-base">Loading route information...</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Additional Information</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="amenities">
              <TabsList className="grid w-full grid-cols-3 h-auto">
                <TabsTrigger value="amenities" className="text-xs sm:text-sm py-2">
                  Amenities
                </TabsTrigger>
                <TabsTrigger value="classes" className="text-xs sm:text-sm py-2">
                  Classes
                </TabsTrigger>
                <TabsTrigger value="rules" className="text-xs sm:text-sm py-2">
                  Rules
                </TabsTrigger>
              </TabsList>
              <TabsContent value="amenities" className="mt-3 sm:mt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  {[
                    { name: "Pantry Car", available: true },
                    { name: "Bedding", available: true },
                    { name: "WiFi", available: false },
                    { name: "Charging Point", available: true },
                    { name: "Food Included", available: false },
                    { name: "Bio Toilets", available: true },
                    { name: "Security", available: true },
                    { name: "Wheelchair", available: false },
                  ].map((amenity, index) => (
                    <div key={index} className="flex items-center p-2 sm:p-3 border rounded-md">
                      {amenity.available ? (
                        <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 mr-2" />
                      ) : (
                        <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 text-amber-500 mr-2" />
                      )}
                      <span
                        className={`text-xs sm:text-sm ${amenity.available ? "text-foreground" : "text-muted-foreground"}`}
                      >
                        {amenity.name}
                      </span>
                    </div>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="classes" className="mt-3 sm:mt-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3 sm:gap-4">
                  {[
                    { code: "1A", name: "First AC", available: true },
                    { code: "2A", name: "Second AC", available: true },
                    { code: "3A", name: "Third AC", available: true },
                    { code: "SL", name: "Sleeper", available: true },
                    { code: "CC", name: "Chair Car", available: false },
                    { code: "2S", name: "Second Sitting", available: true },
                    { code: "EC", name: "Executive Chair Car", available: false },
                    { code: "FC", name: "First Class", available: false },
                  ].map((travelClass, index) => (
                    <div
                      key={index}
                      className={`p-2 sm:p-3 border rounded-md ${
                        travelClass.available
                          ? "bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-900"
                          : "bg-gray-50 border-gray-200 dark:bg-gray-800/30 dark:border-gray-700"
                      }`}
                    >
                      <div className="font-bold text-sm sm:text-base">{travelClass.code}</div>
                      <div
                        className={`text-xs sm:text-sm ${travelClass.available ? "text-foreground" : "text-muted-foreground"}`}
                      >
                        {travelClass.name}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="rules" className="mt-3 sm:mt-4">
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <h4 className="font-medium text-sm sm:text-base">Cancellation Rules</h4>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                      Cancellation charges depend on how much time before the scheduled departure you cancel your
                      ticket.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm sm:text-base">Reservation Rules</h4>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                      Tickets can be booked up to 120 days in advance. Tatkal booking opens one day before the journey
                      at 10:00 AM for AC classes and 11:00 AM for non-AC classes.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm sm:text-base">Children Rules</h4>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                      Children below 5 years of age travel free. Children aged 5-12 years are charged at half the adult
                      fare with a separate seat/berth.
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
