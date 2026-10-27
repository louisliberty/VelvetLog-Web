import { useState, useEffect } from "react";
import { parsePhoneNumber, AsYouType } from "libphonenumber-js";
import { Input } from "@/components/ui/input";

interface SmartPhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  className?: string;
  required?: boolean;
}

const countryNames: Record<string, string> = {
  'US': 'United States',
  'GB': 'United Kingdom',
  'CA': 'Canada',
  'AU': 'Australia',
  'DE': 'Germany',
  'FR': 'France',
  'IT': 'Italy',
  'ES': 'Spain',
  'JP': 'Japan',
  'CN': 'China',
  'IN': 'India',
  'BR': 'Brazil',
  'MX': 'Mexico',
  'RU': 'Russia',
  'KR': 'South Korea',
  'NL': 'Netherlands',
  'SE': 'Sweden',
  'NO': 'Norway',
  'DK': 'Denmark',
  'FI': 'Finland',
  'PL': 'Poland',
  'CH': 'Switzerland',
  'AT': 'Austria',
  'BE': 'Belgium',
  'IE': 'Ireland',
  'PT': 'Portugal',
  'GR': 'Greece',
  'CZ': 'Czech Republic',
  'HU': 'Hungary',
  'IL': 'Israel',
  'ZA': 'South Africa',
  'EG': 'Egypt',
  'NG': 'Nigeria',
  'KE': 'Kenya',
  'TH': 'Thailand',
  'VN': 'Vietnam',
  'PH': 'Philippines',
  'MY': 'Malaysia',
  'SG': 'Singapore',
  'HK': 'Hong Kong',
  'TW': 'Taiwan',
  'AR': 'Argentina',
  'CL': 'Chile',
  'CO': 'Colombia',
  'PE': 'Peru',
  'VE': 'Venezuela',
  'UY': 'Uruguay',
  'EC': 'Ecuador',
  'BO': 'Bolivia',
  'CR': 'Costa Rica',
  'GT': 'Guatemala',
  'HN': 'Honduras',
  'NI': 'Nicaragua',
  'PA': 'Panama',
  'SV': 'El Salvador',
  'BZ': 'Belize',
  'JM': 'Jamaica',
  'TT': 'Trinidad and Tobago',
  'BB': 'Barbados',
  'BS': 'Bahamas',
  'CU': 'Cuba',
  'DO': 'Dominican Republic',
  'HT': 'Haiti',
  'PR': 'Puerto Rico',
  'AD': 'Andorra',
  'AL': 'Albania',
  'AM': 'Armenia',
  'AZ': 'Azerbaijan',
  'BA': 'Bosnia and Herzegovina',
  'BG': 'Bulgaria',
  'BY': 'Belarus',
  'EE': 'Estonia',
  'GE': 'Georgia',
  'HR': 'Croatia',
  'IS': 'Iceland',
  'LI': 'Liechtenstein',
  'LT': 'Lithuania',
  'LU': 'Luxembourg',
  'LV': 'Latvia',
  'MC': 'Monaco',
  'MD': 'Moldova',
  'ME': 'Montenegro',
  'MK': 'North Macedonia',
  'MT': 'Malta',
  'RO': 'Romania',
  'RS': 'Serbia',
  'SI': 'Slovenia',
  'SK': 'Slovakia',
  'SM': 'San Marino',
  'UA': 'Ukraine',
  'VA': 'Vatican City',
  'XK': 'Kosovo',
};



