"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StationAutocomplete } from "@/components/station-autocomplete"
import { FareCalculator } from "@/components/fare-calculator"
import { Train, Clock, Search, Calendar, Users, ArrowRight, Moon, Sun, Loader2, Calculator } from "lucide-react"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"

interface TrainData {
  train_no: string
  train_name: string
  source_stn_name: string
  source_stn_code: string
  dstn_stn_name: string
  dstn_stn_code: string
  from_stn_name: string
  from_stn_code: string
  to_stn_name: string
  to_stn_code: string
  from_time: string
  to_time: string
  travel_time: string
  running_days: string
}

interface ApiResponse {
  success: boolean
  time_stamp: number
  data: TrainData[] | string
}

export default function IndianRailwayInfo() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTab, setSelectedTab] = useState("search")
  const [fromStation, setFromStation] = useState("")
  const [toStation, setToStation] = useState("")
  const [searchDate, setSearchDate] = useState("")
  const [trainNumber, setTrainNumber] = useState("")
  const [pnrNumber, setPnrNumber] = useState("")
  const [searchResults, setSearchResults] = useState<TrainData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [recentStationPairs, setRecentStationPairs] = useState<
    Array<{ from: string; to: string; fromCode: string; toCode: string }>
  >([])
  const [hasSearched, setHasSearched] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const searchTrains = async () => {
    if (!fromStation || !toStation) {
      setError("Please enter both from and to stations")
      return
    }

    setLoading(true)
    setError("")

    try {
      const endpoint = searchDate
        ? `/api/trains/getTrainOn?from=${encodeURIComponent(fromStation)}&to=${encodeURIComponent(toStation)}&date=${searchDate}`
        : `/api/trains/betweenStations?from=${encodeURIComponent(fromStation)}&to=${encodeURIComponent(toStation)}`

      const response = await fetch(endpoint)
      const data: ApiResponse = await response.json()

      if (data.success && Array.isArray(data.data)) {
        setSearchResults(data.data)
        setHasSearched(true)

        // Add station pair to recent searches
        if (data.data.length > 0) {
          const firstTrain = data.data[0]
          const stationPair = {
            from: fromStation,
            to: toStation,
            fromCode: firstTrain.from_stn_code,
            toCode: firstTrain.to_stn_code,
          }

          setRecentStationPairs((prev) => {
            const newPairs = [
              stationPair,
              ...prev.filter((pair) => !(pair.fromCode === stationPair.fromCode && pair.toCode === stationPair.toCode)),
            ]
            return newPairs.slice(0, 6) // Keep only 6 recent pairs
          })
        }
      } else {
        setError(typeof data.data === "string" ? data.data : "No trains found")
        setSearchResults([])
      }
    } catch (err) {
      setError("Failed to fetch train data")
      setSearchResults([])
    } finally {
      setLoading(false)
    }
  }

  const searchSingleTrain = async () => {
    if (!trainNumber) {
      setError("Please enter a train number")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch(`/api/trains/getTrain?trainNo=${trainNumber}`)
      const data = await response.json()

      if (data.success) {
        // Navigate to the detailed view page
        router.push(`/trains/${trainNumber}`)
      } else {
        setError(data.data || "Train not found")
        setSearchResults([])
      }
    } catch (err) {
      setError("Failed to fetch train data")
      setSearchResults([])
    } finally {
      setLoading(false)
    }
  }

  const viewTrainDetails = (trainNo: string) => {
    router.push(`/trains/${trainNo}`)
  }

  const handleRecentStationClick = (stationPair: { from: string; to: string; fromCode: string; toCode: string }) => {
    setFromStation(stationPair.from)
    setToStation(stationPair.to)
    setSelectedTab("search")
    // Automatically search after setting stations
    setTimeout(() => {
      searchTrains()
    }, 100)
  }

  // Add a function to scroll to PNR section:
  const scrollToPNRSection = () => {
    setSelectedTab("pnr")
    // Small delay to ensure tab content is rendered
    setTimeout(() => {
      const pnrSection = document.querySelector('[data-tab="pnr"]')
      if (pnrSection) {
        pnrSection.scrollIntoView({ behavior: "smooth" })
      }
    }, 100)
  }

  // Generic helper to scroll to a TabContent by value
  const scrollToTab = (tabValue: string) => {
    setSelectedTab(tabValue)
    setTimeout(() => {
      const section = document.querySelector(`[data-tab="${tabValue}"]`)
      if (section) {
        section.scrollIntoView({ behavior: "smooth" })
      }
    }, 100)
  }

  // Add function to scroll to fare calculator
  const scrollToFareCalculator = () => {
    setSelectedTab("fare")
    setTimeout(() => {
      const fareSection = document.querySelector('[data-tab="fare"]')
      if (fareSection) {
        fareSection.scrollIntoView({ behavior: "smooth" })
      }
    }, 100)
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-background to-green-50 dark:from-gray-900 dark:via-background dark:to-gray-800">
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-sm shadow-sm border-b-2 border-orange-200 dark:border-orange-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="bg-gradient-to-r from-orange-500 to-green-600 p-2 rounded-lg">
                <Train className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-foreground">Chuk Chuk</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">Journey Information System</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="icon" onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
              <Button variant="outline" size="sm" className="hidden md:flex" onClick={scrollToFareCalculator}>
                <Calculator className="h-4 w-4 mr-2" />
                Fare Calculator
              </Button>
              <Button variant="outline" size="sm" className="hidden md:flex" onClick={scrollToPNRSection}>
                <Users className="h-4 w-4 mr-2" />
                PNR Status
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-6 sm:py-8 lg:py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-xl sm:text-2xl lg:text-4xl font-bold text-foreground mb-3 sm:mb-4">
            Find Your Perfect Journey
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground mb-4 sm:mb-6 lg:mb-8">
            Search trains, check schedules, and plan your travel across India
          </p>

          {/* Search Bar */}
          <div className="bg-card rounded-2xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8 border">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4">
              <StationAutocomplete
                placeholder="From Station"
                value={fromStation}
                onChange={setFromStation}
                className="h-10 sm:h-12 text-sm sm:text-lg"
              />
              <StationAutocomplete
                placeholder="To Station"
                value={toStation}
                onChange={setToStation}
                className="h-10 sm:h-12 text-sm sm:text-lg"
              />
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 sm:top-3 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                <Input
                  type="date"
                  className="pl-10 h-10 sm:h-12 text-sm sm:text-lg"
                  value={searchDate}
                  onChange={(e) => setSearchDate(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <Button
                className="h-10 sm:h-12 text-sm sm:text-lg bg-gradient-to-r from-orange-500 to-green-600 hover:from-orange-600 hover:to-green-700"
                onClick={searchTrains}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 mr-2 animate-spin" />
                ) : (
                  <Search className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                )}
                Search Trains
              </Button>
              <Button
                variant="outline"
                className="h-10 sm:h-12 text-sm sm:text-lg border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/20"
                onClick={scrollToFareCalculator}
              >
                <Calculator className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                Calculate Fare
              </Button>
            </div>
          </div>

          {/* Recent Searches - Only show after user has searched */}
          {hasSearched && recentStationPairs.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2">
              <span className="text-xs sm:text-sm text-muted-foreground mr-2">Recent Routes:</span>
              {recentStationPairs.map((stationPair, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="cursor-pointer hover:bg-orange-100 dark:hover:bg-orange-900 text-xs"
                  onClick={() => handleRecentStationClick(stationPair)}
                >
                  {stationPair.fromCode} → {stationPair.toCode}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 mb-4 sm:mb-6 lg:mb-8 h-auto">
            <TabsTrigger value="search" className="text-xs sm:text-sm py-2 sm:py-3">
              Search Results
            </TabsTrigger>
            <TabsTrigger value="single" className="text-xs sm:text-sm py-2 sm:py-3">
              Single Train
            </TabsTrigger>
            <TabsTrigger value="fare" className="text-xs sm:text-sm py-2 sm:py-3">
              Fare Calculator
            </TabsTrigger>
            <TabsTrigger value="pnr" className="text-xs sm:text-sm py-2 sm:py-3">
              PNR Status
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-4 sm:space-y-6" data-tab="search">
            {error && (
              <Card className="border-red-200 dark:border-red-800">
                <CardContent className="pt-4 sm:pt-6">
                  <p className="text-red-600 dark:text-red-400 text-center text-sm sm:text-base">{error}</p>
                </CardContent>
              </Card>
            )}

            {searchResults.length > 0 && (
              <div className="grid gap-3 sm:gap-4 lg:gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {searchResults.map((train, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow border-l-4 border-l-orange-500">
                    <CardHeader className="pb-2 sm:pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base sm:text-lg">{train.train_no}</CardTitle>
                        <Badge variant="secondary" className="text-xs">
                          Express
                        </Badge>
                      </div>
                      <CardDescription className="font-medium text-foreground text-sm sm:text-base">
                        {train.train_name}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 sm:space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="text-center flex-1">
                          <p className="font-semibold text-sm sm:text-lg">{train.from_time}</p>
                          <p className="text-xs sm:text-sm text-muted-foreground truncate">{train.from_stn_name}</p>
                          <p className="text-xs text-muted-foreground">({train.from_stn_code})</p>
                        </div>
                        <div className="flex items-center space-x-1 sm:space-x-2 px-2">
                          <div className="h-px bg-border flex-1 w-4 sm:w-8"></div>
                          <Train className="h-3 w-3 sm:h-4 sm:w-4 text-orange-500" />
                          <div className="h-px bg-border flex-1 w-4 sm:w-8"></div>
                        </div>
                        <div className="text-center flex-1">
                          <p className="font-semibold text-sm sm:text-lg">{train.to_time}</p>
                          <p className="text-xs sm:text-sm text-muted-foreground truncate">{train.to_stn_name}</p>
                          <p className="text-xs text-muted-foreground">({train.to_stn_code})</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                          <span className="text-xs sm:text-sm text-muted-foreground">{train.travel_time}</span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => viewTrainDetails(train.train_no)}
                          className="text-xs sm:text-sm"
                        >
                          View Details
                          <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {searchResults.length === 0 && !error && !loading && (
              <Card>
                <CardContent className="pt-4 sm:pt-6">
                  <p className="text-center text-muted-foreground text-sm sm:text-base">
                    Enter stations above to search for trains
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="single" className="space-y-4 sm:space-y-6" data-tab="single">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Search Single Train</CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Enter train number to get detailed information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <Input
                    placeholder="Enter train number (e.g., 12951)"
                    value={trainNumber}
                    onChange={(e) => setTrainNumber(e.target.value)}
                    className="flex-1 text-sm sm:text-base"
                  />
                  <Button onClick={searchSingleTrain} disabled={loading} className="w-full sm:w-auto">
                    {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
                    Search
                  </Button>
                </div>

                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 sm:p-4">
                    <p className="text-red-600 dark:text-red-400 text-sm sm:text-base">{error}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fare" className="space-y-4 sm:space-y-6" data-tab="fare">
            <FareCalculator fromStation={fromStation} toStation={toStation} />
          </TabsContent>

          <TabsContent value="pnr" className="space-y-4 sm:space-y-6" data-tab="pnr">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">PNR Status</CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Check your PNR status and booking details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <Input
                    placeholder="Enter 10-digit PNR number"
                    value={pnrNumber}
                    onChange={(e) => setPnrNumber(e.target.value)}
                    className="flex-1 text-sm sm:text-base"
                    maxLength={10}
                  />
                  <Button disabled={loading} className="w-full sm:w-auto">
                    {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
                    Check Status
                  </Button>
                </div>

                <div className="bg-muted rounded-lg p-3 sm:p-4">
                  <p className="text-center text-muted-foreground text-sm sm:text-base">
                    Enter a PNR number to check booking status
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-3 sm:mb-4">
                <Train className="h-5 w-5 sm:h-6 sm:w-6 text-orange-500" />
                <span className="font-bold text-base sm:text-lg">Chuk Chuk</span>
              </div>
              <p className="text-muted-foreground text-xs sm:text-sm">
                Your trusted companion for railway information across India.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2 sm:mb-3 text-sm sm:text-base">Quick Links</h3>
              <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-muted-foreground">
                <li>
                  <button onClick={() => scrollToTab('search')} className="hover:text-foreground text-left w-full">
                    Train Search
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToTab('pnr')} className="hover:text-foreground text-left w-full">
                    PNR Status
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToTab('fare')} className="hover:text-foreground text-left w-full">
                    Fare Calculator
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToTab('single')} className="hover:text-foreground text-left w-full">
                    Live Status
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2 sm:mb-3 text-sm sm:text-base">Services</h3>
              <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-muted-foreground">
                <li>
                  <button onClick={() => scrollToTab('single')} className="hover:text-foreground text-left w-full">
                    Route Information
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToTab('search')} className="hover:text-foreground text-left w-full">
                    Station Details
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToTab('single')} className="hover:text-foreground text-left w-full">
                    Train Schedule
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToTab('fare')} className="hover:text-foreground text-left w-full">
                    Fare Enquiry
                  </button>
                </li>
              </ul>
            </div>
            <div>
            </div>
          </div>
          <div className="border-t mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-xs sm:text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Chuk Chuk. Data Fetched From Erail.In .</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
