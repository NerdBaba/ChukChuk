export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const trainNo = searchParams.get("trainNo")

  if (!trainNo) {
    return Response.json(
      {
        success: false,
        time_stamp: Date.now(),
        data: "Train number is required",
      },
      { status: 400 },
    )
  }

  try {
    // First get train information to get train_id
    let URL_Train = `https://erail.in/rail/getTrains.aspx?TrainNo=${trainNo}&DataSource=0&Language=0&Cache=true`
    let response = await fetch(URL_Train, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    })
    let data = await response.text()
    let json = checkTrain(data)

    if (!json["success"]) {
      return Response.json(json)
    }

    // Get route information using train_id
    URL_Train = `https://erail.in/data.aspx?Action=TRAINROUTE&Password=2012&Data1=${json["data"]["train_id"]}&Data2=0&Cache=true`
    response = await fetch(URL_Train, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    })
    data = await response.text()
    json = getRoute(data)

    return Response.json(json)
  } catch (error) {
    return Response.json(
      {
        success: false,
        time_stamp: Date.now(),
        data: "Failed to fetch route data",
      },
      { status: 500 },
    )
  }
}

function checkTrain(string: string) {
  try {
    const obj: any = {}
    const retval: any = {}
    const data = string.split("~~~~~~~~")

    if (data[0] === "~~~~~Please try again after some time." || data[0] === "~~~~~Train not found") {
      retval["success"] = false
      retval["time_stamp"] = Date.now()
      retval["data"] = data[0].replaceAll("~", "")
      return retval
    }

    let data1 = data[0].split("~")
    data1 = data1.filter((el) => el !== "")

    if (data1[1].length > 6) {
      data1.shift()
    }

    obj["train_no"] = data1[1].replace("^", "")
    obj["train_name"] = data1[2]
    obj["from_stn_name"] = data1[3]
    obj["from_stn_code"] = data1[4]
    obj["to_stn_name"] = data1[5]
    obj["to_stn_code"] = data1[6]
    obj["from_time"] = data1[11]
    obj["to_time"] = data1[12]
    obj["travel_time"] = data1[13]
    obj["running_days"] = data1[14]

    data1 = data[1].split("~")
    data1 = data1.filter((el) => el !== "")

    obj["type"] = data1[11]
    obj["train_id"] = data1[12]
    obj["distance_from_to"] = data1[18]
    obj["average_speed"] = data1[19]

    retval["success"] = true
    retval["time_stamp"] = Date.now()
    retval["data"] = obj

    return retval
  } catch (err) {
    return {
      success: false,
      time_stamp: Date.now(),
      data: "Error parsing train data",
    }
  }
}

function getRoute(string: string) {
  try {
    const data = string.split("~^")
    const arr: any[] = []
    let obj: any = {}
    const retval: any = {}

    for (let i = 0; i < data.length; i++) {
      let data1 = data[i].split("~")
      data1 = data1.filter((el) => el !== "")

      if (data1.length >= 10) {
        obj["source_stn_name"] = data1[2]
        obj["source_stn_code"] = data1[1]
        obj["arrive"] = data1[3]
        obj["depart"] = data1[4]
        obj["distance"] = data1[6]
        obj["day"] = data1[7]
        obj["zone"] = data1[9]
        arr.push(obj)
        obj = {}
      }
    }

    retval["success"] = true
    retval["time_stamp"] = Date.now()
    retval["data"] = arr

    return retval
  } catch (err) {
    return {
      success: false,
      time_stamp: Date.now(),
      data: "Error parsing route data",
    }
  }
}
