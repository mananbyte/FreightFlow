const date = "2026-07-23";
const getX = (isoString) => {
    let localTimeStr = isoString;
    if (localTimeStr.includes('Z')) {
      localTimeStr = localTimeStr.replace('Z', '');
    } else {
      localTimeStr = localTimeStr.replace(/[+-]\d{2}:\d{2}$/, '');
    }
    
    const dateObj = new Date(`${localTimeStr}Z`);
    const dayStart = new Date(`${date}T00:00:00Z`);
    
    let elapsedMs = dateObj.getTime() - dayStart.getTime();
    console.log(isoString, "->", elapsedMs / (3600*1000), "hours");
}
getX("2026-07-23T08:00:00");
getX("2026-07-23T08:00:00Z");
getX("2026-07-23T08:00:00+05:00");
getX("2026-07-24T00:00:00");