export function SmartPhoneInput({ value, onChange, placeholder, maxLength = 25, className, required }: SmartPhoneInputProps) {
  const [detectedCountry, setDetectedCountry] = useState<string | null>(null);
  const [formattedValue, setFormattedValue] = useState(value);

  // Auto-detect country from phone number
  useEffect(() => {
    if (value && value.trim()) {
      try {
        const phoneNumber = parsePhoneNumber(value);
        if (phoneNumber && phoneNumber.country) {
          setDetectedCountry(phoneNumber.country);
        }
      } catch (error) {
        // If parsing fails, try to format as incomplete number
        try {
          const formatter = new AsYouType();
          const formatted = formatter.input(value);
          setFormattedValue(formatted);
          
          if (formatter.getNumber()?.country) {
            setDetectedCountry(formatter.getNumber()!.country);
          }
        } catch (e) {
          // If all parsing fails, keep the original value
          setFormattedValue(value);
        }
      }
    } else {
      setDetectedCountry(null);
      setFormattedValue(value);
    }
  }, [value]);

  const handlePhoneChange = (inputValue: string) => {
    // Remove any characters that aren't allowed
    let cleaned = inputValue.replace(/[^\d\s\-\(\)\+]/g, '');
    
    // Ensure it always starts with a + if not empty and doesn't already have one
    if (cleaned && !cleaned.startsWith('+')) {
      cleaned = '+' + cleaned;
    }
    
    // Handle the case where user tries to type a second + at the beginning
    if (cleaned.startsWith('++')) {
      cleaned = cleaned.substring(1); // Remove the extra +
    }
    
    try {
      // Always try to detect country from the input
      const formatter = new AsYouType();
      const formatted = formatter.input(cleaned);
      const detectedCountry = formatter.getNumber()?.country;
      
      // Update country if detected
      if (detectedCountry) {
        setDetectedCountry(detectedCountry);
        setFormattedValue(formatted);
        onChange(formatted);
      } else {
        // No country detected, use cleaned value
        setFormattedValue(cleaned);
        onChange(cleaned);
        setDetectedCountry(null);
      }
    } catch (error) {
      // If formatting fails, use the cleaned value
      setFormattedValue(cleaned);
      onChange(cleaned);
      setDetectedCountry(null);
    }
  };



  const getCountryFlag = (countryCode: string) => {
    const flags: Record<string, string> = {
      'US': '🇺🇸', 'GB': '🇬🇧', 'CA': '🇨🇦', 'AU': '🇦🇺', 'DE': '🇩🇪',
      'FR': '🇫🇷', 'IT': '🇮🇹', 'ES': '🇪🇸', 'JP': '🇯🇵', 'CN': '🇨🇳',
      'IN': '🇮🇳', 'BR': '🇧🇷', 'MX': '🇲🇽', 'RU': '🇷🇺', 'KR': '🇰🇷',
      'NL': '🇳🇱', 'SE': '🇸🇪', 'NO': '🇳🇴', 'DK': '🇩🇰', 'FI': '🇫🇮',
      'PL': '🇵🇱', 'CH': '🇨🇭', 'AT': '🇦🇹', 'BE': '🇧🇪', 'IE': '🇮🇪',
      'PT': '🇵🇹', 'GR': '🇬🇷', 'CZ': '🇨🇿', 'HU': '🇭🇺', 'IL': '🇮🇱',
      'ZA': '🇿🇦', 'EG': '🇪🇬', 'NG': '🇳🇬', 'KE': '🇰🇪', 'TH': '🇹🇭',
      'VN': '🇻🇳', 'PH': '🇵🇭', 'MY': '🇲🇾', 'SG': '🇸🇬', 'HK': '🇭🇰',
      'TW': '🇹🇼', 'AR': '🇦🇷', 'CL': '🇨🇱', 'CO': '🇨🇴', 'PE': '🇵🇪',
      'CR': '🇨🇷', 'GT': '🇬🇹', 'HN': '🇭🇳', 'NI': '🇳🇮', 'PA': '🇵🇦',
      'SV': '🇸🇻', 'BZ': '🇧🇿', 'JM': '🇯🇲', 'TT': '🇹🇹', 'BB': '🇧🇧',
      'BS': '🇧🇸', 'CU': '🇨🇺', 'DO': '🇩🇴', 'HT': '🇭🇹', 'PR': '🇵🇷',
      'VE': '🇻🇪', 'UY': '🇺🇾', 'EC': '🇪🇨', 'BO': '🇧🇴',
    };
    return flags[countryCode] || '🌍';
  };

  const displayValue = formattedValue.startsWith('+') ? formattedValue.substring(1) : formattedValue;

  return (
    <div className="flex space-x-2 items-center">
      <div className="relative flex-1">
        <Input
          type="tel"
          value={displayValue}
          onChange={(e) => handlePhoneChange(e.target.value)}
          placeholder={placeholder || "1 234 567 8900"}
          maxLength={maxLength}
          className={`${className} pl-6`}
          required={required}
        />
        <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
          +
        </span>
      </div>
      
      {detectedCountry && (
        <div className="flex items-center space-x-1 px-2 py-1 bg-gray-50 dark:bg-gray-800 rounded text-xs text-gray-600 dark:text-gray-300 min-w-fit">
          <span>{getCountryFlag(detectedCountry)}</span>
          <span>{countryNames[detectedCountry] || detectedCountry}</span>
        </div>
      )}
    </div>
  );
}