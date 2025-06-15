export async function GET(request: Request, { params }: { params: { trainNumber: string } }) {
  const trainNumber = params.trainNumber

  try {
    // This would call the Indian Rail API's GetTrainInformation endpoint
    const mockTrainInfo = {
      trainNumber: trainNumber,
      trainName: "Mumbai Rajdhani Express",
      trainType: "Rajdhani",
      source: "Mumbai Central (BCT)",
      destination: "New Delhi (NDLS)",
      departureTime: "17:00",
      arrivalTime: "08:35+1",
      totalDistance: "1384 km",
      duration: "15h 35m",
      runningDays: ["Daily"],
      classes: [
        { className: "First AC", code: "1A", fare: 3500 },
        { className: "Second AC", code: "2A", fare: 2100 },
        { className: "Third AC", code: "3A", fare: 1500 },
      ],
      stations: [
        { stationName: "Mumbai Central", code: "BCT", arrivalTime: "Source", departureTime: "17:00", distance: 0 },
        { stationName: "Vadodara Junction", code: "BRC", arrivalTime: "20:03", departureTime: "20:08", distance: 392 },
        { stationName: "Ratlam Junction", code: "RTM", arrivalTime: "22:25", departureTime: "22:30", distance: 537 },
        { stationName: "Kota Junction", code: "KOTA", arrivalTime: "02:00+1", departureTime: "02:10+1", distance: 856 },
        {
          stationName: "New Delhi",
          code: "NDLS",
          arrivalTime: "08:35+1",
          departureTime: "Destination",
          distance: 1384,
        },
      ],
    }

    return Response.json({
      success: true,
      trainInfo: mockTrainInfo,
    })
  } catch (error) {
    return Response.json({ success: false, error: "Failed to fetch train information" }, { status: 500 })
  }
}
