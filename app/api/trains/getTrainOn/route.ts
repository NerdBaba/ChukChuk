export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const from = searchParams.get("from")
  const to = searchParams.get("to")
  const date = searchParams.get("date")

  if (!from || !to || !date) {
    return Response.json(
      {
        success: false,
        time_stamp: Date.now(),
        data: "From station, to station, and date are required",
      },
      { status: 400 },
    )
  }

  try {
    const URL_Trains = `https://erail.in/rail/getTrains.aspx?Station_From=${from}&Station_To=${to}&DataSource=0&Language=0&Cache=true`

    const response = await fetch(URL_Trains, {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    })

    const data = await response.text()
    const json = betweenStation(data)

    if (!json["success"]) {
      return Response.json(json)
    }

    // Parse date and filter trains
    const [year, month, day] = date.split("-")
    const dayOfWeek = getDayOnDate(Number.parseInt(day), Number.parseInt(month), Number.parseInt(year))

    const filteredTrains = json["data"].filter((train: any) => {
      const runningDays = train.running_days
      return runningDays && runningDays[dayOfWeek] === "1"
    })

    return Response.json({
      success: true,
      time_stamp: Date.now(),
      data: filteredTrains,
    })
  } catch (error) {
    return Response.json(
      {
        success: false,
        time_stamp: Date.now(),
        data: "Failed to fetch train data",
      },
      { status: 500 },
    )
  }
}

function getDayOnDate(DD: number, MM: number, YYYY: number) {
  const date = new Date(YYYY, MM - 1, DD)
  const day = date.getDay() >= 0 && date.getDay() <= 2 ? date.getDay() + 4 : date.getDay() - 3
  return day
}

function betweenStation(string: string) {
  try {
    let obj: any = {}
    const retval: any = {}
    const arr: any[] = []
    let obj2: any = {}
    let data = string.split("~~~~~~~~")
    let nore = data[0].split("~")
    nore = nore[5].split("<")

    if (nore[0] == "No direct trains found") {
      retval["success"] = false
      retval["time_stamp"] = Date.now()
      retval["data"] = nore[0]
      return retval
    }

    if (
      data[0] === "~~~~~Please try again after some time." ||
      data[0] === "~~~~~From station not found" ||
      data[0] === "~~~~~To station not found"
    ) {
      retval["success"] = false
      retval["time_stamp"] = Date.now()
      retval["data"] = data[0].replaceAll("~", "")
      return retval
    }

    data = data.filter((el) => el != "")

    for (let i = 0; i < data.length; i++) {
      let data1 = data[i].split("~^")
      if (data1.length === 2) {
        data1 = data1[1].split("~")
        data1 = data1.filter((el) => el != "")

        obj["train_no"] = data1[0]
        obj["train_name"] = data1[1]
        obj["source_stn_name"] = data1[2]
        obj["source_stn_code"] = data1[3]
        obj["dstn_stn_name"] = data1[4]
        obj["dstn_stn_code"] = data1[5]
        obj["from_stn_name"] = data1[6]
        obj["from_stn_code"] = data1[7]
        obj["to_stn_name"] = data1[8]
        obj["to_stn_code"] = data1[9]
        obj["from_time"] = data1[10]
        obj["to_time"] = data1[11]
        obj["travel_time"] = data1[12]
        obj["running_days"] = data1[13]

        obj2["train_base"] = obj
        arr.push(obj2)
        obj = {}
        obj2 = {}
      }
    }

    retval["success"] = true
    retval["time_stamp"] = Date.now()
    retval["data"] = arr.map((item) => item.train_base)

    return retval
  } catch (err) {
    return {
      success: false,
      time_stamp: Date.now(),
      data: "Error parsing train data",
    }
  }
}
