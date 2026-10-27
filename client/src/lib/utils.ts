import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, isToday, isTomorrow, isYesterday } from "date-fns";
import { parsePhoneNumber } from "libphonenumber-js";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPhoneNumber(phone: string): string {
  if (!phone) return "";
  
  try {
    const phoneNumber = parsePhoneNumber(phone);
    if (phoneNumber) {
      return phoneNumber.formatInternational();
    }
  } catch (error) {
    // If parsing fails, return the original
  }
  
  return phone;
}

export function formatLastContact(date: Date | string | null): string {
  if (!date) return "Never";
  
  const contactDate = new Date(date);
  
  if (isToday(contactDate)) {
    return "Today";
  } else if (isYesterday(contactDate)) {
    return "Yesterday";
  } else if (isTomorrow(contactDate)) {
    return "Tomorrow";
  } else {
    return formatDistanceToNow(contactDate, { addSuffix: true });
  }
}

export function formatReminderDate(date: Date | string): string {
  const reminderDate = new Date(date);
  
  if (isToday(reminderDate)) {
    return `Today at ${format(reminderDate, 'h:mm a')}`;
  } else if (isTomorrow(reminderDate)) {
    return `Tomorrow at ${format(reminderDate, 'h:mm a')}`;
  } else if (isYesterday(reminderDate)) {
    return `Yesterday at ${format(reminderDate, 'h:mm a')}`;
  } else {
    return format(reminderDate, 'MMM d, yyyy \'at\' h:mm a');
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "dating":
      return "bg-pink-100 text-pink-800";
    case "exclusive":
      return "bg-purple-100 text-purple-800";
    case "open-relationship":
      return "bg-blue-100 text-blue-800";
    case "friends-with-benefits":
      return "bg-orange-100 text-orange-800";
    case "long-distance":
      return "bg-pink-100 text-pink-800";
    case "friends":
      return "bg-green-100 text-green-800";
    case "no-longer-talking":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export function formatRelationshipStatus(status: string): string {
  switch (status) {
    case "dating":
      return "Dating";
    case "exclusive":
      return "Exclusive";
    case "open-relationship":
      return "Open Relationship";
    case "friends-with-benefits":
      return "Friends with Benefits";
    case "long-distance":
      return "Long Distance";
    case "friends":
      return "Friends";
    case "no-longer-talking":
      return "Ended";
    default:
      return status.charAt(0).toUpperCase() + status.slice(1);
  }
}

export function getStatusDotColor(status: string): string {
  switch (status) {
    case "dating":
      return "bg-pink-400";
    case "exclusive":
      return "bg-purple-400";
    case "open-relationship":
      return "bg-blue-400";
    case "friends-with-benefits":
      return "bg-orange-400";
    case "long-distance":
      return "bg-pink-400";
    case "friends":
      return "bg-green-400";
    case "no-longer-talking":
      return "bg-gray-400";
    default:
      return "bg-gray-400";
  }
}



export function getReminderTypeIcon(type: string): string {
  switch (type) {
    case "birthday":
      return "🎂";
    case "anniversary":
      return "💕";
    case "date":
      return "💝";
    case "call":
      return "📞";
    case "text":
      return "💬";
    default:
      return "⏰";
  }
}

export function getReminderTypeColor(type: string): string {
  switch (type) {
    case "birthday":
      return "bg-pink-50 border-pink-200";
    case "anniversary":
      return "bg-purple-50 border-purple-200";
    case "date":
      return "bg-red-50 border-red-200";
    case "call":
      return "bg-blue-50 border-blue-200";
    case "text":
      return "bg-green-50 border-green-200";
    default:
      return "bg-gray-50 border-gray-200";
  }
}

export function getReminderIconColor(type: string): string {
  switch (type) {
    case "birthday":
      return "text-pink-600";
    case "anniversary":
      return "text-purple-600";
    case "date":
      return "text-red-600";
    case "call":
      return "text-blue-600";
    case "text":
      return "text-green-600";
    default:
      return "text-gray-600";
  }
}

export function getCountryFlagFromPhone(phone: string): string {
  if (!phone) return "";
  
  // Remove all non-digits and get the country code
  const digits = phone.replace(/\D/g, "");
  
  // Map common country codes to flag emojis
  const countryCodeMap: { [key: string]: string } = {
    // NANP (North American Numbering Plan) - More specific area codes first
    // Caribbean countries with +1 prefix
    "1242": "🇧🇸", // Bahamas
    "1246": "🇧🇧", // Barbados
    "1264": "🇦🇮", // Anguilla
    "1268": "🇦🇬", // Antigua and Barbuda
    "1284": "🇻🇬", // British Virgin Islands
    "1340": "🇻🇮", // US Virgin Islands
    "1345": "🇰🇾", // Cayman Islands
    "1441": "🇧🇲", // Bermuda
    "1473": "🇬🇩", // Grenada
    "1649": "🇹🇨", // Turks and Caicos
    "1664": "🇲🇸", // Montserrat
    "1670": "🇲🇵", // Northern Mariana Islands
    "1671": "🇬🇺", // Guam
    "1684": "🇦🇸", // American Samoa
    "1721": "🇸🇽", // Sint Maarten
    "1758": "🇱🇨", // Saint Lucia
    "1767": "🇩🇲", // Dominica
    "1784": "🇻🇨", // Saint Vincent and the Grenadines
    "1787": "🇵🇷", // Puerto Rico
    "1809": "🇩🇴", // Dominican Republic
    "1829": "🇩🇴", // Dominican Republic
    "1849": "🇩🇴", // Dominican Republic
    "1868": "🇹🇹", // Trinidad and Tobago
    "1869": "🇰🇳", // Saint Kitts and Nevis
    "1876": "🇯🇲", // Jamaica
    "1939": "🇵🇷", // Puerto Rico
    
    // US/Canada area codes (some examples)
    "1201": "🇺🇸", "1202": "🇺🇸", "1203": "🇺🇸", "1204": "🇨🇦", "1205": "🇺🇸",
    "1206": "🇺🇸", "1207": "🇺🇸", "1208": "🇺🇸", "1209": "🇺🇸", "1210": "🇺🇸",
    "1212": "🇺🇸", "1213": "🇺🇸", "1214": "🇺🇸", "1215": "🇺🇸", "1216": "🇺🇸",
    "1217": "🇺🇸", "1218": "🇺🇸", "1219": "🇺🇸", "1224": "🇺🇸", "1225": "🇺🇸",
    "1226": "🇨🇦", "1228": "🇺🇸", "1229": "🇺🇸", "1231": "🇺🇸", "1234": "🇺🇸",
    "1236": "🇨🇦", "1239": "🇺🇸", "1240": "🇺🇸", "1248": "🇺🇸", "1249": "🇨🇦",
    "1250": "🇨🇦", "1251": "🇺🇸", "1252": "🇺🇸", "1253": "🇺🇸", "1254": "🇺🇸",
    "1256": "🇺🇸", "1260": "🇺🇸", "1262": "🇺🇸", "1267": "🇺🇸", "1269": "🇺🇸",
    "1270": "🇺🇸", "1272": "🇺🇸", "1274": "🇺🇸", "1276": "🇺🇸", "1281": "🇺🇸",
    "1289": "🇨🇦", "1301": "🇺🇸", "1302": "🇺🇸", "1303": "🇺🇸", "1304": "🇺🇸",
    "1305": "🇺🇸", "1306": "🇨🇦", "1307": "🇺🇸", "1308": "🇺🇸", "1309": "🇺🇸",
    "1310": "🇺🇸", "1312": "🇺🇸", "1313": "🇺🇸", "1314": "🇺🇸", "1315": "🇺🇸",
    "1316": "🇺🇸", "1317": "🇺🇸", "1318": "🇺🇸", "1319": "🇺🇸", "1320": "🇺🇸",
    "1321": "🇺🇸", "1323": "🇺🇸", "1325": "🇺🇸", "1330": "🇺🇸", "1331": "🇺🇸",
    "1334": "🇺🇸", "1336": "🇺🇸", "1337": "🇺🇸", "1339": "🇺🇸", "1347": "🇺🇸",
    "1351": "🇺🇸", "1352": "🇺🇸", "1360": "🇺🇸", "1361": "🇺🇸", "1364": "🇺🇸",
    "1365": "🇨🇦", "1367": "🇨🇦", "1385": "🇺🇸", "1386": "🇺🇸", "1401": "🇺🇸",
    "1402": "🇺🇸", "1403": "🇨🇦", "1404": "🇺🇸", "1405": "🇺🇸", "1406": "🇺🇸",
    "1407": "🇺🇸", "1408": "🇺🇸", "1409": "🇺🇸", "1410": "🇺🇸", "1412": "🇺🇸",
    "1413": "🇺🇸", "1414": "🇺🇸", "1415": "🇺🇸", "1416": "🇨🇦", "1417": "🇺🇸",
    "1418": "🇨🇦", "1419": "🇺🇸", "1423": "🇺🇸", "1424": "🇺🇸", "1425": "🇺🇸",
    "1430": "🇺🇸", "1432": "🇺🇸", "1434": "🇺🇸", "1435": "🇺🇸", "1440": "🇺🇸",
    "1442": "🇺🇸", "1443": "🇺🇸", "1445": "🇺🇸", "1450": "🇨🇦", "1458": "🇺🇸",
    "1463": "🇺🇸", "1469": "🇺🇸", "1470": "🇺🇸", "1475": "🇺🇸", "1478": "🇺🇸",
    "1479": "🇺🇸", "1480": "🇺🇸", "1484": "🇺🇸", "1501": "🇺🇸", "1502": "🇺🇸",
    "1503": "🇺🇸", "1504": "🇺🇸", "1505": "🇺🇸", "1506": "🇨🇦", "1507": "🇺🇸",
    "1508": "🇺🇸", "1509": "🇺🇸", "1510": "🇺🇸", "1512": "🇺🇸", "1513": "🇺🇸",
    "1514": "🇨🇦", "1515": "🇺🇸", "1516": "🇺🇸", "1517": "🇺🇸", "1518": "🇺🇸",
    "1519": "🇨🇦", "1520": "🇺🇸", "1530": "🇺🇸", "1531": "🇺🇸", "1534": "🇺🇸",
    "1539": "🇺🇸", "1540": "🇺🇸", "1541": "🇺🇸", "1548": "🇨🇦", "1551": "🇺🇸",
    "1559": "🇺🇸", "1561": "🇺🇸", "1562": "🇺🇸", "1563": "🇺🇸", "1564": "🇺🇸",
    "1567": "🇺🇸", "1570": "🇺🇸", "1571": "🇺🇸", "1573": "🇺🇸", "1574": "🇺🇸",
    "1575": "🇺🇸", "1580": "🇺🇸", "1581": "🇨🇦", "1585": "🇺🇸", "1586": "🇺🇸",
    "1587": "🇨🇦", "1601": "🇺🇸", "1602": "🇺🇸", "1603": "🇺🇸", "1604": "🇨🇦",
    "1605": "🇺🇸", "1606": "🇺🇸", "1607": "🇺🇸", "1608": "🇺🇸", "1609": "🇺🇸",
    "1610": "🇺🇸", "1612": "🇺🇸", "1613": "🇨🇦", "1614": "🇺🇸", "1615": "🇺🇸",
    "1616": "🇺🇸", "1617": "🇺🇸", "1618": "🇺🇸", "1619": "🇺🇸", "1620": "🇺🇸",
    "1623": "🇺🇸", "1626": "🇺🇸", "1628": "🇺🇸", "1629": "🇺🇸", "1630": "🇺🇸",
    "1631": "🇺🇸", "1636": "🇺🇸", "1641": "🇺🇸", "1646": "🇺🇸", "1647": "🇨🇦",
    "1650": "🇺🇸", "1651": "🇺🇸", "1657": "🇺🇸", "1660": "🇺🇸", "1661": "🇺🇸",
    "1662": "🇺🇸", "1667": "🇺🇸", "1669": "🇺🇸", "1678": "🇺🇸", "1681": "🇺🇸",
    "1682": "🇺🇸", "1689": "🇺🇸", "1701": "🇺🇸", "1702": "🇺🇸", "1703": "🇺🇸",
    "1704": "🇺🇸", "1705": "🇨🇦", "1706": "🇺🇸", "1707": "🇺🇸", "1708": "🇺🇸",
    "1709": "🇨🇦", "1712": "🇺🇸", "1713": "🇺🇸", "1714": "🇺🇸", "1715": "🇺🇸",
    "1716": "🇺🇸", "1717": "🇺🇸", "1718": "🇺🇸", "1719": "🇺🇸", "1720": "🇺🇸",
    "1724": "🇺🇸", "1725": "🇺🇸", "1726": "🇺🇸", "1727": "🇺🇸", "1731": "🇺🇸",
    "1732": "🇺🇸", "1734": "🇺🇸", "1737": "🇺🇸", "1740": "🇺🇸", "1743": "🇺🇸",
    "1747": "🇺🇸", "1754": "🇺🇸", "1757": "🇺🇸", "1760": "🇺🇸", "1762": "🇺🇸",
    "1763": "🇺🇸", "1764": "🇺🇸", "1765": "🇺🇸", "1769": "🇺🇸", "1770": "🇺🇸",
    "1772": "🇺🇸", "1773": "🇺🇸", "1774": "🇺🇸", "1775": "🇺🇸", "1778": "🇨🇦",
    "1779": "🇺🇸", "1780": "🇨🇦", "1781": "🇺🇸", "1785": "🇺🇸", "1786": "🇺🇸",
    "1801": "🇺🇸", "1802": "🇺🇸", "1803": "🇺🇸", "1804": "🇺🇸", "1805": "🇺🇸",
    "1806": "🇺🇸", "1807": "🇨🇦", "1808": "🇺🇸", "1810": "🇺🇸", "1812": "🇺🇸",
    "1813": "🇺🇸", "1814": "🇺🇸", "1815": "🇺🇸", "1816": "🇺🇸", "1817": "🇺🇸",
    "1818": "🇺🇸", "1819": "🇨🇦", "1820": "🇺🇸", "1825": "🇨🇦", "1828": "🇺🇸",
    "1830": "🇺🇸", "1831": "🇺🇸", "1832": "🇺🇸", "1843": "🇺🇸", "1845": "🇺🇸",
    "1847": "🇺🇸", "1848": "🇺🇸", "1850": "🇺🇸", "1856": "🇺🇸", "1857": "🇺🇸",
    "1858": "🇺🇸", "1859": "🇺🇸", "1860": "🇺🇸", "1862": "🇺🇸", "1863": "🇺🇸",
    "1864": "🇺🇸", "1865": "🇺🇸", "1870": "🇺🇸", "1872": "🇺🇸", "1878": "🇺🇸",
    "1901": "🇺🇸", "1902": "🇨🇦", "1903": "🇺🇸", "1904": "🇺🇸", "1905": "🇨🇦",
    "1906": "🇺🇸", "1907": "🇺🇸", "1908": "🇺🇸", "1909": "🇺🇸", "1910": "🇺🇸",
    "1912": "🇺🇸", "1913": "🇺🇸", "1914": "🇺🇸", "1915": "🇺🇸", "1916": "🇺🇸",
    "1917": "🇺🇸", "1918": "🇺🇸", "1919": "🇺🇸", "1920": "🇺🇸", "1925": "🇺🇸",
    "1928": "🇺🇸", "1929": "🇺🇸", "1930": "🇺🇸", "1931": "🇺🇸", "1934": "🇺🇸",
    "1936": "🇺🇸", "1937": "🇺🇸", "1940": "🇺🇸", "1941": "🇺🇸", "1947": "🇺🇸",
    "1949": "🇺🇸", "1951": "🇺🇸", "1952": "🇺🇸", "1954": "🇺🇸", "1956": "🇺🇸",
    "1959": "🇺🇸", "1970": "🇺🇸", "1971": "🇺🇸", "1972": "🇺🇸", "1973": "🇺🇸",
    "1978": "🇺🇸", "1979": "🇺🇸", "1980": "🇺🇸", "1984": "🇺🇸", "1985": "🇺🇸",
    "1989": "🇺🇸",
    
    // Generic fallback for remaining +1 numbers
    "1": "🇺🇸", // US/Canada (fallback)
    
    // South America
    "54": "🇦🇷", // Argentina
    "55": "🇧🇷", // Brazil
    "56": "🇨🇱", // Chile
    "57": "🇨🇴", // Colombia
    "58": "🇻🇪", // Venezuela
    "593": "🇪🇨", // Ecuador
    "594": "🇬🇫", // French Guiana
    "595": "🇵🇾", // Paraguay
    "596": "🇲🇶", // Martinique
    "597": "🇸🇷", // Suriname
    "598": "🇺🇾", // Uruguay
    
    // Europe
    "33": "🇫🇷", // France
    "34": "🇪🇸", // Spain
    "39": "🇮🇹", // Italy
    "44": "🇬🇧", // UK
    "49": "🇩🇪", // Germany
    "351": "🇵🇹", // Portugal
    "352": "🇱🇺", // Luxembourg
    "353": "🇮🇪", // Ireland
    "354": "🇮🇸", // Iceland
    "355": "🇦🇱", // Albania
    "356": "🇲🇹", // Malta
    "357": "🇨🇾", // Cyprus
    "358": "🇫🇮", // Finland
    "359": "🇧🇬", // Bulgaria
    "36": "🇭🇺", // Hungary
    "370": "🇱🇹", // Lithuania
    "371": "🇱🇻", // Latvia
    "372": "🇪🇪", // Estonia
    "373": "🇲🇩", // Moldova
    "374": "🇦🇲", // Armenia
    "375": "🇧🇾", // Belarus
    "376": "🇦🇩", // Andorra
    "377": "🇲🇨", // Monaco
    "378": "🇸🇲", // San Marino
    "380": "🇺🇦", // Ukraine
    "381": "🇷🇸", // Serbia
    "382": "🇲🇪", // Montenegro
    "383": "🇽🇰", // Kosovo
    "385": "🇭🇷", // Croatia
    "386": "🇸🇮", // Slovenia
    "387": "🇧🇦", // Bosnia and Herzegovina
    "389": "🇲🇰", // North Macedonia
    "41": "🇨🇭", // Switzerland
    "420": "🇨🇿", // Czech Republic
    "421": "🇸🇰", // Slovakia
    "43": "🇦🇹", // Austria
    "45": "🇩🇰", // Denmark
    "46": "🇸🇪", // Sweden
    "47": "🇳🇴", // Norway
    "48": "🇵🇱", // Poland
    "7": "🇷🇺", // Russia
    "90": "🇹🇷", // Turkey
    "31": "🇳🇱", // Netherlands
    "32": "🇧🇪", // Belgium
    
    // Asia
    "81": "🇯🇵", // Japan
    "82": "🇰🇷", // South Korea
    "86": "🇨🇳", // China
    "91": "🇮🇳", // India
    "92": "🇵🇰", // Pakistan
    "93": "🇦🇫", // Afghanistan
    "94": "🇱🇰", // Sri Lanka
    "95": "🇲🇲", // Myanmar
    "98": "🇮🇷", // Iran
    "60": "🇲🇾", // Malaysia
    "61": "🇦🇺", // Australia
    "62": "🇮🇩", // Indonesia
    "63": "🇵🇭", // Philippines
    "64": "🇳🇿", // New Zealand
    "65": "🇸🇬", // Singapore
    "66": "🇹🇭", // Thailand
    "84": "🇻🇳", // Vietnam
    "852": "🇭🇰", // Hong Kong
    "853": "🇲🇴", // Macau
    "886": "🇹🇼", // Taiwan
    
    // Middle East
    "962": "🇯🇴", // Jordan
    "963": "🇸🇾", // Syria
    "964": "🇮🇶", // Iraq
    "965": "🇰🇼", // Kuwait
    "966": "🇸🇦", // Saudi Arabia
    "967": "🇾🇪", // Yemen
    "968": "🇴🇲", // Oman
    "971": "🇦🇪", // UAE
    "972": "🇮🇱", // Israel
    "973": "🇧🇭", // Bahrain
    "974": "🇶🇦", // Qatar
    "975": "🇧🇹", // Bhutan
    "976": "🇲🇳", // Mongolia
    "977": "🇳🇵", // Nepal
    "20": "🇪🇬", // Egypt
    "212": "🇲🇦", // Morocco
    "213": "🇩🇿", // Algeria
    "216": "🇹🇳", // Tunisia
    "218": "🇱🇾", // Libya
    "220": "🇬🇲", // Gambia
    "221": "🇸🇳", // Senegal
    "222": "🇲🇷", // Mauritania
    "223": "🇲🇱", // Mali
    "224": "🇬🇳", // Guinea
    "225": "🇨🇮", // Ivory Coast
    "226": "🇧🇫", // Burkina Faso
    "227": "🇳🇪", // Niger
    "228": "🇹🇬", // Togo
    "229": "🇧🇯", // Benin
    "230": "🇲🇺", // Mauritius
    "231": "🇱🇷", // Liberia
    "232": "🇸🇱", // Sierra Leone
    "233": "🇬🇭", // Ghana
    "234": "🇳🇬", // Nigeria
    "235": "🇹🇩", // Chad
    "236": "🇨🇫", // Central African Republic
    "237": "🇨🇲", // Cameroon
    "238": "🇨🇻", // Cape Verde
    "239": "🇸🇹", // São Tomé and Príncipe
    "240": "🇬🇶", // Equatorial Guinea
    "241": "🇬🇦", // Gabon
    "242": "🇨🇬", // Republic of the Congo
    "243": "🇨🇩", // Democratic Republic of the Congo
    "244": "🇦🇴", // Angola
    "245": "🇬🇼", // Guinea-Bissau
    "246": "🇮🇴", // British Indian Ocean Territory
    "248": "🇸🇨", // Seychelles
    "249": "🇸🇩", // Sudan
    "250": "🇷🇼", // Rwanda
    "251": "🇪🇹", // Ethiopia
    "252": "🇸🇴", // Somalia
    "253": "🇩🇯", // Djibouti
    "254": "🇰🇪", // Kenya
    "255": "🇹🇿", // Tanzania
    "256": "🇺🇬", // Uganda
    "257": "🇧🇮", // Burundi
    "258": "🇲🇿", // Mozambique
    "260": "🇿🇲", // Zambia
    "261": "🇲🇬", // Madagascar
    "262": "🇷🇪", // Réunion
    "263": "🇿🇼", // Zimbabwe
    "264": "🇳🇦", // Namibia
    "265": "🇲🇼", // Malawi
    "266": "🇱🇸", // Lesotho
    "267": "🇧🇼", // Botswana
    "268": "🇸🇿", // Eswatini
    "269": "🇰🇲", // Comoros
    "27": "🇿🇦", // South Africa
    "290": "🇸🇭", // Saint Helena
    "291": "🇪🇷", // Eritrea
    "297": "🇦🇼", // Aruba
    "298": "🇫🇴", // Faroe Islands
    "299": "🇬🇱", // Greenland
    
    // Central America & Caribbean
    "501": "🇧🇿", // Belize
    "502": "🇬🇹", // Guatemala
    "503": "🇸🇻", // El Salvador
    "504": "🇭🇳", // Honduras
    "505": "🇳🇮", // Nicaragua
    "506": "🇨🇷", // Costa Rica
    "507": "🇵🇦", // Panama
    "508": "🇵🇲", // Saint Pierre and Miquelon
    "509": "🇭🇹", // Haiti
    "590": "🇬🇵", // Guadeloupe
    "591": "🇧🇴", // Bolivia
    "592": "🇬🇾", // Guyana
  };
  
  // Try to match country codes in order of length (longest first)
  const codes = Object.keys(countryCodeMap).sort((a, b) => b.length - a.length);
  
  for (const code of codes) {
    if (digits.startsWith(code)) {
      return countryCodeMap[code];
    }
  }
  
  return ""; // No flag found
}
