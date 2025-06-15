import * as cheerio from "cheerio"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const trainNumber = searchParams.get("train")
  const from = searchParams.get("from")
  const to = searchParams.get("to")
  const adult = searchParams.get("adult") || "1"
  const child = searchParams.get("child") || "0"
  const sfemale = searchParams.get("sfemale") || "0"
  const smale = searchParams.get("smale") || "0"

  if (!trainNumber || !from || !to) {
    return Response.json(
      {
        success: false,
        time_stamp: Date.now(),
        data: "Train number, from station, and to station are required",
      },
      { status: 400 },
    )
  }

  try {
    // Construct the erail.in URL
    const erailUrl = `https://erail.in/train-fare/${trainNumber}?from=${from}&to=${to}&adult=${adult}&child=${child}&sfemale=${sfemale}&smale=${smale}`

    console.log("Fetching fare from:", erailUrl)

    // Fetch the HTML from erail.in
    const response = await fetch(erailUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate, br",
        Connection: "keep-alive",
        "Upgrade-Insecure-Requests": "1",
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    // Extract train name from the page title or H1
    const trainName = $("h1").text().trim() || `Train ${trainNumber}`

    // Parse total fare table
    const totalFares: any = {}
    const totalFareTable = $(".panel-success .tableSingleFare")

    if (totalFareTable.length > 0) {
      // Get headers (1A, 2A, 3A, SL)
      const headers: string[] = []
      totalFareTable
        .find("tr")
        .first()
        .find("th")
        .each((i, el) => {
          if (i > 0) {
            // Skip first empty header
            headers.push($(el).text().trim())
          }
        })

      // Get General quota fares
      const generalRow = totalFareTable.find("tr").eq(1)
      generalRow.find("td").each((i, el) => {
        if (i > 0) {
          // Skip first column (label)
          const fare = $(el).text().trim().replace(/[₹,]/g, "")
          const className = headers[i - 1]
          if (className) {
            totalFares[className] = {
              general: fare === "-" ? null : Number.parseInt(fare) || 0,
              tatkal: null,
            }
          }
        }
      })

      // Get Tatkal quota fares
      const tatkalRow = totalFareTable.find("tr").eq(2)
      if (tatkalRow.length > 0) {
        tatkalRow.find("td").each((i, el) => {
          if (i > 0) {
            // Skip first column (label)
            const fare = $(el).text().trim().replace(/[₹,]/g, "")
            const className = headers[i - 1]
            if (className && totalFares[className]) {
              totalFares[className].tatkal = fare === "-" ? null : Number.parseInt(fare) || null
            }
          }
        })
      }
    }

    // Parse individual fare table
    const individualFares: any = {}
    const individualFareTable = $(".panel-warning .tableSingleFare")

    if (individualFareTable.length > 0) {
      // Get headers
      const headers: string[] = []
      individualFareTable
        .find("tr")
        .first()
        .find("th")
        .each((i, el) => {
          if (i > 0) {
            headers.push($(el).text().trim())
          }
        })

      // Initialize fare structure
      headers.forEach((className) => {
        individualFares[className] = {
          general: 0,
          tatkal: null,
          child: 0,
          childTatkal: null,
          senFemale: 0,
          senMale: 0,
        }
      })

      // Parse each row
      individualFareTable.find("tr").each((rowIndex, row) => {
        if (rowIndex === 0) return // Skip header row

        const rowLabel = $(row).find("td").first().text().trim()

        $(row)
          .find("td")
          .each((colIndex, cell) => {
            if (colIndex === 0) return // Skip label column

            const fare = $(cell).text().trim().replace(/[₹,]/g, "")
            const className = headers[colIndex - 1]

            if (className && individualFares[className]) {
              const fareValue = fare === "-" ? null : Number.parseInt(fare) || 0

              switch (rowLabel) {
                case "Adult":
                  individualFares[className].general = fareValue
                  break
                case "Child":
                  individualFares[className].child = fareValue
                  break
                case "Adult Tatkal":
                  individualFares[className].tatkal = fareValue
                  break
                case "Child Tatkal":
                  individualFares[className].childTatkal = fareValue
                  break
                case "Sen. Female":
                  individualFares[className].senFemale = fareValue
                  break
                case "Sen. Male":
                  individualFares[className].senMale = fareValue
                  break
              }
            }
          })
      })
    }

    // Calculate passenger counts
    const adultCount = Number.parseInt(adult)
    const childCount = Number.parseInt(child)
    const senFemaleCount = Number.parseInt(sfemale)
    const senMaleCount = Number.parseInt(smale)

    // Extract station names from the page
    const fromStationName = from // You might want to extract full station names from the page
    const toStationName = to

    const fareData = {
      trainNumber,
      trainName: trainName.replace(" Fare", ""),
      from: fromStationName,
      to: toStationName,
      passengerCounts: {
        adult: adultCount,
        child: childCount,
        seniorFemale: senFemaleCount,
        seniorMale: senMaleCount,
        total: adultCount + childCount + senFemaleCount + senMaleCount,
      },
      individualFares,
      totalFares,
      notes: {
        adult: "12 years and above",
        child: "5 to 12 years",
        seniorFemale: "58 years and above",
        seniorMale: "60 years and above",
      },
      sourceUrl: erailUrl,
    }

    return Response.json({
      success: true,
      time_stamp: Date.now(),
      data: fareData,
    })
  } catch (error) {
    console.error("Fare calculation error:", error)
    return Response.json(
      {
        success: false,
        time_stamp: Date.now(),
        data: `Failed to fetch fare data: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 },
    )
  }
}
