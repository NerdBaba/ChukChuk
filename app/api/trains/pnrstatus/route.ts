export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const pnr = searchParams.get("pnr")

  if (!pnr) {
    return Response.json(
      {
        success: false,
        time_stamp: Date.now(),
        data: "PNR number is required",
      },
      { status: 400 },
    )
  }

  try {
    const URL_Train = `https://www.confirmtkt.com/pnr-status/${pnr}`
    const response = await fetch(URL_Train, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    })
    const data = await response.text()
    const json = pnrStatus(data)

    return Response.json(json)
  } catch (error) {
    return Response.json(
      {
        success: false,
        time_stamp: Date.now(),
        data: "Failed to fetch PNR status",
      },
      { status: 500 },
    )
  }
}

function pnrStatus(string: string) {
  try {
    const retval: any = {}
    const pattern = /data\s*=\s*({.*?;)/
    const match = string.match(pattern)

    if (!match) {
      retval["success"] = false
      retval["time_stamp"] = Date.now()
      retval["data"] = "PNR data not found"
      return retval
    }

    const dataString = match[0].slice(7, -1)
    const data = JSON.parse(dataString)

    retval["success"] = true
    retval["time_stamp"] = Date.now()
    retval["data"] = data

    return retval
  } catch (err) {
    return {
      success: false,
      time_stamp: Date.now(),
      data: "Error parsing PNR data",
    }
  }
}
